using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;
using WServerApi.Models;
using WServerApi.Models.Domain;
using WServerApi.Models.Dto;
using WServerApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<WServerOptions>(builder.Configuration.GetSection("WServer"));
builder.Services.Configure<NatsOptions>(builder.Configuration.GetSection("Nats"));
builder.Services.PostConfigure<NatsOptions>(opt =>
{
    if (string.IsNullOrWhiteSpace(opt.Url))
        opt.Url = Environment.GetEnvironmentVariable("NATS_URL");
});
builder.Services.AddSingleton<WsClient>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<WsClient>());

builder.Services.AddSingleton<INatsCacheService, NatsCacheService>();
builder.Services.AddSingleton<IWeighingInsertService, WeighingInsertService>();
builder.Services.AddHostedService<NatsCacheRetryService>();
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();

var app = builder.Build();

// PostgreSQL schema is expected to exist; migrations are managed separately.

app.MapGet("/", () => Results.Ok(new { ok = true, service = "WServerApi", endpoints = new[]{
    "/ws/login?user=&pass=",
    "/ws/mode/static",
    "/ws/mode/wim?direction=LEFT|RIGHT",
    "/ws/msgs",
    "/ws/stream",
    "/ws/wim/start?direction=LEFT|RIGHT",
    "/ws/wim/data",
    "/ws/wim/stop",
    "/ws/wim/capture?direction=LEFT|RIGHT&timeoutSeconds=45 (AUTO: Start->Wait->Save->Stop)",
    "/capture (POST - PostgreSQL capture with location/site)",
    "/ws/latest-vehicle",
    "/ws/vehicles?page=1&pageSize=20&successOnly=true",
    "/ws/vehicles/{id:guid}",
    "/ws/vehicles/recid/{recid}",
    "/ws/vehicles/stats"
}}));

app.MapPost("/ws/login", async (WsClient cli, string user, string pass, CancellationToken ct) =>
{
    var res = await cli.LoginAsync(user, pass, ct);
    return res is null ? Results.Problem("No response") : Results.Ok(res);
});

app.MapPost("/ws/mode/static", async (WsClient cli, CancellationToken ct) =>
{
    var res = await cli.SetModeStaticAsync(ct);
    return res is null ? Results.Problem("No response") : Results.Ok(res);
});

app.MapPost("/ws/mode/wim", async (WsClient cli, string direction, CancellationToken ct) =>
{
    direction = (direction ?? "RIGHT").ToUpperInvariant();
    if (direction != "LEFT" && direction != "RIGHT") return Results.BadRequest("direction must be LEFT or RIGHT");
    var res = await cli.SetModeWimAsync(direction, ct);
    return res is null ? Results.Problem("No response") : Results.Ok(res);
});

// recent raw #MSG frames (ring buffer)
app.MapGet("/ws/msgs", (WsClient cli) => Results.Ok(cli.GetRecentMsgs()));

// simple SSE stream for live #MSG
app.MapGet("/ws/stream", async (HttpContext ctx, WsClient cli) =>
{
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    var tcs = new TaskCompletionSource();
    void OnMsg(MsgFrame m) => ctx.Response.WriteAsync($"data: {m.Raw}\n\n");
    void OnRes(ResFrame r) => ctx.Response.WriteAsync($"data: {r.Raw}\n\n");

    cli.OnMsg += OnMsg;
    cli.OnRes += OnRes;

    ctx.RequestAborted.Register(() =>
    {
        cli.OnMsg -= OnMsg;
        cli.OnRes -= OnRes;
        tcs.TrySetResult();
    });
    await tcs.Task;
    return Results.Empty;
});

// ===== WIM (Weighing-In-Motion) Endpoints =====

// Section 4.2.3: Start weighing-in-motion
app.MapPost("/ws/wim/start", async (WsClient cli, string? direction, CancellationToken ct) =>
{
    direction = (direction ?? "RIGHT").ToUpperInvariant();
    if (direction != "LEFT" && direction != "RIGHT")
        return Results.BadRequest(new { error = "direction must be LEFT or RIGHT" });

    var res = await cli.SetModeWimAsync(direction, ct);
    if (res is null)
        return Results.Problem("No response from WSERVER");

    return Results.Ok(new {
        message = "WIM mode started successfully",
        direction = direction,
        response = res
    });
});

