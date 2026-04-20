# WB Agent General

## Lokasi

`jatanlin-wb-agent`

## Ringkasan Area

`jatanlin-wb-agent` adalah service .NET 8 untuk bridge antara aplikasi Jatanlin dan device WServer/WIM. Service ini menjaga koneksi TCP ke WServer, mengirim command mode static/WIM/login, membaca frame `#RES` dan `#MSG`, expose REST/SSE endpoint lokal, melakukan capture timbang, parsing data vehicle/axle, insert ke PostgreSQL `transact_weighing`, dan retry insert menggunakan NATS KeyValue cache.

## Domain Model

- `Vehicle`: ID, RecordId, WsCode, Timestamp, Direction, TotalWeight, Speed, AxleCount, ResultCode, InfoText, RawMessage, LocationCode, SiteId, audit fields, dan list Axles.
- Target tambahan: `Vehicle.SessionId` untuk menghubungkan weighing ke `transact_wim_session`.
- `Axle`: ID, VehicleId, AxleNumber, Weight, GrossWeight, Wheel1Weight, Wheel2Weight, Wheelbase, Speed, audit fields.
- `VehicleDirection`: Unknown, Left, Right.
- `MsgFrame`: raw message dan dictionary fields.
- `ResFrame`: raw response, result, dan dictionary fields.
- `ConnectionState`: state koneksi WServer.
- DTO: `CaptureVehicleRequest`, `VehicleCaptureResponse`, `VehicleResponse`, dan axle response.

## Session Behavior

- Target flow WB adalah session-driven, bukan ANPR-driven.
- WB capture harus bisa dimulai saat session `IN_PROGRESS` tanpa menunggu ANPR capture.
- `transact_weighing.session_id` harus diisi saat request/session context tersedia.
- Jika weighing timeout/missing, source lain tetap berjalan dan UI verifikasi menangani adjustment.

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
- Session ID tidak boleh hilang saat capture, insert, retry cache, atau response mapping.
