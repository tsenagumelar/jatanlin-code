# Spesifikasi WB Agent

## Lokasi

`jatanlin-wb-agent`

## Ringkasan Area

`jatanlin-wb-agent` adalah service .NET 8 untuk bridge antara aplikasi Jatanlin dan device WServer/WIM. Service ini menjaga koneksi TCP ke WServer, mengirim command mode static/WIM/login, membaca frame `#RES` dan `#MSG`, expose REST/SSE endpoint lokal, melakukan capture timbang, parsing data vehicle/axle, insert ke PostgreSQL `transact_weighing`, dan retry insert menggunakan NATS KeyValue cache.

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

## Domain Model

- `Vehicle`: ID, RecordId, WsCode, Timestamp, Direction, TotalWeight, Speed, AxleCount, ResultCode, InfoText, RawMessage, LocationCode, SiteId, audit fields, dan list Axles.
- `Axle`: ID, VehicleId, AxleNumber, Weight, GrossWeight, Wheel1Weight, Wheel2Weight, Wheelbase, Speed, audit fields.
- `VehicleDirection`: Unknown, Left, Right.
- `MsgFrame`: raw message dan dictionary fields.
- `ResFrame`: raw response, result, dan dictionary fields.
- `ConnectionState`: state koneksi WServer.
- DTO: `CaptureVehicleRequest`, `VehicleCaptureResponse`, `VehicleResponse`, dan axle response.

## Endpoint dan Feature

- `GET /`: service info dan daftar endpoint.
- `POST /ws/login?user=&pass=`: login manual ke WServer.
- `POST /ws/mode/static`: set static mode.
- `POST /ws/mode/wim?direction=LEFT|RIGHT`: set WIM dynamic mode.
- `GET /ws/msgs`: ambil recent raw `#MSG` ring buffer.
- `GET /ws/stream`: Server-Sent Events untuk raw `#MSG` dan `#RES` realtime.
- `POST /ws/wim/start`: validasi direction dan start WIM mode.
- `GET /ws/wim/data`: SSE khusus WIM mode dan vehicle result.
- `POST /ws/wim/stop`: stop WIM dan kembali static.
- `POST /ws/wim/capture`: start WIM, tunggu `OBJECT:VEHICLE`, parse vehicle, insert, stop static.
- `POST /ws/wim/capture-stream`: baca progress `MODE:5`, akumulasi axle weights dari `LASTWEIGHT`, hitung total, optional save.
- `POST /ws/wim/anpr-capture`: endpoint utama untuk trigger dari backend ANPR; set static, delay, start WIM, capture stream, optional save, dummy mode.
- `POST /ws/wim/insert-test`: insert weighing manual dengan axle1, axle2, totalWeight, optional siteId, dan direction.
- `POST /capture`: legacy/body-based capture untuk capture vehicle dan simpan.
- `GET /ws/latest-vehicle`: endpoint query latest vehicle, tetapi repository saat ini mengembalikan null karena query list dinonaktifkan.
- `GET /ws/vehicles/{id}`: endpoint query by ID, saat ini dinonaktifkan.
- `GET /ws/vehicles`: endpoint list paginated, saat ini mengembalikan empty list.
- `GET /ws/vehicles/stats`: endpoint statistik, saat ini mengembalikan zero stats.
- `GET /ws/vehicles/recid/{recid}`: endpoint by record ID, saat ini dinonaktifkan.

## WServer Protocol Behavior

- `WsClient` berjalan sebagai background reconnect loop.
- Koneksi menggunakan `TcpClient` ke `WServer:Host` dan `WServer:Port`.
- Saat connected dan `AutoLogin=true`, service melakukan `LOGIN` dengan credential config.
- Incoming bytes dikumpulkan dalam buffer dan diparse oleh `ProtocolParser.ParseFrames`.
- `#RES ... #ENDRES` diparse menjadi `ResFrame`.
- `#MSG ...` diparse menjadi `MsgFrame`.
- Recent `#MSG` disimpan dalam ring buffer memory maksimal 200 message.
- Command request dibangun sebagai `#REQ KEY:VALUE ...;\r\n`.
- Raw static mode command: `CMD:SETMODE STAT`.
- Raw WIM mode command: `CMD:SETMODE DYNAV <direction>`.

## Vehicle Parsing

- Vehicle hanya dianggap valid jika field `OBJECT` bernilai `VEHICLE`.
- Field utama: `RECID`, `TIME`, `DIR`, `WEIGHT`, `SPEED`, `RES`, `INFOTEXT`, `WS`, `AXLECOUNT`.
- Timestamp device format `yyyy-MM-dd HH:mm:ss` dan dikonversi ke UTC.
- Axle diparse dari blok berulang `AXLENO:` pada raw message.
- Axle fields: `AXLENO`, `WEIGHT`, `GWEIGHT`, `WHEEL1`, `WHEEL2`, `BASE`, `SPEED`.
- Parse error tidak throw ke caller; parser mengembalikan null agar invalid message bisa diskip.

## Insert dan Retry Feature

- `VehicleRepository.AddVehicleAsync` mencoba cache vehicle ke NATS KV sebelum insert.
- `WeighingInsertService.TryInsertWeighingAsync` insert ke `public.transact_weighing`.
- Kolom insert: `total_axle`, `axle_detail` JSONB, `total_weight`, `site_id`, `session_id`.
- `axle_detail` berisi array axle number, weight, gross weight, wheel weights, wheelbase, dan speed.
- Jika `Vehicle.SiteId` kosong, kode lama memakai default site ID hardcoded; ini harus dipindah ke config.
- Jika insert berhasil, cache key dihapus.
- Jika insert gagal, cache dibiarkan untuk retry.
- `NatsCacheRetryService` loop background membaca semua cached vehicle dan mencoba insert ulang.

## Dummy/Test Feature

- `DummyDeviceSimulator` tersedia untuk simulasi raw device message.
- `/ws/wim/anpr-capture?dummy=true` menghasilkan axle dummy tanpa koneksi WServer.
- `/ws/wim/insert-test` bisa dipakai untuk uji insert database tanpa device.

## Code Rules WB Agent

- Jangan ubah parser WServer tanpa menyimpan sample raw frame dan test/manual validation.
- Endpoint capture wajib mengembalikan mode device ke static setelah selesai atau timeout.
- Semua command ke WServer harus punya timeout dan cancellation token.
- Jangan log password WServer, connection string penuh, token, atau payload secret.
- Insert `transact_weighing` harus idempotent atau punya dedup strategy sebelum production jika device bisa mengirim ulang data.
- Query endpoint yang saat ini disabled harus diimplementasikan penuh atau dihapus dari root endpoint list agar tidak misleading.
- NATS cache harus tetap optional; jika NATS tidak tersedia, service tetap boleh mencoba insert langsung.
- Default site ID hardcoded harus diganti config sebelum production.
- Direction mapping antara parser `DIR` dan stream capture harus divalidasi dengan device asli sebelum dipakai legal/operasional.
- DTO response public harus stabil karena dipakai trigger backend dan potensi UI/tools.