// Section 4.2.4: Get data during weighing (real-time stream)
app.MapGet("/ws/wim/data", async (HttpContext ctx, WsClient cli) =>
{
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    ctx.Response.Headers.Append("Cache-Control", "no-cache");
    ctx.Response.Headers.Append("Connection", "keep-alive");

    var tcs = new TaskCompletionSource();

    void OnMsg(MsgFrame m)
    {
        // Filter untuk MODE:5 (WIM mode) saja
        if (m.Raw.Contains("MODE:5"))
        {
            ctx.Response.WriteAsync($"data: {m.Raw}\n\n").Wait();
        }
    }

    void OnRes(ResFrame r)
    {
        // Kirim vehicle weighing result
        if (r.Raw.Contains("OBJECT:VEHICLE"))
        {
            ctx.Response.WriteAsync($"data: {r.Raw}\n\n").Wait();
        }
    }

    cli.OnMsg += OnMsg;
    cli.OnRes += OnRes;

    ctx.RequestAborted.Register(() =>
    {
        cli.OnMsg -= OnMsg;
        cli.OnRes -= OnRes;
        tcs.TrySetResult();
    });

    await tcs.Task;
    return Results.Empty;
});

// Stop WIM and return to static mode (Section 4.2.5)
app.MapPost("/ws/wim/stop", async (WsClient cli, CancellationToken ct) =>
{
    var res = await cli.SetModeStaticAsync(ct);
    if (res is null)
        return Results.Problem("No response from WSERVER");

    return Results.Ok(new {
        message = "WIM mode stopped, returned to static mode",
        response = res
    });
});

// ===== AUTO WIM CAPTURE (Single Trigger) =====

