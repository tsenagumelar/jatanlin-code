using System.Globalization;
using WServerApi.Models;
using WServerApi.Models.Domain;

namespace WServerApi.Services;

public static class VehicleMessageParser
{
    public static bool IsVehicleMessage(MsgFrame msg)
    {
        return msg.Fields.TryGetValue("OBJECT", out var obj) &&
               obj.Equals("VEHICLE", StringComparison.OrdinalIgnoreCase);
    }

    public static Vehicle? ParseVehicleMessage(MsgFrame msg)
    {
        try
        {
            if (!IsVehicleMessage(msg)) return null;

            var fields = msg.Fields;

            var vehicle = new Vehicle
            {
                RecordId = ParseInt(fields, "RECID", 0),
                Timestamp = ParseDateTime(fields, "TIME"),
                Direction = ParseDirection(fields, "DIR"),
                TotalWeight = ParseInt(fields, "WEIGHT", 0),
                Speed = ParseDouble(fields, "SPEED", 0),
                ResultCode = ParseInt(fields, "RES", -1),
                InfoText = fields.GetValueOrDefault("INFOTEXT"),
                WsCode = fields.GetValueOrDefault("WS"),
                AxleCount = ParseInt(fields, "AXLECOUNT", 0),
                RawMessage = msg.Raw
            };

            // Parse axle data - requires multi-value parsing
            vehicle.Axles = ParseAxles(msg.Raw, vehicle.AxleCount);

            return vehicle;
        }
        catch (Exception)
        {
            // Log parsing error but don't throw - return null to skip invalid messages
            return null;
        }
    }

    private static List<Axle> ParseAxles(string rawMessage, int axleCount)
    {
        var axles = new List<Axle>();

        // AXLE data appears as repeated groups: AXLENO:1 WEIGHT:2760 GWEIGHT:2755 ...
        // Split raw message and extract AXLENO blocks
        var parts = rawMessage.Split(new[] { "AXLENO:" }, StringSplitOptions.RemoveEmptyEntries);

        for (int i = 1; i < parts.Length && i <= axleCount; i++)
        {
            var axleData = parts[i];
            var axleFields = ParseFieldsInString(axleData);

            axles.Add(new Axle
            {
                AxleNumber = ParseInt(axleFields, "AXLENO", i),
                Weight = ParseInt(axleFields, "WEIGHT", 0),
                GrossWeight = ParseInt(axleFields, "GWEIGHT", 0),
                Wheel1Weight = ParseInt(axleFields, "WHEEL1", 0),
                Wheel2Weight = ParseInt(axleFields, "WHEEL2", 0),
                Wheelbase = ParseDouble(axleFields, "BASE", 0),
                Speed = ParseDouble(axleFields, "SPEED", 0)
            });
        }

        return axles;
    }

    private static Dictionary<string, string> ParseFieldsInString(string text)
    {
        // Similar to ProtocolParser.TokenizeFields but for axle substring
        var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var parts = text.Split(new[] { ' ', ';' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var part in parts)
        {
            var idx = part.IndexOf(':');
            if (idx > 0)
            {
                var key = part[..idx].Trim();
                var val = part[(idx + 1)..].Trim().Trim('"');
                dict[key] = val;
            }
        }
        return dict;
    }

    private static int ParseInt(Dictionary<string, string> fields, string key, int defaultValue)
    {
        return fields.TryGetValue(key, out var val) && int.TryParse(val, out var result)
            ? result : defaultValue;
    }

    private static double ParseDouble(Dictionary<string, string> fields, string key, double defaultValue)
    {
        return fields.TryGetValue(key, out var val) &&
               double.TryParse(val, NumberStyles.Float, CultureInfo.InvariantCulture, out var result)
            ? result : defaultValue;
    }

    private static DateTime ParseDateTime(Dictionary<string, string> fields, string key)
    {
        if (fields.TryGetValue(key, out var val))
        {
            // Format: "2020-01-15 11:21:55"
            if (DateTime.TryParseExact(val, "yyyy-MM-dd HH:mm:ss",
                CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var dt))
            {
                return dt.ToUniversalTime();
            }
        }
        return DateTime.UtcNow;
    }

    private static VehicleDirection ParseDirection(Dictionary<string, string> fields, string key)
    {
        var val = ParseInt(fields, key, 0);
        return val switch
        {
            1 => VehicleDirection.Left,
            2 => VehicleDirection.Right,
            _ => VehicleDirection.Unknown
        };
    }
}
