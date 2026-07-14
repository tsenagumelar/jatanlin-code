using WServerApi.Models;
using WServerApi.Services;

namespace WServerApi.Endpoints;

public static class RootEndpoints
{
    public static WebApplication MapRootEndpoints(this WebApplication app)
    {
        app.MapGet("/", () => Results.Ok(new
        {
            ok = true,
            service = "WServerApi",
            endpoints = new[]
            {
                "/ws/login?user=&pass=",
                "/ws/mode/static",
                "/ws/mode/wim?direction=LEFT|RIGHT",
                "/ws/msgs",
                "/ws/stream",
                "/ws/wim/start?direction=LEFT|RIGHT",
                "/ws/wim/data",
                "/ws/wim/live",
                "/ws/wim/stop",
                "/ws/wim/capture?direction=LEFT|RIGHT&timeoutSeconds=60 (AUTO: Start->Wait->Save->Stop)",
                "/ws/wim/trigger?direction=LEFT|RIGHT&timeoutSeconds=60 (REAL STREAM: Start->Listen->Save->Stop)",
                "/capture (POST - PostgreSQL capture with location/site)",
                "/ws/latest-vehicle",
                "/ws/vehicles?page=1&pageSize=20&successOnly=true",
                "/ws/vehicles/{id:guid}",
                "/ws/vehicles/recid/{recid}",
                "/ws/vehicles/stats"
            }
        }));

        return app;
    }
}

public static class WServerControlEndpoints
{
    public static WebApplication MapWServerControlEndpoints(this WebApplication app)
    {
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

        app.MapGet("/ws/msgs", (WsClient cli) => Results.Ok(cli.GetRecentMsgs()));

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

        return app;
    }
}
