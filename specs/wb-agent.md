# Spesifikasi WB Agent

## Lokasi

`jatanlin-wb-agent`

## Tujuan

`jatanlin-wb-agent` adalah aplikasi .NET 8 ASP.NET Core minimal API untuk menjadi bridge antara sistem Jatanlin dan device WServer/WIM. Service ini mengontrol mode WIM/static, membaca stream/progress device, parsing hasil penimbangan, dan insert data berat ke PostgreSQL.

## Stack

- .NET 8
- ASP.NET Core Minimal API
- Npgsql
- NATS.Client
- Hosted service `WsClient`

## Konfigurasi

- Section `WServer`: host, port, auto-login, username, password, reconnect interval.
- Section `ConnectionStrings:PostgresDatabase` atau env `DATABASE_URL`: koneksi PostgreSQL.
- Section `Nats` dan env `NATS_URL`: NATS KV cache untuk retry insert.
- `Nats:Bucket`: default `anpr-capture`.
- `Nats:RetryIntervalSeconds`: interval retry cache.

## Endpoint Utama

- `GET /`: informasi service dan endpoint.
- `POST /ws/login?user=&pass=`: login ke WServer.
- `POST /ws/mode/static`: set device ke static mode.
- `POST /ws/mode/wim?direction=LEFT|RIGHT`: set WIM mode.
- `GET /ws/msgs`: recent raw message ring buffer.
- `GET /ws/stream`: SSE semua raw `#MSG` dan `#RES`.
- `POST /ws/wim/start`: mulai WIM mode.
- `GET /ws/wim/data`: SSE khusus WIM mode dan vehicle result.
- `POST /ws/wim/stop`: stop WIM dan kembali static.
- `POST /ws/wim/capture`: start WIM, tunggu `OBJECT:VEHICLE`, parse, simpan.
- `POST /ws/wim/capture-stream`: membaca progress `MODE:5`, akumulasi `LASTWEIGHT`, optional save.
- `POST /ws/wim/anpr-capture`: flow utama untuk trigger dari ANPR; static mode, delay, start WIM, capture stream, optional save.
- `POST /ws/wim/insert-test`: insert weighing manual untuk testing.
- `POST /capture`: endpoint legacy capture berbasis request body.

## Parsing Device

- `ProtocolParser` memecah raw frame WServer menjadi field key/value.
- `VehicleMessageParser` hanya menerima message dengan `OBJECT:VEHICLE`.
- Field vehicle yang dipakai:
  - `RECID`
  - `TIME`
  - `DIR`
  - `WEIGHT`
  - `SPEED`
  - `RES`
  - `INFOTEXT`
  - `WS`
  - `AXLECOUNT`
- Data axle diparse dari blok berulang `AXLENO`, `WEIGHT`, `GWEIGHT`, `WHEEL1`, `WHEEL2`, `BASE`, `SPEED`.

## Insert Weighing

`WeighingInsertService` insert ke `public.transact_weighing`:

- `total_axle`
- `axle_detail` sebagai JSONB
- `total_weight`
- `site_id`
- `session_id`

Jika `vehicle.SiteId` kosong, service memakai default site ID hardcoded. Ini perlu dipindah ke konfigurasi.

## Retry dan Cache

- `VehicleRepository.AddVehicleAsync` selalu mencoba cache vehicle ke NATS KV terlebih dahulu.
- Jika insert database berhasil, cache key dihapus.
- Jika insert gagal, cache dibiarkan untuk retry.
- `NatsCacheRetryService` berjalan sebagai background service dan mencoba ulang semua cached vehicle sesuai interval.

## Batasan Saat Ini

- Query list vehicle, latest vehicle, by ID, by record ID, dan stats di repository saat ini dinonaktifkan dan mengembalikan data kosong/null.
- Insert hanya fokus ke `transact_weighing`, bukan tabel vehicle lama.
- Beberapa direction mapping berbeda antara parser `DIR` dan capture stream; perlu validasi dengan device asli.
- Connection string dan credential harus dipastikan berasal dari environment untuk production.

## Aturan Perubahan

- Jangan ubah protocol parsing tanpa sample raw message dan test case.
- Endpoint capture harus selalu memastikan mode device dikembalikan ke static setelah proses selesai atau timeout.
- Insert DB harus tetap idempotent atau punya strategi dedup jika device mengirim ulang data.
- Jangan log raw connection string, password WServer, atau token.
