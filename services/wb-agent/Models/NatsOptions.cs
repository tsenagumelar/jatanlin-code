namespace WServerApi.Models;

public class NatsOptions
{
    public string? Url { get; set; }
    public string Bucket { get; set; } = "anpr-capture";
    public int RetryIntervalSeconds { get; set; } = 10;
}
