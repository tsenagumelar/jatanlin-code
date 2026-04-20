using WServerApi.Models.Domain;

namespace WServerApi.Services;

public interface IVehicleRepository
{
    Task<Vehicle?> GetLatestVehicleAsync(CancellationToken ct = default);
    Task<Vehicle?> GetVehicleByIdAsync(Guid id, CancellationToken ct = default);
    Task<Vehicle?> GetVehicleByRecordIdAsync(int recId, CancellationToken ct = default);
    Task<(List<Vehicle> vehicles, int totalCount)> GetVehiclesAsync(
        int page, int pageSize, bool? successOnly, CancellationToken ct = default);
    Task<VehicleStats> GetStatsAsync(CancellationToken ct = default);
    Task AddVehicleAsync(Vehicle vehicle, CancellationToken ct = default);
}

public record VehicleStats(
    int TotalVehicles,
    int SuccessfulWeighings,
    int FailedWeighings,
    DateTime? FirstRecordDate,
    DateTime? LastRecordDate,
    long TotalWeightSum,
    double AverageSpeed
);

public class VehicleRepository : IVehicleRepository
{
    private readonly ILogger<VehicleRepository> _logger;
    private readonly INatsCacheService _cache;
    private readonly IWeighingInsertService _insertService;

    public VehicleRepository(
        ILogger<VehicleRepository> logger,
        INatsCacheService cache,
        IWeighingInsertService insertService)
    {
        _logger = logger;
        _cache = cache;
        _insertService = insertService;
    }

    public async Task<Vehicle?> GetLatestVehicleAsync(CancellationToken ct = default)
    {
        await Task.CompletedTask;
        _logger.LogInformation("Vehicle list queries are disabled; only transact_weighing inserts are supported.");
        return null;
    }

    public async Task<Vehicle?> GetVehicleByIdAsync(Guid id, CancellationToken ct = default)
    {
        await Task.CompletedTask;
        _logger.LogInformation("Vehicle list queries are disabled; only transact_weighing inserts are supported.");
        return null;
    }

    public async Task<Vehicle?> GetVehicleByRecordIdAsync(int recId, CancellationToken ct = default)
    {
        await Task.CompletedTask;
        _logger.LogInformation("Vehicle list queries are disabled; only transact_weighing inserts are supported.");
        return null;
    }

    public async Task<(List<Vehicle> vehicles, int totalCount)> GetVehiclesAsync(
        int page, int pageSize, bool? successOnly, CancellationToken ct = default)
    {
        await Task.CompletedTask;
        _logger.LogInformation("Vehicle list queries are disabled; only transact_weighing inserts are supported.");
        return (new List<Vehicle>(), 0);
    }

    public async Task<VehicleStats> GetStatsAsync(CancellationToken ct = default)
    {
        await Task.CompletedTask;
        _logger.LogInformation("Vehicle stats queries are disabled; only transact_weighing inserts are supported.");
        return new VehicleStats(0, 0, 0, null, null, 0, 0);
    }

    public async Task AddVehicleAsync(Vehicle vehicle, CancellationToken ct = default)
    {
        var cacheKey = await _cache.CacheVehicleAsync(vehicle, ct);
        var ok = await _insertService.TryInsertWeighingAsync(vehicle, ct);
        if (ok && !string.IsNullOrWhiteSpace(cacheKey))
        {
            await _cache.RemoveAsync(cacheKey, ct);
            Console.WriteLine($"[WEIGHING][insert] success recid={vehicle.RecordId}");
        }
        else if (!ok)
        {
            Console.WriteLine($"[WEIGHING][insert] failed recid={vehicle.RecordId}");
            _logger.LogWarning("Insert failed; vehicle cached for retry key={CacheKey}", cacheKey ?? "<none>");
        }
    }
}
