# WB Agent Tech & Packages

## Tech Stack

- Runtime: .NET 8.
- Framework: ASP.NET Core Minimal API.
- Background service: `WsClient` sebagai hosted service koneksi WServer.
- Database: PostgreSQL via Npgsql.
- Queue/cache retry: NATS KeyValue via NATS.Client.
- Protocol: TCP ASCII frame WServerAPI.
- Serialization: `System.Text.Json`.

## Package References

- `Microsoft.Extensions.Hosting@8.0.0`: hosted service dan background worker.
- `Npgsql@8.0.3`: koneksi dan command PostgreSQL.
- `NATS.Client@1.1.8`: koneksi NATS, JetStream, dan KeyValue.

## Project Settings

- `TargetFramework`: `net8.0`.
- `Nullable`: enabled.
- `ImplicitUsings`: enabled.
- `InvariantGlobalization`: true.

## Konfigurasi

- `WServer:Host`: host/IP WServer device.
- `WServer:Port`: port WServer, default umum `65002`.
- `WServer:AutoLogin`: auto login setelah koneksi TCP tersambung.
- `WServer:Username`: username WServer.
- `WServer:Password`: password WServer.
- `WServer:ReconnectSeconds`: delay reconnect saat koneksi putus.
- `ConnectionStrings:PostgresDatabase`: connection string PostgreSQL.
- `DATABASE_URL`: alternatif env untuk PostgreSQL, mendukung format URL `postgres://`.
- `Nats:Url` atau `NATS_URL`: endpoint NATS.
- `Nats:Bucket`: bucket KV cache, default `anpr-capture`.
- `Nats:RetryIntervalSeconds`: interval retry insert cache.
