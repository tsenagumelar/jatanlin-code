using System.Text.Json;
using Microsoft.Extensions.Options;
using Npgsql;
using NpgsqlTypes;
using WServerApi.Models;
using WServerApi.Models.Domain;

namespace WServerApi.Services;

public interface IWeighingInsertService
{
    Task<bool> TryInsertWeighingAsync(Vehicle vehicle, CancellationToken ct = default);
}

public sealed class WeighingInsertService : IWeighingInsertService
{
    private readonly ILogger<WeighingInsertService> _logger;
    private readonly string? _pgConnectionString;
    private readonly string? _siteCode;
    private readonly Guid _configuredSiteId;
    private readonly LicenseStateService _license;

    public WeighingInsertService(ILogger<WeighingInsertService> logger, IConfiguration config, IOptions<WbOptions> wbOptions, LicenseStateService license)
    {
        _logger = logger;
        _license = license;
        var options = wbOptions.Value;
        var rawConn = config.GetConnectionString("PostgresDatabase")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        _pgConnectionString = NormalizePostgresConnectionString(rawConn);
        _siteCode = config["SITE_CODE"]
            ?? Environment.GetEnvironmentVariable("SITE_CODE")
            ?? config["WB_SITE_CODE"]
            ?? Environment.GetEnvironmentVariable("WB_SITE_CODE")
            ?? options.SiteCode;

        var rawSiteId = config["WB_SITE_ID"]
            ?? Environment.GetEnvironmentVariable("WB_SITE_ID")
            ?? Environment.GetEnvironmentVariable("NEXT_PUBLIC_SITE_ID")
            ?? options.SiteId;
        _configuredSiteId = Guid.TryParse(rawSiteId, out var parsed) ? parsed : Guid.Empty;
    }

    public async Task<bool> TryInsertWeighingAsync(Vehicle vehicle, CancellationToken ct = default)
    {
        if (!_license.IsAllowed())
        {
            _logger.LogWarning("Skip transact_weighing insert because license status is {Status}", _license.GetStatus());
            return false;
        }

        if (string.IsNullOrWhiteSpace(_pgConnectionString))
        {
            _logger.LogWarning("PostgreSQL connection string not set; skipping transact_weighing insert.");
            return false;
        }

        Console.WriteLine($"[WEIGHING][insert] begin recid={vehicle.RecordId}");
        try
        {
            using var dbCts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
            var dbCt = dbCts.Token;

            var axleCount = vehicle.Axles.Count > 0 ? vehicle.Axles.Count : vehicle.AxleCount;
            var axleDetail = vehicle.Axles
                .OrderBy(a => a.AxleNumber)
                .Select(a => new
                {
                    axle_number = a.AxleNumber,
                    weight = a.Weight,
                    gross_weight = a.GrossWeight,
                    wheel1_weight = a.Wheel1Weight,
                    wheel2_weight = a.Wheel2Weight,
                    wheelbase = a.Wheelbase,
                    speed = a.Speed
                })
                .ToList();

            var axleJson = JsonSerializer.Serialize(axleDetail);

            const string sql = @"
                INSERT INTO public.transact_weighing
                    (total_axle, axle_detail, total_weight, site_id, session_id)
                VALUES
                    (@total_axle, @axle_detail, @total_weight, @site_id, @session_id);";

            await using var conn = new NpgsqlConnection(_pgConnectionString);
            await conn.OpenAsync(dbCt);

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.CommandTimeout = 60;
            cmd.Parameters.AddWithValue("total_axle", axleCount);
            cmd.Parameters.Add("axle_detail", NpgsqlDbType.Jsonb).Value = axleJson;
            cmd.Parameters.AddWithValue("total_weight", (decimal)vehicle.TotalWeight);
            var siteId = vehicle.SiteId.HasValue && vehicle.SiteId.Value != Guid.Empty
                ? vehicle.SiteId.Value
                : await ResolveDefaultSiteIdAsync(conn, dbCt);
            cmd.Parameters.AddWithValue("site_id", siteId);
            if (vehicle.SessionId.HasValue && vehicle.SessionId.Value != Guid.Empty)
            {
                cmd.Parameters.AddWithValue("session_id", vehicle.SessionId.Value);
            }
            else
            {
                cmd.Parameters.AddWithValue("session_id", DBNull.Value);
            }

            if (vehicle.SessionId.HasValue && vehicle.SessionId.Value != Guid.Empty)
            {
                cmd.CommandText = @"
                    UPDATE public.transact_weighing
                    SET total_axle = @total_axle,
                        axle_detail = @axle_detail,
                        total_weight = @total_weight,
                        site_id = @site_id,
                        updated_date = now()
                    WHERE session_id = @session_id;";

                var affected = await cmd.ExecuteNonQueryAsync(dbCt);
                if (affected == 0)
                {
                    cmd.CommandText = sql;
                    await cmd.ExecuteNonQueryAsync(dbCt);
                }
            }
            else
            {
                await cmd.ExecuteNonQueryAsync(dbCt);
            }
            _logger.LogInformation("Vehicle RECID={RecId} saved to transact_weighing", vehicle.RecordId);
            Console.WriteLine($"[WEIGHING][insert] db insert ok recid={vehicle.RecordId}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert vehicle RECID={RecId} into transact_weighing", vehicle.RecordId);
            Console.WriteLine($"[WEIGHING][insert] db insert failed recid={vehicle.RecordId}");
            return false;
        }
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

    private async Task<Guid> ResolveDefaultSiteIdAsync(NpgsqlConnection conn, CancellationToken ct)
    {
        if (_configuredSiteId != Guid.Empty)
        {
            return _configuredSiteId;
        }

        if (!string.IsNullOrWhiteSpace(_siteCode))
        {
            const string sqlByCode = @"
                SELECT id
                FROM public.master_site
                WHERE code = @code
                  AND COALESCE(is_deleted, false) = false
                LIMIT 1;";

            await using var cmd = new NpgsqlCommand(sqlByCode, conn);
            cmd.Parameters.AddWithValue("code", _siteCode);
            var result = await cmd.ExecuteScalarAsync(ct);
            if (result is Guid id)
            {
                return id;
            }
        }

        throw new InvalidOperationException("WB default site is not configured. Set SITE_CODE/WB_SITE_CODE or WB_SITE_ID.");
    }
}
