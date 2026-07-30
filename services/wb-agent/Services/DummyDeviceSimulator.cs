using System.Text.Json;
using WServerApi.Models;

namespace WServerApi.Services;

// Simple simulator that emits MsgFrame and ResFrame events to mimic a real device.
public class DummyDeviceSimulator
{
    private CancellationTokenSource? _cts;

    public event Action<ResFrame>? OnRes;
    public event Action<MsgFrame>? OnMsg;

    public Task StartAsync(CancellationToken token = default)
    {
        _cts = CancellationTokenSource.CreateLinkedTokenSource(token);
        var ct = _cts.Token;

        return Task.Run(async () =>
        {
            var rand = new Random();
            try
            {
                // Periodically emit MODE:5 messages (WIM streaming)
                while (!ct.IsCancellationRequested)
                {
                    var msgRaw = $"#MSG MODE:5;TS:{DateTime.UtcNow:O};IDX:{rand.Next(1000,9999)};\r\n";
                    var msg = new MsgFrame(msgRaw, new Dictionary<string,string>{{"MODE","5"}});
                    OnMsg?.Invoke(msg);

                    // Occasionally emit a vehicle ResFrame to simulate a captured vehicle
                    if (rand.NextDouble() < 0.4)
                    {
                        // Generate realistic vehicle data with axles
                        var recordId = rand.Next(100000, 999999);
                        var totalWeight = rand.Next(15000, 45000);
                        var speed = rand.Next(30, 100);
                        var axleCount = rand.Next(2, 6); // 2-5 axles typical for trucks
                        
                        var axleData = "";
                        var axleList = new List<string>();
                        
                        for (int i = 1; i <= axleCount; i++)
                        {
                            var axleWeight = rand.Next(3000, 12000);
                            var grossWeight = axleWeight + rand.Next(-500, 500);
                            var wheel1 = axleWeight / 2 + rand.Next(-200, 200);
                            var wheel2 = axleWeight - wheel1;
                            var wheelbase = rand.Next(120, 200) + rand.NextDouble() * 50; // 120-250 cm
                            var axleSpeed = speed + rand.Next(-5, 5);
                            
                            axleData += $" AXLENO:{i} WEIGHT:{axleWeight} GWEIGHT:{grossWeight} WHEEL1:{wheel1} WHEEL2:{wheel2} BASE:{wheelbase:F1} SPEED:{axleSpeed:F1}";
                        }
                        
                        var resRaw = $"#RES OBJECT:VEHICLE;RECID:{recordId};TIME:{DateTime.UtcNow:O};DIR:RIGHT;WEIGHT:{totalWeight};SPEED:{speed:F1};RES:0;INFOTEXT:\"Vehicle captured successfully\";WS:WIM001;AXLECOUNT:{axleCount};{axleData};\r\n";
                        var res = new ResFrame(resRaw, "OK", new Dictionary<string,string>{{"OBJECT","VEHICLE"}});
                        OnRes?.Invoke(res);
                    }

                    await Task.Delay(TimeSpan.FromSeconds(2), ct);
                }
            }
            catch (OperationCanceledException) { }
        }, ct);
    }

    public void Stop()
    {
        try { _cts?.Cancel(); } catch { }
        _cts?.Dispose();
        _cts = null;
    }
}
