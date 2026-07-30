namespace WServerApi.Models.Dto;

public record VehicleResponse(
    Guid Id,
    int RecordId,
    DateTime Timestamp,
    string Direction,
    int TotalWeight,
    double Speed,
    int ResultCode,
    string? InfoText,
    int AxleCount,
    List<AxleResponse> Axles
);

public record AxleResponse(
    int AxleNumber,
    int Weight,
    int GrossWeight,
    int Wheel1Weight,
    int Wheel2Weight,
    double Wheelbase,
    double Speed
);

public record VehicleListResponse(
    int TotalCount,
    int Page,
    int PageSize,
    List<VehicleSummary> Vehicles
);

public record VehicleSummary(
    Guid Id,
    int RecordId,
    DateTime Timestamp,
    string Direction,
    int TotalWeight,
    int AxleCount,
    bool IsSuccess
);

public record VehicleStatsResponse(
    int TotalVehicles,
    int SuccessfulWeighings,
    int FailedWeighings,
    DateTime? FirstRecordDate,
    DateTime? LastRecordDate,
    long TotalWeightSum,
    double AverageSpeed
);
