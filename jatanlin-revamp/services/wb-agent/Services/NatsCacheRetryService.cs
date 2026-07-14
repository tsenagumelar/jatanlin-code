using Microsoft.Extensions.Options;
using WServerApi.Models;

namespace WServerApi.Services;

public sealed class NatsCacheRetryService : BackgroundService
{
    private readonly ILogger<NatsCacheRetryService> _logger;
    private readonly INatsCacheService _cache;
    private readonly IWeighingInsertService _insertService;
    private readonly IOptions<NatsOptions> _options;

    public NatsCacheRetryService(
        ILogger<NatsCacheRetryService> logger,
        INatsCacheService cache,
        IWeighingInsertService insertService,
        IOptions<NatsOptions> options)
    {
        _logger = logger;
        _cache = cache;
        _insertService = insertService;
        _options = options;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromSeconds(Math.Max(2, _options.Value.RetryIntervalSeconds));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var items = await _cache.GetAllAsync(stoppingToken);
                foreach (var item in items)
                {
                    if (stoppingToken.IsCancellationRequested) break;
                    var ok = await _insertService.TryInsertWeighingAsync(item.Vehicle, stoppingToken);
                    if (ok)
                    {
                        await _cache.RemoveAsync(item.Key, stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "NATS cache retry loop failed");
            }

            try
            {
                await Task.Delay(interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
            }
        }
    }
}
