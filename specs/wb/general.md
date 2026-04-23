# WB Agent General

## Lokasi

`jatanlin-wb-agent`

## Ringkasan Area

`jatanlin-wb-agent` adalah service .NET 8 untuk bridge antara aplikasi Jatanlin dan device WServer/WIM. Service ini menjaga koneksi TCP ke WServer, mengirim command mode static/WIM/login, membaca frame `#RES` dan `#MSG`, expose REST/SSE endpoint lokal, melakukan capture timbang, parsing data vehicle/axle, insert ke PostgreSQL `transact_weighing`, dan retry insert menggunakan NATS KeyValue cache.

## Configuration

- Konfigurasi operasional WB sekarang dipusatkan di section `WB` pada `appsettings.json`.
- Field utama yang dikonfigurasi di sana:
  - `SessionListenerEnabled`
  - `DummyEnabled`
  - `SessionIntervalSec`
  - `CaptureTimeoutSec`
  - `CaptureDirection`
  - `LocationCode`
  - `SiteCode`
  - `SiteId`
  - `SiteName`
  - `SiteLocation`
  - `SiteRegion`
- Environment variable tetap boleh override nilai di `appsettings.json` bila dibutuhkan untuk deployment.

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
- Selama session aktif, WB agent harus siap listen/capture data device secara independen sampai session selesai.
- Mekanisme target WB adalah listener database pada `transact_wim_session` aktif untuk site yang sama.
- Saat ada session aktif, WB agent memulai satu tugas capture untuk `session_id` tersebut.
- Selama tugas capture untuk session itu masih berjalan, polling berikutnya tidak boleh membuat task kedua.
- Implementasi saat ini sudah memiliki session listener otomatis untuk mode real dan dummy.
- Session listener WB membaca `transact_wim_session` langsung dari PostgreSQL dan memulai capture ketika ada row `IN_PROGRESS`.
- WB agent boleh memiliki dummy mode untuk development/testing, tetapi dummy tetap harus mengikuti session aktif dan menulis ke `transact_weighing` yang sama.
- Untuk satu `session_id`, hanya boleh ada satu row weighing operasional.
- Jika capture ulang terjadi pada session yang sama, WB agent harus update row weighing session tersebut, bukan insert row kedua.
- `Mulai Ulang` selama session masih aktif tidak boleh menghasilkan record timbang baru untuk `session_id` yang sama, kecuali mekanisme yang dipilih memang overwrite/update row existing.
- Timeout default capture WB adalah `45` detik, tetapi timeout request `60` detik valid dan didukung implementasi saat ini.
- Untuk flow listener session, timeout capture dikontrol config/env `WB_CAPTURE_TIMEOUT_SEC`; nilai `60` valid dan tetap konsisten dengan docs lokal.

## Validasi Vendor Docs

- Dokumen referensi vendor: `docs/NAV19-005 - WAPI DLL EN v 2.5.pdf`.
- Dokumen tersebut mendefinisikan mode timbang utama:
  - `STAT` untuk static mode
  - `DYNAV LEFT|RIGHT` untuk vehicle weigh-in-motion
  - `DYNAA LEFT|RIGHT` untuk axle weigh-in-motion
  - `STATW` untuk static axle-by-axle
- Flow WIM yang didokumentasikan vendor adalah:
  - connect ke WSERVER
  - login
  - kirim `#REQ CMD:SETMODE DYNAV LEFT|RIGHT`
  - baca progress `#MSG MODE:5 ... TIMEOUT:...`
  - tunggu hasil `#MSG OBJECT:VEHICLE ... RECID ...`
  - selesai saat timeout habis atau mode dikembalikan ke static
- Dokumen vendor juga menyebut WSERVER otomatis kembali ke static mode ketika WIM selesai.
- `RECID` adalah identifier record dari WSERVER/DSD dan sah dipakai sebagai key pendukung data device, tetapi bukan correlation key bisnis session aplikasi.
- TIMEOUT pada flow WIM dideskripsikan sebagai adjustable timeout pada proses timbang, bukan angka fixed tertentu dari vendor docs.
- Karena itu, kebijakan aplikasi untuk memakai timeout `45` atau `60` detik tetap konsisten dengan vendor docs selama command dan parsing message tetap mengikuti spesifikasi WSERVER.

## Code Rules WB Agent

- Jangan ubah parser WServer tanpa menyimpan sample raw frame dan test/manual validation.
- Endpoint capture wajib mengembalikan mode device ke static setelah selesai atau timeout.
- Semua command ke WServer harus punya timeout dan cancellation token.
- Jangan log password WServer, connection string penuh, token, atau payload secret.
- Insert/update `transact_weighing` harus mengikuti ownership row per `session_id`.
- `record_id` device dan timestamp hanya key dedup pendukung, bukan alasan membuat row kedua pada session yang sama.
- Payload retry atau capture ulang yang lebih kosong tidak boleh menghapus hasil timbang yang sudah lebih lengkap.
- Query endpoint yang saat ini disabled harus diimplementasikan penuh atau dihapus dari root endpoint list agar tidak misleading.
- NATS cache harus tetap optional; jika NATS tidak tersedia, service tetap boleh mencoba insert langsung.
- Default site ID hardcoded harus diganti config sebelum production.
- Direction mapping antara parser `DIR` dan stream capture harus divalidasi dengan device asli sebelum dipakai legal/operasional.
- DTO response public harus stabil karena dipakai trigger backend dan potensi UI/tools.
- Session ID tidak boleh hilang saat capture, insert, retry cache, atau response mapping.
- Jika dummy mode WB aktif, koneksi/device real tidak boleh menjadi syarat insert weighing dummy.
