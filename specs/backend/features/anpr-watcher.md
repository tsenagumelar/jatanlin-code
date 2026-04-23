# Backend Feature: ANPR Watcher

## Source Area

- `cmd/anpr-watcher/main.go`
- `internal/handler/anpr_handler.go`
- `internal/handler/anpr_queue.go`
- `internal/handler/session_service.go`

## Current Behavior dari Code

- Connect FTP dari env ANPR.
- Poll interval dari `ANPR_FTP_INTERVAL_SEC`.
- Proses file `.xml` saja, image dicari berdasarkan pasangan XML.
- Parse XML fields: plate, frame time, location, camera ID, confidence, external ID.
- Jika `SessionService` aktif, watcher memproses file pada session `IN_PROGRESS` dengan batas bawah `frame_time >= session.started_at`.
- Selama session masih aktif, watcher tetap dapat scan ulang source untuk mengambil file yang datang setelah waktu start session.
- Upload XML, full image, dan plate image ke MinIO bucket ANPR.
- Enqueue payload ke NATS subject `anpr.insert`.
- NATS consumer insert ke `transact_anpr_capture`.
- Untuk jalur tanpa session, insert ANPR masih idempotent dengan `ON CONFLICT (external_id) DO NOTHING`.
- Untuk jalur session-aware, consumer mencari ownership row berdasarkan `session_id`, lalu insert/update row tunggal ANPR untuk session tersebut.
- Pemilihan update ANPR session-aware saat ini memakai rule confidence tertinggi, lalu kelengkapan data, lalu recency.
- Saat session aktif, ANPR payload/insert membawa `session_id`.
- Dummy mode ANPR sudah tersedia; jika aktif, watcher tidak membaca FTP dan akan enqueue satu dummy ANPR idempotent per session aktif.
- Legacy behavior: ANPR watcher dapat trigger weighing ke `WEIGHING_TRIGGER_URL`, trigger CCTV recorder ke `CCTV_TRIGGER_URL`, dan optional dimension detection.

## Target Behavior Paralel

- ANPR watcher hanya bertanggung jawab pada capture ANPR dan penyimpanan data ANPR.
- ANPR sukses/gagal tidak boleh menjadi syarat mulai weighing, AXLE, atau CCTV.
- Trigger WB/CCTV dari ANPR handler harus dianggap legacy dan dipindahkan ke orchestration berbasis session.
- Jika ANPR missing sampai window/timeout selesai, session tetap valid dan source lain tetap diproses.
- Jika ANPR missing, tetap buat placeholder `transact_anpr_capture` dengan `id` dan `session_id`; `plate_no`, `external_id`, file MinIO, confidence, dan camera data boleh `NULL`.
- ANPR record harus selalu memakai `session_id` saat active session tersedia.
- Untuk satu `session_id`, hanya boleh ada satu row ANPR operasional.
- Jika ANPR file baru datang pada session yang sama, service harus update row ANPR session tersebut, bukan insert row baru.
- Dimension boleh memakai data/image ANPR ini, tetapi dependency tersebut tidak boleh mengubah ANPR menjadi gate source lain.

## Mekanisme Detail

- Saat session `IN_PROGRESS` terdeteksi, watcher mulai scan FTP ANPR.
- File dengan `frame_time < session.started_at` harus diabaikan.
- Begitu session aktif ditemukan, service harus memastikan ownership row ANPR untuk `session_id` itu ada.
- Jika belum ada payload valid, ownership row boleh dibuat sebagai placeholder.
- Jika payload valid datang:
  - simpan data XML/image yang tersedia
  - isi `plate_no`, `external_id`, confidence, camera, object path, dan `captured_at`
  - update row ANPR existing untuk session tersebut
- Jika payload berikutnya datang pada session yang sama:
  - bandingkan `confidence`, kelengkapan field, dan timestamp
  - jika `confidence` payload baru lebih tinggi dari row existing, update row yang sama
  - jika `confidence` sama, update hanya bila payload baru lebih lengkap atau lebih baru
  - jika `confidence` lebih rendah, jangan timpa row existing kecuali row existing masih placeholder atau field penting masih kosong
  - jangan membuat row kedua walaupun `external_id` berbeda
- Jika session selesai, watcher berhenti mengaitkan payload baru ke session tersebut
- Jika file FTP lama ter-scan ulang atau payload ter-publish ulang, dedup session harus tetap menahan duplicate row

## Dummy Mode

- Dummy mode ANPR boleh diaktifkan untuk development/testing melalui config/env khusus.
- Jika dummy mode aktif, ANPR watcher tetap menunggu session `IN_PROGRESS`, tetapi tidak membaca FTP.
- Saat session aktif terdeteksi, service membuat dummy row ANPR yang menulis ke `transact_anpr_capture` melalui jalur queue/insert yang sama.
- Dummy row harus mengikuti schema asli table ANPR dan field yang tidak tersedia harus tetap `NULL`.
- Dummy insert harus idempotent per session, misalnya memakai `external_id` stabil berbasis `session_id`.

## Rules

- Jangan proses file di luar session aktif kecuali fallback eksplisit.
- External trigger legacy harus non-blocking dan punya timeout sampai refactor selesai.
- `external_id` tidak cukup untuk flow baru; dedup wajib mempertimbangkan ownership row berbasis `session_id`.
- Duplicate file ANPR dengan session yang sama harus berujung pada update row existing atau no-op, bukan insert tambahan.
- Rule pemilihan data terbaik ANPR adalah confidence tertinggi terlebih dulu, lalu kelengkapan data, lalu recency.
- Jika payload retry tidak membawa field selengkap row existing, field existing tidak boleh dikosongkan.
- Confidence rendah atau plate gagal dibaca harus masuk sebagai data invalid/missing untuk verifikasi, bukan menggagalkan session.
- Jika dummy mode aktif, source FTP ANPR tidak boleh ikut diproses pada session yang sama.
