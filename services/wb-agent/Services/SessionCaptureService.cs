using Npgsql;
using Microsoft.Extensions.Options;
using WServerApi.Models;
using WServerApi.Models.Domain;

namespace WServerApi.Services;

public sealed class SessionCaptureService : BackgroundService
{
    private readonly ILogger<SessionCaptureService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly WsClient _wsClient;
    private readonly string? _connectionString;
    private readonly string? _siteCode;
    private Guid _siteId;
    private readonly bool _enabled;
    private readonly TimeSpan _interval;
    private readonly int _timeoutSeconds;
    private readonly int _modeDelayMs;
    private readonly string _direction;
    private readonly string? _locationCode;
    private readonly SemaphoreSlim _captureLock = new(1, 1);

    public SessionCaptureService(
        ILogger<SessionCaptureService> logger,
        IServiceScopeFactory scopeFactory,
        WsClient wsClient,
        IOptions<WbOptions> wbOptions,
        IConfiguration config)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
        _wsClient = wsClient;
        var options = wbOptions.Value;
        _connectionString = NormalizePostgresConnectionString(
            Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? config.GetConnectionString("PostgresDatabase"));
        _enabled = GetBool(config, "WB_SESSION_LISTENER_ENABLED", options.SessionListenerEnabled);
        _interval = TimeSpan.FromSeconds(GetInt(config, "WB_SESSION_INTERVAL_SEC", options.SessionIntervalSec));
        _timeoutSeconds = NormalizeTimeout(GetInt(config, "WB_CAPTURE_TIMEOUT_SEC", options.CaptureTimeoutSec));
        _modeDelayMs = Math.Max(0, GetInt(config, "WB_CAPTURE_MODE_DELAY_MS", options.CaptureModeDelayMs));
        _direction = NormalizeDirection(
            config["WB_CAPTURE_DIRECTION"]
            ?? Environment.GetEnvironmentVariable("WB_CAPTURE_DIRECTION")
            ?? options.CaptureDirection);
        _locationCode = config["WB_LOCATION_CODE"]
            ?? Environment.GetEnvironmentVariable("WB_LOCATION_CODE")
            ?? options.LocationCode;

        _siteCode = Environment.GetEnvironmentVariable("SITE_CODE")
            ?? config["SITE_CODE"]
            ?? Environment.GetEnvironmentVariable("WB_SITE_CODE")
            ?? config["WB_SITE_CODE"]
            ?? options.SiteCode;

        var rawSiteId = Environment.GetEnvironmentVariable("WB_SITE_ID")
            ?? config["WB_SITE_ID"]
            ?? Environment.GetEnvironmentVariable("NEXT_PUBLIC_SITE_ID")
            ?? options.SiteId;

