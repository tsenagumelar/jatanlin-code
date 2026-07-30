using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Npgsql;
using System.Text.Json;
using WServerApi.Configuration;
using WServerApi.Endpoints;
using WServerApi.Models;
using WServerApi.Models.Domain;
using WServerApi.Models.Dto;
using WServerApi.Services;
using static WServerApi.Services.WimFrameHelpers;
using static WServerApi.Services.WimSessionResolver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddWbAgentServices(builder.Configuration);

var app = builder.Build();

// PostgreSQL schema is expected to exist; migrations are managed separately.
app.MapRootEndpoints();
app.MapWServerControlEndpoints();

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

// Structured SSE stream for live WIM condition/status. This endpoint is intended
// for dashboards that need the current TCP connection state and parsed MODE:5 data.
app.MapGet("/ws/wim/live", async (HttpContext ctx, WsClient cli) =>
{
    ctx.Response.Headers.Append("Content-Type", "text/event-stream");
    ctx.Response.Headers.Append("Cache-Control", "no-cache");
    ctx.Response.Headers.Append("Connection", "keep-alive");
    ctx.Response.Headers.Append("Access-Control-Allow-Origin", "*");

    var writeLock = new SemaphoreSlim(1, 1);
    string? lastRaw = null;
    var lastSnapshot = BuildWimStatusSnapshot(cli, "status", null);

    async Task WriteEventAsync(string eventName, object payload)
    {
        if (ctx.RequestAborted.IsCancellationRequested) return;

        await writeLock.WaitAsync(ctx.RequestAborted);
        try
        {
            await ctx.Response.WriteAsync($"event: {eventName}\n", ctx.RequestAborted);
            await ctx.Response.WriteAsync($"data: {JsonSerializer.Serialize(payload)}\n\n", ctx.RequestAborted);
            await ctx.Response.Body.FlushAsync(ctx.RequestAborted);
        }
        catch (OperationCanceledException)
        {
            // Client disconnected.
        }
        finally
        {
            writeLock.Release();
        }
    }

    void OnMsg(MsgFrame m)
    {
        if (m.Raw.Contains("MODE:5", StringComparison.OrdinalIgnoreCase) ||
            m.Raw.Contains("MODE:3", StringComparison.OrdinalIgnoreCase))
        {
            lastRaw = m.Raw;
            lastSnapshot = BuildWimStatusSnapshot(cli, "wim", m.Raw);
            _ = WriteEventAsync("wim", lastSnapshot);
            return;
        }

        if (m.Raw.Contains("OBJECT:VEHICLE", StringComparison.OrdinalIgnoreCase))
        {
            lastRaw = m.Raw;
            lastSnapshot = BuildWimVehicleSnapshot(cli, m.Raw);
            _ = WriteEventAsync("vehicle", lastSnapshot);
        }
    }

    void OnRes(ResFrame r)
    {
        if (r.Raw.Contains("OBJECT:VEHICLE", StringComparison.OrdinalIgnoreCase))
        {
            lastRaw = r.Raw;
            lastSnapshot = BuildWimVehicleSnapshot(cli, r.Raw);
            _ = WriteEventAsync("vehicle", lastSnapshot);
        }
    }

    cli.OnMsg += OnMsg;
    cli.OnRes += OnRes;

    try
    {
        await WriteEventAsync("status", lastSnapshot);

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(2));
        while (await timer.WaitForNextTickAsync(ctx.RequestAborted))
        {
            await WriteEventAsync("status", BuildWimStatusSnapshot(cli, "status", lastRaw));
        }
    }
    catch (OperationCanceledException)
    {
        // Client disconnected.
    }
    finally
    {
        cli.OnMsg -= OnMsg;
        cli.OnRes -= OnRes;
        writeLock.Dispose();
    }

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

    if (timeoutSeconds <= 0) timeoutSeconds = 60;
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

// ===== WIM STREAM CAPTURE (MODE:5 MSG) =====

app.MapPost("/ws/wim/capture-stream", async (
    WsClient cli,
    IVehicleRepository repo,
    int? timeoutSeconds,
    bool? save,
    CancellationToken ct) =>
{
    var timeoutLimit = timeoutSeconds.GetValueOrDefault(60);
    if (timeoutLimit <= 0) timeoutLimit = 60;
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

// ===== MANUAL WIM TRIGGER (REAL DEVICE -> 60s STREAM -> DB INSERT) =====
app.MapPost("/ws/wim/trigger", async (
    WsClient cli,
    IVehicleRepository repo,
    IConfiguration config,
    IOptions<WbOptions> wbOptions,
    string? direction,
    int? timeoutSeconds,
    int? modeDelayMs,
    [FromQuery(Name = "session_id")] Guid? sessionId,
    [FromQuery(Name = "site_id")] Guid? siteId,
    CancellationToken ct) =>
{
    var timeoutLimit = timeoutSeconds.GetValueOrDefault(60);
    if (timeoutLimit <= 0) timeoutLimit = 60;

    direction = (direction ?? "RIGHT").ToUpperInvariant();
    if (direction != "LEFT" && direction != "RIGHT")
        return Results.BadRequest(new { error = "direction must be LEFT or RIGHT" });

    if (cli.State != ConnectionState.Connected)
        return Results.Problem("WSERVER not connected", statusCode: StatusCodes.Status503ServiceUnavailable);

    Console.WriteLine($"[WIM][trigger] start direction={direction} timeout={timeoutLimit}s");

    ResFrame? staticBefore = null;
    ResFrame? startRes = null;
    ResFrame? staticAfter = null;

    try
    {
        Console.WriteLine("[WIM][trigger] set static mode");
        staticBefore = await cli.SetModeStaticAsync(ct);
        if (staticBefore is null || !staticBefore.Result.Equals("OK", StringComparison.OrdinalIgnoreCase))
            return Results.Problem("Failed to set static mode before WIM");

        var delayMs = modeDelayMs.GetValueOrDefault(500);
        if (delayMs > 0)
        {
            Console.WriteLine($"[WIM][trigger] wait {delayMs}ms before WIM");
            await Task.Delay(TimeSpan.FromMilliseconds(delayMs), ct);
        }

        Console.WriteLine("[WIM][trigger] set WIM mode");
        startRes = await cli.SetModeWimAsync(direction, ct);
        if (startRes is null || !startRes.Result.Equals("OK", StringComparison.OrdinalIgnoreCase))
            return Results.Problem("Failed to start WIM mode");

        Console.WriteLine("[WIM][trigger] capture stream");
        var (axleWeights, lastTimeout, lastTotalWeight, lastDirection, lastRaw) =
            await CaptureWimStreamAsync(cli, timeoutLimit, ct);

        var ordered = axleWeights.OrderBy(k => k.Key).ToList();
        var totalWeight = lastTotalWeight ?? ordered.Sum(a => a.Value);
        var session = await ResolveWimTriggerSessionAsync(config, wbOptions, sessionId, siteId, ct);

        if (ordered.Count == 0)
        {
            Console.WriteLine("[WIM][trigger] no vehicle to save");
            return Results.Ok(new
            {
                success = false,
                message = $"No WIM data detected within {timeoutLimit} seconds",
                staticBefore,
                start = startRes,
                timeoutLast = lastTimeout,
                axleCount = 0,
                totalWeight = 0,
                axles = Array.Empty<object>()
            });
        }

        var vehicle = new Vehicle
        {
            RecordId = 0,
            Timestamp = DateTime.UtcNow,
            Direction = lastDirection == 1 ? VehicleDirection.Right :
                        lastDirection == 2 ? VehicleDirection.Left : VehicleDirection.Unknown,
            TotalWeight = totalWeight,
            AxleCount = ordered.Count,
            RawMessage = lastRaw ?? "",
            SiteId = session?.SiteId,
            SessionId = session?.SessionId
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

        Console.WriteLine("[WIM][trigger] saving vehicle");
        await repo.AddVehicleAsync(vehicle, ct);

        return Results.Ok(new
        {
            success = true,
            message = "WIM data captured and inserted",
            sessionId = session?.SessionId,
            siteId = session?.SiteId,
            staticBefore,
            start = startRes,
            timeoutLast = lastTimeout,
            axleCount = ordered.Count,
            totalWeight,
            axles = ordered.Select(a => new { axle = a.Key, weight = a.Value }).ToList()
        });
    }
    finally
    {
        try
        {
            Console.WriteLine("[WIM][trigger] set static mode after capture");
            staticAfter = await cli.SetModeStaticAsync(CancellationToken.None);
            _ = staticAfter;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WIM][trigger] failed to set static after capture: {ex.Message}");
        }
    }
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

    var timeoutLimit = timeoutSeconds.GetValueOrDefault(60);
    if (timeoutLimit <= 0) timeoutLimit = 60;
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
    if (timeoutSeconds <= 0) timeoutSeconds = 60;

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

app.MapVehicleEndpoints();

app.Run();
