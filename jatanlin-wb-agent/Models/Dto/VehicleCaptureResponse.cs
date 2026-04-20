namespace WServerApi.Models.Dto;

public class VehicleCaptureResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public VehicleData? Vehicle { get; set; }
}

public class VehicleData
{
    public Guid Id { get; set; }
    public int RecordId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Direction { get; set; } = "";
    public int TotalWeight { get; set; }
    public double Speed { get; set; }
    public int ResultCode { get; set; }
    public string? InfoText { get; set; }
    public int AxleCount { get; set; }
    public List<AxleData> Axles { get; set; } = new();
}

public class AxleData
{
    public int AxleNumber { get; set; }
    public int Weight { get; set; }
    public int GrossWeight { get; set; }
    public int Wheel1Weight { get; set; }
    public int Wheel2Weight { get; set; }
    public double Wheelbase { get; set; }
    public double Speed { get; set; }
}
