using WServerApi.Models;

namespace WServerApi.Services;

public static class WimFrameHelpers
{
    public static int? ParseIntField(string raw, string key)
    {
        var idx = raw.IndexOf(key + ":", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        idx += key.Length + 1;
        var end = raw.IndexOfAny(new[] { ';', ' ', '\r', '\n' }, idx);
        if (end < 0) end = raw.Length;
        var slice = raw[idx..end];
        if (int.TryParse(slice, out var val)) return val;
        return null;
    }

    public static double? ParseDoubleField(string raw, string key)
    {
        var idx = raw.IndexOf(key + ":", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        idx += key.Length + 1;
        var end = raw.IndexOfAny(new[] { ';', ' ', '\r', '\n' }, idx);
        if (end < 0) end = raw.Length;
        var slice = raw[idx..end];
        if (double.TryParse(slice, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var val)) return val;
        return null;
    }

    public static string? ExtractSection(string raw, string key)
    {
        var idx = raw.IndexOf(key + ":", StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        var end = raw.IndexOf(';', idx);
        if (end < 0) end = raw.Length;
        return raw[idx..end];
    }

    public static string? DirectionLabel(int? direction)
        => direction switch
        {
            0 => "LEFT",
            1 => "RIGHT",
            2 => "LEFT",
            _ => null
        };

    public static object BuildWimStatusSnapshot(WsClient cli, string eventType, string? raw)
    {
        var mode = raw is null ? null : ParseIntField(raw, "MODE");
        var bridge1 = raw is null ? null : ExtractSection(raw, "BRIDGE1");
        var bridge2 = raw is null ? null : ExtractSection(raw, "BRIDGE2");
        var channel1 = raw is null ? null : ExtractSection(raw, "CHANNEL1");
        var channel2 = raw is null ? null : ExtractSection(raw, "CHANNEL2");
        var bridge1Weight = bridge1 is null ? null : ParseIntField(bridge1, "WEIGHT");
        var bridge2Weight = bridge2 is null ? null : ParseIntField(bridge2, "WEIGHT");
        int? bridgeTotalWeight =
            bridge1Weight is null && bridge2Weight is null
                ? null
                : bridge1Weight.GetValueOrDefault() + bridge2Weight.GetValueOrDefault();
        var direction = raw is null ? null : ParseIntField(raw, "DIR");
        var totalWeight = raw is null ? null : mode == 3 ? bridgeTotalWeight : ParseIntField(raw, "TOTAL");
        var lastWeight = raw is null ? null : ParseIntField(raw, "LASTWEIGHT");
        var axle = raw is null ? null : ParseIntField(raw, "AXLE");
        var timeout = raw is null ? null : ParseIntField(raw, "TIMEOUT");
        var load = raw is null ? null : ParseIntField(raw, "LOAD");
        var overload = raw is null ? null : ParseIntField(raw, "OVERLOAD");

        return new
        {
            type = eventType,
            connected = cli.State is ConnectionState.Connected or ConnectionState.LoggedIn,
            connectionState = cli.State.ToString(),
            mode,
            direction,
            directionLabel = DirectionLabel(direction),
            axle,
            lastWeight,
            totalWeight,
            bridge1Weight,
            bridge2Weight,
            bridgeTotalWeight,
            bridge1State = bridge1 is null ? null : ParseIntField(bridge1, "STATE"),
            bridge2State = bridge2 is null ? null : ParseIntField(bridge2, "STATE"),
            channel1Value = channel1 is null ? null : ParseIntField(channel1, "VALUE"),
            channel2Value = channel2 is null ? null : ParseIntField(channel2, "VALUE"),
            timeout,
            load,
            overload,
            updatedAt = DateTimeOffset.UtcNow,
            raw
        };
    }

    public static object BuildWimVehicleSnapshot(WsClient cli, string raw)
    {
        var direction = ParseIntField(raw, "DIR");

        return new
        {
            type = "vehicle",
            connected = cli.State is ConnectionState.Connected or ConnectionState.LoggedIn,
            connectionState = cli.State.ToString(),
            recordId = ParseIntField(raw, "RECID"),
            resultCode = ParseIntField(raw, "RES"),
            direction,
            directionLabel = DirectionLabel(direction),
            totalWeight = ParseIntField(raw, "WEIGHT"),
            axleCount = ParseIntField(raw, "AXLECOUNT"),
            speed = ParseDoubleField(raw, "SPEED"),
            updatedAt = DateTimeOffset.UtcNow,
            raw
        };
    }

    public static async Task<(Dictionary<int, int> AxleWeights, int? LastTimeout, int? LastTotalWeight, int? LastDirection, string? LastRaw)>
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
}
