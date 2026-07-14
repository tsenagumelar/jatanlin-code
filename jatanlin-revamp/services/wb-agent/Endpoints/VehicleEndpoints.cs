using WServerApi.Models.Dto;
using WServerApi.Services;

namespace WServerApi.Endpoints;

public static class VehicleEndpoints
{
    public static WebApplication MapVehicleEndpoints(this WebApplication app)
    {
        app.MapGet("/ws/latest-vehicle", async (IVehicleRepository repo, CancellationToken ct) =>
        {
            var vehicle = await repo.GetLatestVehicleAsync(ct);
            if (vehicle == null) return Results.NotFound(new { message = "No vehicle records found" });

            return Results.Ok(new VehicleResponse(
                vehicle.Id,
                vehicle.RecordId,
                vehicle.Timestamp,
                vehicle.Direction.ToString(),
                vehicle.TotalWeight,
                vehicle.Speed,
                vehicle.ResultCode,
                vehicle.InfoText,
                vehicle.AxleCount,
                vehicle.Axles.Select(a => new AxleResponse(
                    a.AxleNumber, a.Weight, a.GrossWeight,
                    a.Wheel1Weight, a.Wheel2Weight, a.Wheelbase, a.Speed
                )).ToList()
            ));
        });

        app.MapGet("/ws/vehicles/{id:guid}", async (Guid id, IVehicleRepository repo, CancellationToken ct) =>
        {
            var vehicle = await repo.GetVehicleByIdAsync(id, ct);
            if (vehicle == null) return Results.NotFound();

            return Results.Ok(new VehicleResponse(
                vehicle.Id, vehicle.RecordId, vehicle.Timestamp, vehicle.Direction.ToString(),
                vehicle.TotalWeight, vehicle.Speed, vehicle.ResultCode, vehicle.InfoText,
                vehicle.AxleCount,
                vehicle.Axles.Select(a => new AxleResponse(
                    a.AxleNumber, a.Weight, a.GrossWeight,
                    a.Wheel1Weight, a.Wheel2Weight, a.Wheelbase, a.Speed
                )).ToList()
            ));
        });

        app.MapGet("/ws/vehicles", async (
            IVehicleRepository repo,
            int page = 1,
            int pageSize = 20,
            bool? successOnly = null,
            CancellationToken ct = default) =>
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var (vehicles, totalCount) = await repo.GetVehiclesAsync(page, pageSize, successOnly, ct);

            return Results.Ok(new VehicleListResponse(
                totalCount,
                page,
                pageSize,
                vehicles.Select(v => new VehicleSummary(
                    v.Id, v.RecordId, v.Timestamp, v.Direction.ToString(),
                    v.TotalWeight, v.AxleCount, v.ResultCode == 0
                )).ToList()
            ));
        });

        app.MapGet("/ws/vehicles/stats", async (IVehicleRepository repo, CancellationToken ct) =>
        {
            var stats = await repo.GetStatsAsync(ct);
            return Results.Ok(new VehicleStatsResponse(
                stats.TotalVehicles,
                stats.SuccessfulWeighings,
                stats.FailedWeighings,
                stats.FirstRecordDate,
                stats.LastRecordDate,
                stats.TotalWeightSum,
                stats.AverageSpeed
            ));
        });

        app.MapGet("/ws/vehicles/recid/{recid:int}", async (
            int recid,
            IVehicleRepository repo,
            CancellationToken ct) =>
        {
            var vehicle = await repo.GetVehicleByRecordIdAsync(recid, ct);
            if (vehicle == null) return Results.NotFound();

            return Results.Ok(new VehicleResponse(
                vehicle.Id, vehicle.RecordId, vehicle.Timestamp, vehicle.Direction.ToString(),
                vehicle.TotalWeight, vehicle.Speed, vehicle.ResultCode, vehicle.InfoText,
                vehicle.AxleCount,
                vehicle.Axles.Select(a => new AxleResponse(
                    a.AxleNumber, a.Weight, a.GrossWeight,
                    a.Wheel1Weight, a.Wheel2Weight, a.Wheelbase, a.Speed
                )).ToList()
            ));
        });

        return app;
    }
}
