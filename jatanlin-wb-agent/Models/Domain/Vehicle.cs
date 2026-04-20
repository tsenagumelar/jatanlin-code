namespace WServerApi.Models.Domain;

public class Vehicle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int RecordId { get; set; }
    public string? WsCode { get; set; }
    public DateTime Timestamp { get; set; }
    public VehicleDirection Direction { get; set; }
    public int TotalWeight { get; set; }
    public double Speed { get; set; }
    public int AxleCount { get; set; }
    public int ResultCode { get; set; }
    public string? InfoText { get; set; }
    public string RawMessage { get; set; } = "";
    
    // Additional PostgreSQL fields
    public string? LocationCode { get; set; }
    public Guid? SiteId { get; set; }
    
    // Audit fields
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public Guid? CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedBy { get; set; }
    public DateTime? UpdatedDate { get; set; }

    // Navigation property
    public List<Axle> Axles { get; set; } = new();
}

public enum VehicleDirection
{
    Unknown = 0,
    Left = 1,
    Right = 2
}