app.MapPost("/ws/wim/capture", async (
    WsClient cli,
    IVehicleRepository repo,
    string? direction,
    int timeoutSeconds,
    bool dummy,
    CancellationToken ct) =>
{
    direction = (direction ?? "RIGHT").ToUpperInvariant();
    if (direction != "LEFT" && direction != "RIGHT")
        return Results.BadRequest(new { error = "direction must be LEFT or RIGHT" });

    if (timeoutSeconds <= 0) timeoutSeconds = 45;
    Console.WriteLine($"[WIM][capture] start direction={direction} timeout={timeoutSeconds}s dummy={dummy}");

    Vehicle? capturedVehicle = null;
    var captureComplete = new TaskCompletionSource<bool>();

    void HandleVehicleRaw(string raw)
    {
        if (!raw.Contains("OBJECT:VEHICLE")) return;
        try
        {
            var msgFrame = ProtocolParser.ParseMsg(raw);
            capturedVehicle = VehicleMessageParser.ParseVehicleMessage(msgFrame);
            if (capturedVehicle != null)
            {
                captureComplete.TrySetResult(true);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing vehicle: {ex.Message}");
        }
    }

    void OnVehicleRes(ResFrame r) => HandleVehicleRaw(r.Raw);
    void OnVehicleMsg(MsgFrame m) => HandleVehicleRaw(m.Raw);

    if (dummy)
    {
        Console.WriteLine("[WIM][capture] dummy simulator start");
        var sim = new DummyDeviceSimulator();
        sim.OnRes += OnVehicleRes;
        sim.OnMsg += OnVehicleMsg;

        try
        {
            var simTask = sim.StartAsync(ct);

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
            var linkedCt = CancellationTokenSource.CreateLinkedTokenSource(ct, cts.Token).Token;

            Console.WriteLine("[WIM][capture] waiting for vehicle");
            try { await captureComplete.Task.WaitAsync(linkedCt); }
            catch (OperationCanceledException) { }

            sim.Stop();

            if (capturedVehicle != null)
            {
                Console.WriteLine("[WIM][capture] vehicle captured, saving");
                await repo.AddVehicleAsync(capturedVehicle, ct);
                return Results.Ok(new { success = true, message = "(dummy) Vehicle captured and saved", vehicle = capturedVehicle });
            }
            else
            {
                Console.WriteLine("[WIM][capture] no vehicle captured (dummy)");
                return Results.Ok(new { success = false, message = $"No vehicle detected within {timeoutSeconds} seconds (dummy)", vehicle = (object?)null });
            }
        }
        finally
        {
            sim.OnRes -= OnVehicleRes;
            sim.OnMsg -= OnVehicleMsg;
            try { sim.Stop(); } catch { }
        }
    }
    else
    {
        try
        {
            cli.OnRes += OnVehicleRes;
            cli.OnMsg += OnVehicleMsg;
            Console.WriteLine("[WIM][capture] set WIM mode");
            var startRes = await cli.SetModeWimAsync(direction, ct);
            if (startRes is null)
                return Results.Problem("Failed to start WIM mode");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
            var linkedCt = CancellationTokenSource.CreateLinkedTokenSource(ct, cts.Token).Token;

            Console.WriteLine("[WIM][capture] waiting for vehicle");
            try
            {
                await captureComplete.Task.WaitAsync(linkedCt);
            }
            catch (OperationCanceledException)
            {
            }

            Console.WriteLine("[WIM][capture] set static mode");
            await cli.SetModeStaticAsync(ct);

            if (capturedVehicle != null)
            {
                Console.WriteLine("[WIM][capture] vehicle captured, saving");
                await repo.AddVehicleAsync(capturedVehicle, ct);
                return Results.Ok(new { success = true, message = "Vehicle captured and saved successfully", vehicle = new VehicleResponse(
                    capturedVehicle.Id, capturedVehicle.RecordId, capturedVehicle.Timestamp, capturedVehicle.Direction.ToString(), capturedVehicle.TotalWeight, capturedVehicle.Speed, capturedVehicle.ResultCode, capturedVehicle.InfoText, capturedVehicle.AxleCount,
                    capturedVehicle.Axles.Select(a => new AxleResponse(a.AxleNumber, a.Weight, a.GrossWeight, a.Wheel1Weight, a.Wheel2Weight, a.Wheelbase, a.Speed)).ToList()
                ) });
            }
            else
            {
                Console.WriteLine("[WIM][capture] no vehicle captured");
                return Results.Ok(new { success = false, message = $"No vehicle detected within {timeoutSeconds} seconds timeout", vehicle = (object?)null });
            }
        }
        finally
        {
            cli.OnRes -= OnVehicleRes;
            cli.OnMsg -= OnVehicleMsg;
        }
    }
});

static int? ParseIntField(string raw, string key)
{
    var idx = raw.IndexOf(key + ":", StringComparison.Ordinal);
    if (idx < 0) return null;
    idx += key.Length + 1;
    var end = raw.IndexOfAny(new[] { ';', ' ', '\r', '\n' }, idx);
    if (end < 0) end = raw.Length;
    var slice = raw[idx..end];
    if (int.TryParse(slice, out var val)) return val;
    return null;
}

static async Task<(Dictionary<int, int> AxleWeights, int? LastTimeout, int? LastTotalWeight, int? LastDirection, string? LastRaw)>
    CaptureWimStreamAsync(WsClient cli, int timeoutLimit, CancellationToken ct)
{
    var captureComplete = new TaskCompletionSource<bool>();
    var axleWeights = new Dictionary<int, int>();

    int? lastTimeout = null;
    int? lastTotalWeight = null;
    int? lastDirection = null;
    string? lastRaw = null;
    bool started = false;
    bool ended = false;

    Console.WriteLine($"[WIM][stream] capture start timeout={timeoutLimit}s");

    void OnMsg(MsgFrame m)
    {
        if (!m.Raw.Contains("MODE:5")) return;

        lastRaw = m.Raw;
        var timeoutVal = ParseIntField(m.Raw, "TIMEOUT");
        if (timeoutVal is null) return;
        var timeout = timeoutVal.Value;

        if (!started)
        {
            started = true;
            Console.WriteLine("[WIM][stream] MODE:5 detected, capturing");
        }

        lastTimeout = timeout;

        var totalVal = ParseIntField(m.Raw, "TOTAL");
        if (totalVal is not null && totalVal > 0) lastTotalWeight = totalVal;

        var dirVal = ParseIntField(m.Raw, "DIR");
        if (dirVal is not null) lastDirection = dirVal;

        var axleNo = ParseIntField(m.Raw, "AXLE");
        var weightVal = ParseIntField(m.Raw, "LASTWEIGHT");
        if (axleNo is not null && axleNo > 0 && weightVal is not null && weightVal > 0)
        {
            axleWeights[axleNo.Value] = weightVal.Value;
        }

        if (started && timeout <= 0)
        {
            if (!ended)
            {
                ended = true;
                Console.WriteLine("[WIM][stream] timeout reached, finalize");
            }
            captureComplete.TrySetResult(true);
        }
    }

    try
    {
        cli.OnMsg += OnMsg;

        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutLimit + 5));
        var linkedCt = CancellationTokenSource.CreateLinkedTokenSource(ct, cts.Token).Token;

        try { await captureComplete.Task.WaitAsync(linkedCt); }
        catch (OperationCanceledException) { }
    }
    finally
    {
        cli.OnMsg -= OnMsg;
    }

    Console.WriteLine($"[WIM][stream] capture finished axles={axleWeights.Count} total={lastTotalWeight ?? axleWeights.Values.Sum()}");
    return (axleWeights, lastTimeout, lastTotalWeight, lastDirection, lastRaw);
}

