# Backend Feature: AXLE Watcher

## Source Area

- `cmd/axle-watcher/main.go`
- `internal/handler/axle_handler.go`
- `internal/handler/axle_queue.go`
- `internal/handler/session_service.go`

## Current Behavior dari Code

- Connect FTP dari env AXLE.
- Poll interval dari `AXLE_FTP_INTERVAL_SEC`.
- Proses file `.xml` saja.
- Parse XML VAC fields: plate, frame time, camera ID, external ID, length mm, total wheels, total axles, category, body type.
- Jika session aktif, watcher collect file dengan batas bawah `frame_time >= session.started_at` dan memilih data valid dengan `total_axles > 0`.
- Selama session masih aktif, watcher tetap dapat scan ulang source untuk mengambil file yang datang setelah waktu start session.
- Cari image pasangan XML.
- Upload XML dan image ke MinIO bucket AXLE.
- Enqueue payload ke NATS subject `axle.insert`.
- NATS consumer upsert ke `transact_axle_capture`.
- Untuk jalur tanpa session, insert AXLE masih memakai `ON CONFLICT (external_id) DO UPDATE`.
- Untuk jalur session-aware, consumer mencari ownership row berdasarkan `session_id`, lalu insert/update row tunggal AXLE untuk session tersebut.
- Pemilihan update AXLE session-aware saat ini memakai rule validitas axle, kelengkapan data, lalu recency.
- Dummy mode AXLE sudah tersedia; jika aktif, watcher tidak membaca FTP dan akan enqueue satu dummy AXLE idempotent per session aktif.

## Target Behavior Paralel

- AXLE watcher harus berjalan independen saat ada session `IN_PROGRESS`.
- AXLE capture tidak boleh bergantung pada ANPR atau weighing.
- AXLE queue payload harus membawa `session_id` saat active session tersedia.
- Insert/upsert `transact_axle_capture` harus mengisi `session_id` untuk correlation utama.
- Jika AXLE missing atau invalid, status source AXLE harus bisa diverifikasi/adjust tanpa menggagalkan session.
- Jika AXLE missing sampai timeout/window selesai, tetap buat placeholder `transact_axle_capture` dengan `id` dan `session_id`; `external_id`, `total_axles`, file MinIO, dan metadata device boleh `NULL`.
- AXLE watcher harus tetap berjalan walaupun ANPR atau WB belum menghasilkan data.
- Untuk satu `session_id`, hanya boleh ada satu row AXLE operasional.
- Jika file AXLE baru datang pada session yang sama, service harus update row AXLE session tersebut, bukan insert row baru.

## Mekanisme Detail

- Saat session `IN_PROGRESS` terdeteksi, watcher mulai scan FTP AXLE.
- File dengan `frame_time < session.started_at` harus diabaikan.
- Service harus memastikan ownership row AXLE untuk `session_id` tersebut ada.
- Jika belum ada data valid, row boleh berupa placeholder.
- Jika payload AXLE valid datang:
  - isi `external_id`, axle count, wheel count, panjang, kategori, body type, image/object path, dan `captured_at`
  - update row AXLE existing untuk session itu
- Jika payload berikutnya datang pada session yang sama:
  - pilih payload yang lebih otoritatif atau lebih lengkap
  - prioritas update saat ini adalah:
    - row placeholder diganti data nyata
    - payload dengan `total_axles` valid menggantikan payload yang belum valid
    - payload dengan metadata lebih lengkap menggantikan payload yang lebih kosong
    - jika tingkat kelengkapan setara, pilih `captured_at` yang lebih baru
  - update row yang sama
  - jangan membuat row kedua walaupun file XML/device ID berbeda
- Data dengan `total_axles <= 0` tidak dianggap final valid, tetapi tetap dapat memicu placeholder/partial state untuk session
- Setelah session selesai, watcher tidak boleh menulis row baru untuk session lama

## Dummy Mode

- Dummy mode AXLE boleh diaktifkan untuk development/testing melalui config/env khusus.
- Jika dummy mode aktif, AXLE watcher tetap menunggu session `IN_PROGRESS`, tetapi tidak membaca FTP AXLE asli.
- Saat session aktif terdeteksi, service membuat dummy row AXLE ke `transact_axle_capture` dengan bentuk data yang sesuai schema tabel asli.
- Dummy insert AXLE harus tetap membawa `session_id`.
- Dummy insert harus idempotent per session agar polling selama session aktif tidak membuat banyak row dummy untuk source yang sama.

## Rules

- Data dengan `total_axles <= 0` tidak boleh dipakai sebagai capture valid.
- Upsert harus mempertahankan ownership row per `session_id` dan tidak menghilangkan `session_id` yang sudah valid.
- Duplicate AXLE pada session yang sama harus berujung pada update row existing atau no-op.
- AXLE saat ini tidak memakai confidence sebagai rule update; gunakan rule kelengkapan dan recency yang terdokumentasi.
- Payload retry yang lebih kosong tidak boleh menimpa metadata AXLE yang sudah lebih lengkap.
- FTP/image readiness harus dilog jelas saat file belum lengkap.
- Jika dummy mode aktif, source FTP AXLE tidak boleh ikut diproses pada session yang sama.