        _siteId = Guid.TryParse(rawSiteId, out var parsed) ? parsed : Guid.Empty;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_enabled)
        {
            _logger.LogInformation("WB session listener disabled.");
            return;
        }

        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            _logger.LogWarning("WB session listener missing DATABASE_URL.");
            return;
        }
        var loggedReady = false;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (_siteId == Guid.Empty)
                {
                    _siteId = await ResolveConfiguredSiteIdAsync(stoppingToken);
                    if (_siteId == Guid.Empty)
                    {
                        _logger.LogWarning("WB session listener waiting for valid SITE_CODE/WB_SITE_CODE or WB_SITE_ID.");
                    }
                }

                if (_siteId != Guid.Empty && !loggedReady)
                {
                    _logger.LogInformation(
                        "WB session listener enabled for site {SiteId} siteCode={SiteCode}. mode=session-based(real or dummy by transact_wim_session.is_dummy) timeout={TimeoutSeconds}s direction={Direction}",
                        _siteId,
                        _siteCode,
                        _timeoutSeconds,
                        _direction);
                    loggedReady = true;
                }

                if (_siteId != Guid.Empty)
                {
                    await ProcessOnceAsync(stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (NpgsqlException ex)
            {
                _logger.LogWarning(ex, "WB session listener cannot reach PostgreSQL yet. Will retry.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WB session listener failed.");
            }

            try
            {
                await Task.Delay(_interval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ProcessOnceAsync(CancellationToken ct)
    {
        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync(ct);

        var session = await GetActiveSessionAsync(conn, _siteId, ct);
        if (session == null)
        {
            _logger.LogDebug("No active WB session found.");
            return;
        }

        var exists = await WeighingExistsAsync(conn, session.Value.Id, ct);
        if (exists)
        {
            return;
        }

        if (!await _captureLock.WaitAsync(0, ct))
        {
            _logger.LogDebug("WB capture already running. skip session {SessionId}", session.Value.Id);
            return;
        }

        try
        {
            if (session.Value.IsDummy)
            {
                await InsertDummyCaptureAsync(session.Value.Id, session.Value.SiteId, ct);
                return;
            }

            await CaptureLiveVehicleAsync(session.Value.Id, session.Value.SiteId, ct);
        }
        finally
        {
            _captureLock.Release();
        }
    }

    private async Task InsertDummyCaptureAsync(Guid sessionId, Guid siteId, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();

        var vehicle = BuildDummyVehicle(sessionId, siteId);
        await repo.AddVehicleAsync(vehicle, ct);
        _logger.LogInformation("WB dummy weighing inserted for session {SessionId}", sessionId);
    }

    private async Task CaptureLiveVehicleAsync(Guid sessionId, Guid siteId, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();

        _logger.LogInformation(
            "WB live capture started for session {SessionId} direction={Direction} timeout={TimeoutSeconds}s",
            sessionId,
            _direction,
            _timeoutSeconds);

        _logger.LogInformation("WB live capture set static mode before WIM for session {SessionId}", sessionId);
        var staticRes = await _wsClient.SetModeStaticAsync(ct);
        if (staticRes is null || !staticRes.Result.Equals("OK", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("WB live capture failed to set static mode before WIM for session {SessionId}", sessionId);
            return;
        }

        if (_modeDelayMs > 0)
        {
            _logger.LogInformation("WB live capture wait {ModeDelayMs}ms before WIM for session {SessionId}", _modeDelayMs, sessionId);
            await Task.Delay(TimeSpan.FromMilliseconds(_modeDelayMs), ct);
        }

        _logger.LogInformation("WB live capture start WIM mode for session {SessionId}", sessionId);
        var startRes = await _wsClient.SetModeWimAsync(_direction, ct);
        if (startRes is null)
        {
            _logger.LogWarning("WB live capture failed to start WIM mode for session {SessionId}", sessionId);
            return;
        }

        var (axleWeights, lastTimeout, lastTotalWeight, lastDirection, lastRaw) =
            await WimFrameHelpers.CaptureWimStreamAsync(_wsClient, _timeoutSeconds, ct);

        try
        {
            await _wsClient.SetModeStaticAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to restore WB static mode after session {SessionId}", sessionId);
        }

        _logger.LogInformation("WB capture window ended for session {SessionId} after {TimeoutSeconds}s", sessionId, _timeoutSeconds);

        var ordered = axleWeights.OrderBy(k => k.Key).ToList();
        var totalWeight = lastTotalWeight ?? ordered.Sum(a => a.Value);

        if (ordered.Count == 0)
        {
            _logger.LogInformation(
                "WB live capture timed out for session {SessionId} after {TimeoutSeconds}s lastTimeout={LastTimeout}",
                sessionId,
                _timeoutSeconds,
                lastTimeout);
            return;
        }

        var vehicle = new Vehicle
        {
            RecordId = 0,
            Timestamp = DateTime.UtcNow,
            Direction = lastDirection == 1 ? VehicleDirection.Left :
                        lastDirection == 2 ? VehicleDirection.Right : VehicleDirection.Unknown,
            TotalWeight = totalWeight,
            AxleCount = ordered.Count,
            RawMessage = lastRaw ?? "",
            SiteId = siteId,
            SessionId = sessionId
        };
        if (!string.IsNullOrWhiteSpace(_locationCode))
        {
            vehicle.LocationCode = _locationCode;
        }
        foreach (var a in ordered)
        {
            vehicle.Axles.Add(new Axle
            {
                AxleNumber = a.Key,
                Weight = a.Value,
                GrossWeight = a.Value
            });
        }

        await repo.AddVehicleAsync(vehicle, ct);
        _logger.LogInformation(
            "WB live capture saved for session {SessionId} axles={AxleCount} total={TotalWeight}",
            sessionId,
            ordered.Count,
            totalWeight);
    }

    private static int? ParseIntField(string raw, string key)
    {
        var idx = raw.IndexOf(key + ":", StringComparison.Ordinal);
        if (idx < 0) return null;
        idx += key.Length + 1;
        var end = raw.IndexOfAny(new[] { ';', ' ', '\r', '\n' }, idx);
        if (end < 0) end = raw.Length;
        var slice = raw[idx..end];
        return int.TryParse(slice, out var val) ? val : null;
    }

    private static Vehicle BuildDummyVehicle(Guid sessionId, Guid siteId)
    {
        var vehicle = new Vehicle
        {
            RecordId = Math.Abs(BitConverter.ToInt32(sessionId.ToByteArray(), 0)),
            Timestamp = DateTime.UtcNow,
            Direction = VehicleDirection.Right,
            TotalWeight = 18000,
            AxleCount = 3,
            RawMessage = $"DUMMY-WB-SESSION:{sessionId}",
            SiteId = siteId,
            SessionId = sessionId,
            InfoText = "Dummy WB capture"
        };

        vehicle.Axles.Add(new Axle { AxleNumber = 1, Weight = 4200, GrossWeight = 4200 });
        vehicle.Axles.Add(new Axle { AxleNumber = 2, Weight = 6800, GrossWeight = 6800 });
        vehicle.Axles.Add(new Axle { AxleNumber = 3, Weight = 7000, GrossWeight = 7000 });

        return vehicle;
    }

    private static async Task<(Guid Id, Guid SiteId, bool IsDummy)?> GetActiveSessionAsync(NpgsqlConnection conn, Guid siteId, CancellationToken ct)
    {
        const string sql = @"
            SELECT id, site_id, COALESCE(is_dummy, false)
            FROM public.transact_wim_session
            WHERE site_id = @site_id
              AND status = 'IN_PROGRESS'
              AND COALESCE(is_active, true) = true
              AND COALESCE(is_deleted, false) = false
            ORDER BY started_at DESC
            LIMIT 1;";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("site_id", siteId);

        await using var reader = await cmd.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct))
        {
            return null;
        }

        return (reader.GetGuid(0), reader.GetGuid(1), reader.GetBoolean(2));
    }

    private static async Task<bool> WeighingExistsAsync(NpgsqlConnection conn, Guid sessionId, CancellationToken ct)
    {
        const string sql = @"SELECT EXISTS(SELECT 1 FROM public.transact_weighing WHERE session_id = @session_id);";
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("session_id", sessionId);
        var result = await cmd.ExecuteScalarAsync(ct);
        return result is true;
    }

    private async Task<Guid> ResolveConfiguredSiteIdAsync(CancellationToken ct)
    {
        if (_siteId != Guid.Empty)
        {
            return _siteId;
        }

        if (string.IsNullOrWhiteSpace(_connectionString) || string.IsNullOrWhiteSpace(_siteCode))
        {
            return Guid.Empty;
        }

        await using var conn = new NpgsqlConnection(_connectionString);
        await conn.OpenAsync(ct);

        const string sql = @"
            SELECT id
            FROM public.master_site
            WHERE code = @code
              AND COALESCE(is_deleted, false) = false
            LIMIT 1;";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("code", _siteCode);
        var result = await cmd.ExecuteScalarAsync(ct);
        return result is Guid id ? id : Guid.Empty;
    }

    private static bool GetBool(IConfiguration config, string key, bool fallback)
    {
        var raw = config[key] ?? Environment.GetEnvironmentVariable(key);
        return bool.TryParse(raw, out var parsed) ? parsed : fallback;
    }

    private static int GetInt(IConfiguration config, string key, int fallback)
    {
        var raw = config[key] ?? Environment.GetEnvironmentVariable(key);
        return int.TryParse(raw, out var parsed) ? parsed : fallback;
    }

    private static int NormalizeTimeout(int value)
    {
        return value <= 0 ? 60 : value;
    }

    private static string NormalizeDirection(string? raw)
    {
        var direction = (raw ?? "RIGHT").Trim().ToUpperInvariant();
        return direction is "LEFT" or "RIGHT" ? direction : "RIGHT";
    }

    private static string? NormalizePostgresConnectionString(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;

        if (!raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return raw;
        }

        if (!Uri.TryCreate(raw, UriKind.Absolute, out var uri)) return raw;

        var userInfo = uri.UserInfo.Split(':', 2);
        var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var database = uri.AbsolutePath.Trim('/');

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Username = username,
            Password = password,
            Database = database
        };

        var sslMode = GetQueryValue(uri.Query, "sslmode");
        if (!string.IsNullOrWhiteSpace(sslMode) &&
            Enum.TryParse<SslMode>(sslMode, true, out var parsedMode))
        {
            builder.SslMode = parsedMode;
        }

        return builder.ConnectionString;
    }

    private static string? GetQueryValue(string query, string key)
    {
        if (string.IsNullOrWhiteSpace(query)) return null;
        var trimmed = query.TrimStart('?');
        foreach (var pair in trimmed.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var parts = pair.Split('=', 2);
            if (parts.Length == 0) continue;
            if (!string.Equals(parts[0], key, StringComparison.OrdinalIgnoreCase)) continue;
            return parts.Length > 1 ? Uri.UnescapeDataString(parts[1]) : "";
        }
        return null;
    }
}
