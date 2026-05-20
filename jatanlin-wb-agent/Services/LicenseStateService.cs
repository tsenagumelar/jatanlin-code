using Microsoft.Extensions.Options;
using WServerApi.Models;

namespace WServerApi.Services;

public sealed class LicenseStateService
{
    private readonly LicenseOptions _options;

    public LicenseStateService(IOptions<LicenseOptions> options)
    {
        _options = options.Value;
    }

    public string GetStatus()
    {
        if (!_options.Enabled) return "ACTIVE";
        return Normalize(_options.MockStatus);
    }

    public bool IsAllowed()
    {
        var status = GetStatus();
        return status == "ACTIVE" || status == "GRACE_PERIOD";
    }

    public object GetPayload()
    {
        var now = DateTime.UtcNow.ToString("O");
        return new
        {
            enabled = _options.Enabled,
            status = GetStatus(),
            is_allowed = IsAllowed(),
            evaluated_at = now,
            mode = "MOCK"
        };
    }

    private static string Normalize(string? value)
    {
        var status = (value ?? "ACTIVE").Trim().ToUpperInvariant();
        return status switch
        {
            "ACTIVE" => "ACTIVE",
            "GRACE_PERIOD" => "GRACE_PERIOD",
            "EXPIRED" => "EXPIRED",
            "REVOKED" => "REVOKED",
            "NO_DONGLE" => "NO_DONGLE",
            "DONGLE_MISMATCH" => "DONGLE_MISMATCH",
            "INVALID_SIGNATURE" => "INVALID_SIGNATURE",
            _ => "ACTIVE"
        };
    }
}
