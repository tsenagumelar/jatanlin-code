namespace WServerApi.Models;

public record MsgFrame(
    string Raw,
    Dictionary<string,string> Fields
);
