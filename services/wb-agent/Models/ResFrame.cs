namespace WServerApi.Models;

public record ResFrame(
    string Raw,
    string Result,
    Dictionary<string,string> Fields
);