// ===== WIM STREAM CAPTURE (MODE:5 MSG) =====

app.MapPost("/ws/wim/capture-stream", async (
    WsClient cli,
    IVehicleRepository repo,
    int? timeoutSeconds,
    bool? save,
    CancellationToken ct) =>
{
    var timeoutLimit = timeoutSeconds.GetValueOrDefault(45);
    if (timeoutLimit <= 0) timeoutLimit = 45;
    var shouldSave = save.GetValueOrDefault(false);
    Console.WriteLine($"[WIM][capture-stream] start timeout={timeoutLimit}s save={shouldSave}");

    var (axleWeights, lastTimeout, lastTotalWeight, lastDirection, lastRaw) =
        await CaptureWimStreamAsync(cli, timeoutLimit, ct);

    var ordered = axleWeights.OrderBy(k => k.Key).ToList();
    var totalWeight = lastTotalWeight ?? ordered.Sum(a => a.Value);

    var result = new
    {
        success = ordered.Count > 0,
        timeoutLast = lastTimeout,
        axleCount = ordered.Count,
        totalWeight = totalWeight,
        axles = ordered.Select(a => new { axle = a.Key, weight = a.Value }).ToList()
    };

    Console.WriteLine($"[WIM][stream] axles={result.axleCount}, total={result.totalWeight}");
    foreach (var a in ordered)
    {
        Console.WriteLine($"[WIM][stream] axle {a.Key}: {a.Value}");
    }

    if (shouldSave && ordered.Count > 0)
    {
        Console.WriteLine("[WIM][capture-stream] saving vehicle");
        var vehicle = new Vehicle
        {
            RecordId = 0,
            Timestamp = DateTime.UtcNow,
            Direction = lastDirection == 1 ? VehicleDirection.Right :
                        lastDirection == 2 ? VehicleDirection.Left : VehicleDirection.Unknown,
            TotalWeight = totalWeight,
            AxleCount = ordered.Count,
            RawMessage = lastRaw ?? ""
        };
        foreach (var a in ordered)
        {
            vehicle.Axles.Add(new Axle
            {
                AxleNumber = a.Key,
                Weight = a.Value,
                GrossWeight = a.Value
            });
        }

        await repo.AddVehicleAsync(vehicle, ct);
    }
    else if (shouldSave)
    {
        Console.WriteLine("[WIM][capture-stream] no vehicle to save");
    }

    return Results.Ok(result);
});

