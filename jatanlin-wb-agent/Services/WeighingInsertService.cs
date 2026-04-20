using System.Text.Json;
using Npgsql;
using NpgsqlTypes;
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

    public WeighingInsertService(ILogger<WeighingInsertService> logger, IConfiguration config)
    {
        _logger = logger;
        var rawConn = config.GetConnectionString("PostgresDatabase")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        _pgConnectionString = NormalizePostgresConnectionString(rawConn);
    }

    public async Task<bool> TryInsertWeighingAsync(Vehicle vehicle, CancellationToken ct = default)
    {
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
            var defaultSiteId = new Guid("e1123daf-a4db-4ee1-88da-ba9bff382f45");
            var siteId = vehicle.SiteId.HasValue && vehicle.SiteId.Value != Guid.Empty
                ? vehicle.SiteId.Value
                : defaultSiteId;
            cmd.Parameters.AddWithValue("site_id", siteId);
            cmd.Parameters.AddWithValue("session_id", DBNull.Value);

            await cmd.ExecuteNonQueryAsync(dbCt);
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
}
