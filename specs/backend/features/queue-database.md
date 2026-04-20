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

## Migration Area

- `migrations/ddl.sql`: base schema dump/DDL.
- `migrations/20250103_add_wim_session.sql`: session table addition dan penambahan `session_id` pada transact tables.
- `migrations/20250103_drop_master_wim_session.sql`: drop legacy master session.
- `migrations/20250104_nullable_session_placeholders.sql`: melonggarkan kolom source capture agar row placeholder `id + session_id` bisa dibuat untuk data missing.

## Rules

- `Ack` hanya setelah DB insert/upsert sukses.
- Migration baru harus menjelaskan dampak ke Hasura/frontend.
- Queue payload harus backward-compatible atau diberi versi payload.
- Jika table capture belum punya index `session_id`, tambahkan migration sebelum query realtime by session dipakai production.
