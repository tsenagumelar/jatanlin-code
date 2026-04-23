# Backend Feature: Queue & Database

## Queue Behavior

- ANPR stream: `ANPR_INSERT`, subject `anpr.insert`, consumer `anpr-insert-worker`.
- AXLE stream: `AXLE_INSERT`, subject `axle.insert`, consumer `axle-insert-worker`.
- CCTV stream: `CCTV_INSERT`, subject `cctv.insert`, consumer `cctv-insert-worker`.
- JetStream storage: file storage.
- Consumer: pull subscribe, fetch 1, manual ack, `Nak` saat gagal agar retry.
- Message ID header dipakai untuk ANPR/AXLE external ID agar duplicate publish lebih terkendali.

## Session Correlation

- Semua queue payload capture harus membawa `session_id` saat session aktif tersedia.
- Consumer harus menulis `session_id` ke table target jika kolom tersedia.
- Correlation berdasarkan `created_at`/`captured_at` hanya fallback untuk data legacy yang belum memiliki `session_id`.
- Idempotency flow baru harus mempertimbangkan session dan key source stabil agar retry tidak membuat duplicate lintas session.
- Jika source timeout atau tidak menghasilkan data, queue/consumer atau orchestrator tetap harus bisa membuat placeholder row dengan `id` dan `session_id`.
- Placeholder row tidak boleh gagal karena kolom source `NOT NULL`; semua field non-relasi wajib nullable.
- Placeholder row harus memakai nilai `NULL` untuk field kosong dan harus di-upsert/idempotent per `session_id + source`.
- Target database contract untuk flow baru adalah satu ownership row per source per `session_id`.
- Consumer harus mengimplementasikan pola `find/update by session_id` atau `upsert by session_id` sebelum fallback ke key lain seperti `external_id`.
- Key device seperti `external_id`, filename, atau record ID tetap penting untuk dedup message, tetapi bukan owner utama row pada flow baru.

## Current Code Snapshot

- ANPR queue untuk jalur session-aware saat ini sudah mencari row berdasarkan `session_id`, lalu melakukan insert/update ownership row tunggal per session.
- AXLE queue untuk jalur session-aware saat ini juga sudah mencari row berdasarkan `session_id`, lalu melakukan insert/update ownership row tunggal per session.
- Jalur tanpa session pada ANPR dan AXLE masih memakai conflict berbasis `external_id` untuk compatibility dengan flow lama/non-session.
- CCTV insert saat ini masih append row baru per request/record dan belum menerapkan ownership row per `session_id`.
- WB insert saat ini masih belum mengisi `session_id` dari request/session context.

## Strategi Upsert yang Ditargetkan

- Langkah 1: cari row source existing berdasarkan `session_id`.
- Langkah 2: jika belum ada, insert row baru untuk `session_id` tersebut.
- Langkah 3: jika sudah ada, update row itu dengan field payload yang non-null atau lebih baru.
- Langkah 4: jika queue menerima redelivery payload yang sama, hasil akhirnya harus no-op atau update row yang sama.
- Langkah 5: queue `Ack` hanya setelah kepastian bahwa row session berhasil diinsert atau diupdate.

## Constraint Database yang Direkomendasikan

- Tambahkan unique constraint atau unique index per table source untuk `session_id` bila model bisnisnya memang satu row per session.
- Jika source lama masih membutuhkan banyak row historical di luar flow session, gunakan partial unique index yang hanya aktif saat `session_id IS NOT NULL`.
- Contoh target:
  - `transact_anpr_capture(session_id)` unique saat `session_id IS NOT NULL`
  - `transact_axle_capture(session_id)` unique saat `session_id IS NOT NULL`
  - `transact_weighing(session_id)` unique saat `session_id IS NOT NULL`
  - `transact_cctv(session_id)` unique saat `session_id IS NOT NULL`
  - `transact_dimension(session_id)` unique saat `session_id IS NOT NULL`

## Migration Area

- `migrations/ddl.sql`: base schema dump/DDL.
- `migrations/20250103_add_wim_session.sql`: session table addition dan penambahan `session_id` pada transact tables.
- `migrations/20250103_drop_master_wim_session.sql`: drop legacy master session.
- `migrations/20250104_nullable_session_placeholders.sql`: melonggarkan kolom source capture agar row placeholder `id + session_id` bisa dibuat untuk data missing.

## Dampak Query Frontend

- Query/subscription frontend per source harus mengasumsikan maksimal satu row per `session_id`.
- Query tidak perlu memilih "record terbaru dari banyak row" jika kontrak database satu row per session sudah diterapkan.
- Jika database masih dalam masa transisi dan duplicate historis masih ada, query frontend harus memilih row paling lengkap atau terbaru sebagai compatibility layer sementara.

## Rules

- `Ack` hanya setelah DB insert/upsert sukses.
- Migration baru harus menjelaskan dampak ke Hasura/frontend.
- Queue payload harus backward-compatible atau diberi versi payload.
- Jika table capture belum punya index `session_id`, tambahkan migration sebelum query realtime by session dipakai production.
