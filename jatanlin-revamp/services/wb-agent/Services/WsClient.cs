using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Options;
using WServerApi.Models;

namespace WServerApi.Services;

public class WServerOptions
{
    public string Host { get; set; } = "127.0.0.1";
    public int Port { get; set; } = 65002;
    public bool AutoLogin { get; set; } = true;
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public int ReconnectSeconds { get; set; } = 3;
}

public class WsClient : BackgroundService
{
    private readonly ILogger<WsClient> _log;
    private readonly WServerOptions _opt;
    private TcpClient? _tcp;
    private NetworkStream? _ns;
    private readonly object _sendLock = new();
    private string _recvBuffer = "";
    private readonly List<string> _msgRing = new(); // small in-memory queue
    private const int MaxRing = 200;
    public ConnectionState State { get; private set; } = ConnectionState.Disconnected;

    public event Action<ResFrame>? OnRes;
    public event Action<MsgFrame>? OnMsg;

    public WsClient(ILogger<WsClient> log, IOptions<WServerOptions> opt)
    {
        _log = log;
        _opt = opt.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                State = ConnectionState.Connecting;
                var host = string.IsNullOrWhiteSpace(_opt.Host) ? "127.0.0.1" : _opt.Host;
                _log.LogInformation("Connecting to {host}:{port} ...", host, _opt.Port);
                _tcp = new TcpClient();
                await _tcp.ConnectAsync(host, _opt.Port, stoppingToken);
                _ns = _tcp.GetStream();
                State = ConnectionState.Connected;
                _log.LogInformation("Connected.");

                if (_opt.AutoLogin && !string.IsNullOrWhiteSpace(_opt.Username))
                {
                    await LoginAsync(_opt.Username, _opt.Password, stoppingToken);
                }

                var buf = new byte[8192];
                while (!stoppingToken.IsCancellationRequested)
                {
                    int n = await _ns.ReadAsync(buf.AsMemory(0, buf.Length), stoppingToken);
                    if (n <= 0) throw new IOException("Server closed");
                    _recvBuffer += Encoding.ASCII.GetString(buf, 0, n);

                    var (frames, remaining) = ProtocolParser.ParseFrames(_recvBuffer);
                    _recvBuffer = remaining;

                    foreach (var frame in frames)
                    {
                        switch (frame)
                        {
                            case ResFrame r:
                                OnRes?.Invoke(r);
                                if (r.Result.Equals("OK", StringComparison.OrdinalIgnoreCase))
                                    _log.LogDebug("RES OK: {raw}", r.Raw);
                                else
                                    _log.LogWarning("RES: {raw}", r.Raw);
                                break;
                            case MsgFrame m:
                                OnMsg?.Invoke(m);
                                lock (_msgRing)
                                {
                                    _msgRing.Add(m.Raw);
                                    if (_msgRing.Count > MaxRing) _msgRing.RemoveAt(0);
                                }
                                break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Connection loop error. Reconnecting in {sec}s ...", _opt.ReconnectSeconds);
                try { _ns?.Dispose(); } catch { }
                try { _tcp?.Close(); } catch { }
                _ns = null;
                _tcp = null;
                await Task.Delay(TimeSpan.FromSeconds(_opt.ReconnectSeconds), stoppingToken);
            }
        }
    }

    public Task SendAsync(string line, CancellationToken ct = default)
    {
        if (_ns is null) throw new InvalidOperationException("Not connected");
        var bytes = Encoding.ASCII.GetBytes(line);
        lock (_sendLock)
        {
            return _ns.WriteAsync(bytes, 0, bytes.Length, ct);
        }
    }

    public async Task<ResFrame?> SendReqAsync(Dictionary<string,string> fields, CancellationToken ct = default)
    {
        var tcs = new TaskCompletionSource<ResFrame?>();
        void Handler(ResFrame r) => tcs.TrySetResult(r);
        OnRes += Handler;
        try
        {
            var req = ProtocolParser.BuildReq(fields);
            await SendAsync(req, ct);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));
            await Task.WhenAny(tcs.Task, Task.Delay(-1, cts.Token));
            return tcs.Task.IsCompleted ? tcs.Task.Result : null;
        }
        finally
        {
            OnRes -= Handler;
        }
    }

    public async Task<ResFrame?> SendRawReqAsync(string command, CancellationToken ct = default)
    {
        var tcs = new TaskCompletionSource<ResFrame?>();
        void Handler(ResFrame r) => tcs.TrySetResult(r);
        OnRes += Handler;
        try
        {
            var req = $"#REQ {command};\r\n";
            _log.LogDebug("Sending raw: {req}", req.Trim());
            await SendAsync(req, ct);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));
            await Task.WhenAny(tcs.Task, Task.Delay(-1, cts.Token));
            return tcs.Task.IsCompleted ? tcs.Task.Result : null;
        }
        finally
        {
            OnRes -= Handler;
        }
    }

    public Task<ResFrame?> LoginAsync(string user, string pass, CancellationToken ct = default)
        => SendReqAsync(new Dictionary<string, string>{
            ["CMD"] = "LOGIN",
            ["UID"] = user,
            ["pwd"] = pass
        }, ct);

    public Task<ResFrame?> SetModeStaticAsync(CancellationToken ct = default)
        => SendRawReqAsync("CMD:SETMODE STAT");

    public Task<ResFrame?> SetModeWimAsync(string direction, CancellationToken ct = default)
        => SendRawReqAsync($"CMD:SETMODE DYNAV {direction}");

    public IReadOnlyList<string> GetRecentMsgs()
    {
        lock (_msgRing) return _msgRing.ToList();
    }
}