// ===== ANPR: LOGIN -> START WIM -> STREAM CAPTURE =====
app.MapPost("/ws/wim/anpr-capture", async (
    WsClient cli,
    IVehicleRepository repo,
    string? direction,
    int? timeoutSeconds,
    int? modeDelayMs,
    bool? save,
    bool? dummy,
    CancellationToken ct) =>
{
    Console.WriteLine("[WIM][anpr-capture] request received");

    var timeoutLimit = timeoutSeconds.GetValueOrDefault(45);
    if (timeoutLimit <= 0) timeoutLimit = 45;
    var shouldSave = save.GetValueOrDefault(true);
    var useDummy = dummy.GetValueOrDefault(false);
    Console.WriteLine($"[WIM][anpr-capture] timeout={timeoutLimit}s save={shouldSave} dummy={useDummy}");

    if (!useDummy && cli.State != ConnectionState.Connected)
        return Results.Problem("WSERVER not connected", statusCode: StatusCodes.Status503ServiceUnavailable);

    direction = (direction ?? "RIGHT").ToUpperInvariant();
    if (direction != "LEFT" && direction != "RIGHT")
        return Results.BadRequest(new { error = "direction must be LEFT or RIGHT" });
    Console.WriteLine($"[WIM][anpr-capture] direction={direction}");

    ResFrame? staticRes = null;
    ResFrame? startRes = null;
    if (!useDummy)
    {
        Console.WriteLine("[WIM][anpr-capture] set static mode");
        staticRes = await cli.SetModeStaticAsync(ct);
        if (staticRes is null || !staticRes.Result.Equals("OK", StringComparison.OrdinalIgnoreCase))
        {
            return Results.Problem("Failed to set static mode before WIM");
        }

        var delayMs = modeDelayMs.GetValueOrDefault(500);
        if (delayMs > 0)
        {
            Console.WriteLine($"[WIM][anpr-capture] wait {delayMs}ms before WIM");
            await Task.Delay(TimeSpan.FromMilliseconds(delayMs), ct);
        }

        Console.WriteLine("[WIM][anpr-capture] start WIM mode");
        startRes = await cli.SetModeWimAsync(direction, ct);
        if (startRes is null || !startRes.Result.Equals("OK", StringComparison.OrdinalIgnoreCase))
        {
            return Results.Problem("Failed to start WIM mode");
        }
    }

    Dictionary<int, int> axleWeights;
    int? lastTimeout;
    int? lastTotalWeight;
    int? lastDirection;
    string? lastRaw;

    if (useDummy)
    {
        axleWeights = new Dictionary<int, int> { [1] = 860, [2] = 580 };
        lastTimeout = 0;
        lastTotalWeight = 1440;
        lastDirection = direction == "RIGHT" ? 1 : 2;
        lastRaw = "DUMMY:MODE:5;AXLE:1;LASTWEIGHT:860;AXLE:2;LASTWEIGHT:580;TOTAL:1440;TIMEOUT:0;";
    }
    else
    {
        Console.WriteLine("[WIM][anpr-capture] capture stream");
        (axleWeights, lastTimeout, lastTotalWeight, lastDirection, lastRaw) =
            await CaptureWimStreamAsync(cli, timeoutLimit, ct);
    }

    var ordered = axleWeights.OrderBy(k => k.Key).ToList();
    var totalWeight = lastTotalWeight ?? ordered.Sum(a => a.Value);
    Console.WriteLine($"[WIM][anpr-capture] capture done axles={ordered.Count} total={totalWeight} timeoutLast={lastTimeout}");

    if (shouldSave && ordered.Count > 0)
    {
        Console.WriteLine("[WIM][anpr-capture] saving vehicle");
        var vehicle = new Vehicle
        {
            RecordId = 0,
            Timestamp = DateTime.UtcNow,
            Direction = lastDirection == 1 ? VehicleDirection.Right :
                        lastDirection == 2 ? VehicleDirection.Left : VehicleDirection.Unknown,
            TotalWeight = totalWeight,
            AxleCount = ordered.Count,
            RawMessage = lastRaw ?? ""
        };
        foreach (var a in ordered)
        {
            vehicle.Axles.Add(new Axle
            {
                AxleNumber = a.Key,
                Weight = a.Value,
                GrossWeight = a.Value
            });
        }

        await repo.AddVehicleAsync(vehicle, ct);
    }
    else if (shouldSave)
    {
        Console.WriteLine("[WIM][anpr-capture] no vehicle to save");
    }

    return Results.Ok(new
    {
        staticMode = staticRes,
        start = startRes,
        success = ordered.Count > 0,
        timeoutLast = lastTimeout,
        axleCount = ordered.Count,
        totalWeight = totalWeight,
        axles = ordered.Select(a => new { axle = a.Key, weight = a.Value }).ToList()
    });
});

