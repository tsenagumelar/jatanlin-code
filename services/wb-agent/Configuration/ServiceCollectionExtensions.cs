using WServerApi.Models;
using WServerApi.Services;

namespace WServerApi.Configuration;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddWbAgentServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<WServerOptions>(configuration.GetSection("WServer"));
        services.Configure<NatsOptions>(configuration.GetSection("Nats"));
        services.Configure<WbOptions>(configuration.GetSection("WB"));
        services.PostConfigure<NatsOptions>(opt =>
        {
            var envUrl = Environment.GetEnvironmentVariable("NATS_URL");
            if (!string.IsNullOrWhiteSpace(envUrl))
                opt.Url = envUrl;
        });

        services.AddSingleton<WsClient>();
        services.AddHostedService(sp => sp.GetRequiredService<WsClient>());

        services.AddSingleton<INatsCacheService, NatsCacheService>();
        services.AddSingleton<IWeighingInsertService, WeighingInsertService>();
        services.AddHostedService<NatsCacheRetryService>();
        services.AddHostedService<SessionCaptureService>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();

        return services;
    }
}
