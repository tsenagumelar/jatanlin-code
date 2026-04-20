namespace WServerApi.Models.Dto;

public class CaptureVehicleRequest
{
    public string? Direction { get; set; } = "Right";
    public int TimeoutSeconds { get; set; } = 45;
    public string? LocationCode { get; set; }
    public Guid? SiteId { get; set; }
}