// ===== WIM TEST INSERT (manual payload) =====
app.MapPost("/ws/wim/insert-test", async (
    IVehicleRepository repo,
    int axle1,
    int axle2,
    int totalWeight,
    Guid? siteId,
    string? direction,
    CancellationToken ct) =>
{
    direction = (direction ?? "RIGHT").ToUpperInvariant();
    if (direction != "LEFT" && direction != "RIGHT")
        return Results.BadRequest(new { error = "direction must be LEFT or RIGHT" });

    var vehicle = new Vehicle
    {
        RecordId = 0,
        Timestamp = DateTime.UtcNow,
        Direction = direction == "RIGHT" ? VehicleDirection.Right : VehicleDirection.Left,
        TotalWeight = totalWeight,
        AxleCount = 2,
        RawMessage = $"MANUAL:AXLE1={axle1};AXLE2={axle2};TOTAL={totalWeight};DIR={direction};SITEID={siteId}"
    };
    if (siteId.HasValue && siteId.Value != Guid.Empty)
        vehicle.SiteId = siteId.Value;

    vehicle.Axles.Add(new Axle { AxleNumber = 1, Weight = axle1, GrossWeight = axle1 });
    vehicle.Axles.Add(new Axle { AxleNumber = 2, Weight = axle2, GrossWeight = axle2 });

    await repo.AddVehicleAsync(vehicle, ct);

    return Results.Ok(new
    {
        success = true,
        message = "Inserted test weighing to transact_weighing",
        axleCount = 2,
        totalWeight,
        axles = new[]
        {
            new { axle = 1, weight = axle1 },
            new { axle = 2, weight = axle2 }
        }
    });
});

