namespace WServerApi.Models;

public class WbOptions
{
    public bool SessionListenerEnabled { get; set; } = true;
    public bool DummyEnabled { get; set; } = false;
    public int SessionIntervalSec { get; set; } = 5;
    public int CaptureTimeoutSec { get; set; } = 60;
    public int CaptureModeDelayMs { get; set; } = 0;
    public string CaptureDirection { get; set; } = "RIGHT";
    public string? LocationCode { get; set; }
    public string? SiteCode { get; set; }
    public string? SiteId { get; set; }
    public string? SiteName { get; set; }
    public string? SiteLocation { get; set; }
    public string? SiteRegion { get; set; }
}
