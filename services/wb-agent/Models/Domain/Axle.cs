using System.Text.Json.Serialization;

namespace WServerApi.Models.Domain;

public class Axle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VehicleId { get; set; }
    public int AxleNumber { get; set; }
    public int Weight { get; set; }
    public int GrossWeight { get; set; }
    public int Wheel1Weight { get; set; }
    public int Wheel2Weight { get; set; }
    public double Wheelbase { get; set; }
    public double Speed { get; set; }
    
    // Audit fields
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }

    // Navigation property - ignore in JSON to prevent cycles
    [JsonIgnore]
    public Vehicle Vehicle { get; set; } = null!;
}