// POST /capture - Endpoint untuk capture dan simpan vehicle data ke PostgreSQL
app.MapPost("/capture", async (
    CaptureVehicleRequest request,
    WsClient cli,
    IVehicleRepository repo,
    bool dummy,
    CancellationToken ct) =>
{
    var direction = request.Direction?.ToUpperInvariant() ?? "RIGHT";
    if (direction != "LEFT" && direction != "RIGHT")
        direction = "RIGHT";

    var timeoutSeconds = request.TimeoutSeconds;
    if (timeoutSeconds <= 0) timeoutSeconds = 45;

    Vehicle? capturedVehicle = null;
    var captureComplete = new TaskCompletionSource<bool>();

    void HandleVehicleRaw(string raw)
    {
        if (!raw.Contains("OBJECT:VEHICLE")) return;
        try
        {
            var msgFrame = ProtocolParser.ParseMsg(raw);
            var vehicle = VehicleMessageParser.ParseVehicleMessage(msgFrame);
            if (vehicle != null)
            {
                vehicle.LocationCode = request.LocationCode;
                vehicle.SiteId = request.SiteId == Guid.Empty ? null : request.SiteId;
                capturedVehicle = vehicle;
                captureComplete.TrySetResult(true);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing vehicle: {ex.Message}");
        }
    }

    void OnVehicleRes(ResFrame r) => HandleVehicleRaw(r.Raw);
    void OnVehicleMsg(MsgFrame m) => HandleVehicleRaw(m.Raw);

    if (dummy)
    {
        var sim = new DummyDeviceSimulator();
        sim.OnRes += OnVehicleRes;
        sim.OnMsg += OnVehicleMsg;
        try
        {
            var simTask = sim.StartAsync(ct);

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
            var linkedCt = CancellationTokenSource.CreateLinkedTokenSource(ct, cts.Token).Token;

            try { await captureComplete.Task.WaitAsync(linkedCt); }
            catch (OperationCanceledException) { }

            sim.Stop();

            if (capturedVehicle != null)
            {
                await repo.AddVehicleAsync(capturedVehicle, ct);
                return Results.Ok(new VehicleCaptureResponse
                {
                    Success = true,
                    Message = "(dummy) Vehicle captured and saved successfully",
                    Vehicle = new VehicleData
                    {
                        Id = capturedVehicle.Id,
                        RecordId = capturedVehicle.RecordId,
                        Timestamp = capturedVehicle.Timestamp,
                        Direction = capturedVehicle.Direction.ToString(),
                        TotalWeight = capturedVehicle.TotalWeight,
                        Speed = capturedVehicle.Speed,
                        ResultCode = capturedVehicle.ResultCode,
                        InfoText = capturedVehicle.InfoText,
                        AxleCount = capturedVehicle.AxleCount,
                        Axles = capturedVehicle.Axles.Select(a => new AxleData
                        {
                            AxleNumber = a.AxleNumber,
                            Weight = a.Weight,
                            GrossWeight = a.GrossWeight,
                            Wheel1Weight = a.Wheel1Weight,
                            Wheel2Weight = a.Wheel2Weight,
                            Wheelbase = a.Wheelbase,
                            Speed = a.Speed
                        }).ToList()
                    }
                });
            }
            else
            {
                return Results.Ok(new VehicleCaptureResponse
                {
                    Success = false,
                    Message = $"No vehicle detected within {timeoutSeconds} seconds timeout (dummy)",
                    Vehicle = null
                });
            }
        }
        finally
        {
            sim.OnRes -= OnVehicleRes;
            sim.OnMsg -= OnVehicleMsg;
            try { sim.Stop(); } catch { }
        }
    }
    else
    {
        try
        {
            cli.OnRes += OnVehicleRes;
            cli.OnMsg += OnVehicleMsg;
            var startRes = await cli.SetModeWimAsync(direction, ct);
            if (startRes is null)
                return Results.Problem("Failed to start WIM mode");

            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
            var linkedCt = CancellationTokenSource.CreateLinkedTokenSource(ct, cts.Token).Token;

            try { await captureComplete.Task.WaitAsync(linkedCt); }
            catch (OperationCanceledException) { }

            await cli.SetModeStaticAsync(ct);

            if (capturedVehicle != null)
            {
                await repo.AddVehicleAsync(capturedVehicle, ct);

                return Results.Ok(new VehicleCaptureResponse
                {
                    Success = true,
                    Message = "Vehicle captured and saved successfully",
                    Vehicle = new VehicleData
                    {
                        Id = capturedVehicle.Id,
                        RecordId = capturedVehicle.RecordId,
                        Timestamp = capturedVehicle.Timestamp,
                        Direction = capturedVehicle.Direction.ToString(),
                        TotalWeight = capturedVehicle.TotalWeight,
                        Speed = capturedVehicle.Speed,
                        ResultCode = capturedVehicle.ResultCode,
                        InfoText = capturedVehicle.InfoText,
                        AxleCount = capturedVehicle.AxleCount,
                        Axles = capturedVehicle.Axles.Select(a => new AxleData
                        {
                            AxleNumber = a.AxleNumber,
                            Weight = a.Weight,
                            GrossWeight = a.GrossWeight,
                            Wheel1Weight = a.Wheel1Weight,
                            Wheel2Weight = a.Wheel2Weight,
                            Wheelbase = a.Wheelbase,
                            Speed = a.Speed
                        }).ToList()
                    }
                });
            }
            else
            {
                return Results.Ok(new VehicleCaptureResponse
                {
                    Success = false,
                    Message = $"No vehicle detected within {timeoutSeconds} seconds timeout",
                    Vehicle = null
                });
            }
        }
        finally
        {
            cli.OnRes -= OnVehicleRes;
            cli.OnMsg -= OnVehicleMsg;
        }
    }
});

// ===== Vehicle Weighing Endpoints =====

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

app.Run();
