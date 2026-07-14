using Microsoft.Extensions.Options;
using Npgsql;
using WServerApi.Models;

namespace WServerApi.Services;

public static class WimSessionResolver
{
    public static async Task<(Guid SessionId, Guid SiteId)?> ResolveWimTriggerSessionAsync(
        IConfiguration config,
        IOptions<WbOptions> wbOptions,
        Guid? requestedSessionId,
        Guid? requestedSiteId,
        CancellationToken ct)
    {
        var rawConn = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? config.GetConnectionString("PostgresDatabase");
        var connectionString = NormalizePostgresConnectionString(rawConn);
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return requestedSessionId.HasValue && requestedSiteId.HasValue
                ? (requestedSessionId.Value, requestedSiteId.Value)
                : null;
        }

        await using var conn = new NpgsqlConnection(connectionString);
        await conn.OpenAsync(ct);

        if (requestedSessionId.HasValue && requestedSessionId.Value != Guid.Empty)
        {
            const string sqlBySession = @"
                SELECT id, site_id
                FROM public.transact_wim_session
                WHERE id = @session_id
                  AND COALESCE(is_active, true) = true
                  AND COALESCE(is_deleted, false) = false
                LIMIT 1;";

            await using var cmd = new NpgsqlCommand(sqlBySession, conn);
            cmd.Parameters.AddWithValue("session_id", requestedSessionId.Value);
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                return (reader.GetGuid(0), reader.GetGuid(1));
            }

            return requestedSiteId.HasValue && requestedSiteId.Value != Guid.Empty
                ? (requestedSessionId.Value, requestedSiteId.Value)
                : null;
        }

        var resolvedSiteId = requestedSiteId.GetValueOrDefault(Guid.Empty);
        if (resolvedSiteId == Guid.Empty)
        {
            resolvedSiteId = await ResolveWbSiteIdAsync(conn, config, wbOptions, ct);
        }
        if (resolvedSiteId == Guid.Empty)
        {
            return null;
        }

        const string sqlActive = @"
            SELECT id, site_id
            FROM public.transact_wim_session
            WHERE site_id = @site_id
              AND status = 'IN_PROGRESS'
              AND COALESCE(is_active, true) = true
              AND COALESCE(is_deleted, false) = false
            ORDER BY started_at DESC
            LIMIT 1;";

        await using var activeCmd = new NpgsqlCommand(sqlActive, conn);
        activeCmd.Parameters.AddWithValue("site_id", resolvedSiteId);
        await using var activeReader = await activeCmd.ExecuteReaderAsync(ct);
        if (await activeReader.ReadAsync(ct))
        {
            return (activeReader.GetGuid(0), activeReader.GetGuid(1));
        }

        return null;
    }

    private static async Task<Guid> ResolveWbSiteIdAsync(
        NpgsqlConnection conn,
        IConfiguration config,
        IOptions<WbOptions> wbOptions,
        CancellationToken ct)
    {
        var options = wbOptions.Value;
        var rawSiteId = Environment.GetEnvironmentVariable("WB_SITE_ID")
            ?? config["WB_SITE_ID"]
            ?? Environment.GetEnvironmentVariable("NEXT_PUBLIC_SITE_ID")
            ?? options.SiteId;
        if (Guid.TryParse(rawSiteId, out var siteId) && siteId != Guid.Empty)
        {
            return siteId;
        }

        var siteCode = Environment.GetEnvironmentVariable("SITE_CODE")
            ?? config["SITE_CODE"]
            ?? Environment.GetEnvironmentVariable("WB_SITE_CODE")
            ?? config["WB_SITE_CODE"]
            ?? options.SiteCode;
        if (string.IsNullOrWhiteSpace(siteCode))
        {
            return Guid.Empty;
        }

        const string sqlByCode = @"
            SELECT id
            FROM public.master_site
            WHERE code = @code
              AND COALESCE(is_deleted, false) = false
            LIMIT 1;";

        await using var cmd = new NpgsqlCommand(sqlByCode, conn);
        cmd.Parameters.AddWithValue("code", siteCode);
        var result = await cmd.ExecuteScalarAsync(ct);
        return result is Guid id ? id : Guid.Empty;
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

        var sslMode = GetPostgresQueryValue(uri.Query, "sslmode");
        if (!string.IsNullOrWhiteSpace(sslMode) &&
            Enum.TryParse<SslMode>(sslMode, true, out var parsedMode))
        {
            builder.SslMode = parsedMode;
        }

        return builder.ConnectionString;
    }

    private static string? GetPostgresQueryValue(string query, string key)
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
