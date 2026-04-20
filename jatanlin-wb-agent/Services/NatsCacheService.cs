using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using NATS.Client;
using NATS.Client.JetStream;
using NATS.Client.KeyValue;
using WServerApi.Models;
using WServerApi.Models.Domain;

namespace WServerApi.Services;

public interface INatsCacheService
{
    Task<string?> CacheVehicleAsync(Vehicle vehicle, CancellationToken ct = default);
    Task<IReadOnlyList<CachedVehicle>> GetAllAsync(CancellationToken ct = default);
    Task<bool> RemoveAsync(string key, CancellationToken ct = default);
}

public record CachedVehicle(string Key, Vehicle Vehicle, DateTime CachedAtUtc);

public sealed class NatsCacheService : INatsCacheService, IDisposable
{
    private readonly ILogger<NatsCacheService> _logger;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly bool _enabled;
    private readonly string _bucket;
    private readonly IConnection? _connection;
    private readonly IKeyValue? _kv;

        public NatsCacheService(ILogger<NatsCacheService> logger, IOptions<NatsOptions> options)
    {
        _logger = logger;
        var cfg = options.Value;
        _bucket = string.IsNullOrWhiteSpace(cfg.Bucket) ? "anpr-capture" : cfg.Bucket;

        if (string.IsNullOrWhiteSpace(cfg.Url))
        {
            _enabled = false;
            _logger.LogWarning("NATS_URL not set; NATS cache disabled.");
            return;
        }

        try
        {
            var opts = ConnectionFactory.GetDefaultOptions();
            opts.Url = cfg.Url;
            _connection = new ConnectionFactory().CreateConnection(opts);

            var js = _connection.CreateJetStreamContext();
            _kv = _connection.CreateKeyValueContext(_bucket);
            _enabled = true;
            _logger.LogInformation("NATS cache enabled at {Url} bucket={Bucket}", cfg.Url, _bucket);
        }
        catch (Exception ex)
        {
            _enabled = false;
            _logger.LogError(ex, "Failed to initialize NATS cache; cache disabled.");
        }
    }

    public Task<string?> CacheVehicleAsync(Vehicle vehicle, CancellationToken ct = default)
    {
        if (!_enabled || _kv is null) return Task.FromResult<string?>(null);

        try
        {
            var key = $"veh_{vehicle.Id:N}_{DateTime.UtcNow:yyyyMMddHHmmssfff}";
            var payload = new CachedVehicle(key, vehicle, DateTime.UtcNow);
            var bytes = JsonSerializer.SerializeToUtf8Bytes(payload, _jsonOptions);
            _kv.Put(key, bytes);
            return Task.FromResult<string?>(key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cache vehicle to NATS");
            return Task.FromResult<string?>(null);
        }
    }

    public Task<IReadOnlyList<CachedVehicle>> GetAllAsync(CancellationToken ct = default)
    {
        if (!_enabled || _kv is null) return Task.FromResult<IReadOnlyList<CachedVehicle>>(Array.Empty<CachedVehicle>());

        try
        {
            var keys = _kv.Keys();
            if (keys is null) return Task.FromResult<IReadOnlyList<CachedVehicle>>(Array.Empty<CachedVehicle>());

            var items = new List<CachedVehicle>();
            foreach (var key in keys)
            {
                try
                {
                    var entry = _kv.Get(key);
                    if (entry?.Value is null) continue;
                    var json = Encoding.UTF8.GetString(entry.Value);
                    var cached = JsonSerializer.Deserialize<CachedVehicle>(json, _jsonOptions);
                    if (cached is not null) items.Add(cached);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to read cached vehicle key={Key}", key);
                }
            }

            return Task.FromResult<IReadOnlyList<CachedVehicle>>(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list cached vehicles");
            return Task.FromResult<IReadOnlyList<CachedVehicle>>(Array.Empty<CachedVehicle>());
        }
    }

    public Task<bool> RemoveAsync(string key, CancellationToken ct = default)
    {
        if (!_enabled || _kv is null) return Task.FromResult(false);

        try
        {
            _kv.Delete(key);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to remove cached vehicle key={Key}", key);
            return Task.FromResult(false);
        }
    }

    public void Dispose()
    {
        try
        {
            _connection?.Drain();
        }
        catch
        {
        }

        try
        {
            _connection?.Close();
            _connection?.Dispose();
        }
        catch
        {
        }
    }
}
