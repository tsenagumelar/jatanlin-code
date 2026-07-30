using System.Text;
using WServerApi.Models;

namespace WServerApi.Services;

public static class ProtocolParser
{
    // Split incoming stream into logical frames:
    //  - #RES ... #ENDRES (response frame)
    //  - #MSG ... ; (message terminated by ';' or newline-chunks; we gather until next '#')
    public static (List<object> frames, string remainingBuffer) ParseFrames(string buffer)
    {
        var frames = new List<object>();
        while (true)
        {
            if (string.IsNullOrEmpty(buffer)) break;

            if (buffer.StartsWith("#RES"))
            {
                var endTag = "#ENDRES";
                var endIdx = buffer.IndexOf(endTag, StringComparison.Ordinal);
                if (endIdx < 0) break; // wait more bytes

                var chunk = buffer[..(endIdx + endTag.Length)];
                buffer = buffer[(endIdx + endTag.Length)..];

                frames.Add(ParseRes(chunk));
            }
            else if (buffer.StartsWith("#MSG"))
            {
                // A naive approach: read until we see another '#'
                // then take everything up to before '#'
                var nextHash = buffer.IndexOf('#', 1);
                string chunk;
                if (nextHash < 0) { break; } // wait more bytes
                chunk = buffer[..nextHash];
                buffer = buffer[nextHash..];

                frames.Add(ParseMsg(chunk));
            }
            else
            {
                // Drop noise until next '#'
                var next = buffer.IndexOf('#');
                if (next < 0) { buffer = ""; break; }
                buffer = buffer[next..];
            }
        }
        return (frames, buffer);
    }

    public static ResFrame ParseRes(string raw)
    {
        // Example: "#RES RESULT:OK; KEY:VALUE; ... ;#ENDRES"
        var fields = TokenizeFields(raw);
        fields.TryGetValue("RESULT", out var result);
        return new ResFrame(raw, result ?? "", fields);
    }

    public static MsgFrame ParseMsg(string raw)
    {
        // Example: "#MSG MODE:... STATUS:... WEIGHT:...; ..."
        var fields = TokenizeFields(raw);
        return new MsgFrame(raw, fields);
    }

    private static Dictionary<string,string> TokenizeFields(string raw)
    {
        var dict = new Dictionary<string,string>(StringComparer.OrdinalIgnoreCase);
        // Remove header tags
        var trimmed = raw.Trim();
        trimmed = trimmed.Replace("#RES", "", StringComparison.OrdinalIgnoreCase)
                         .Replace("#MSG", "", StringComparison.OrdinalIgnoreCase)
                         .Replace("#ENDRES", "", StringComparison.OrdinalIgnoreCase);

        // Split by ';' then by ':'
        foreach (var part in trimmed.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var idx = part.IndexOf(':');
            if (idx > 0)
            {
                var key = part[..idx].Trim();
                var val = part[(idx+1)..].Trim().Trim('"');
                if (!string.IsNullOrEmpty(key))
                    dict[key] = val;
            }
        }
        return dict;
    }

    public static string BuildReq(Dictionary<string,string> fields)
    {
        // Build "#REQ KEY:VAL KEY:VAL;"
        var sb = new StringBuilder();
        sb.Append("#REQ ");
        foreach (var kv in fields)
        {
            var v = kv.Value.Contains(' ') || kv.Value.Contains(':') ? $"\"{kv.Value}\"" : kv.Value;
            sb.Append($"{kv.Key}:{v} ");
        }
        sb.Append(';');
        return sb.ToString() + "\r\n";
    }
}
