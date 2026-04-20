# Web Feature: Processing Session

## Source Area

- `app/(private)/processing/page.tsx`
- `app/(private)/processing/clicker/page.tsx`
- `app/(fullscreen)/processing/clicker/fullscreen/page.tsx`
- `src/modules/processing/*`
- `src/contexts/ProcessingContext.tsx`

## Current Behavior dari Code

- Inisialisasi sistem menjalankan device check sebelum processing.
- Setelah inisialisasi selesai, frontend membuat `transact_wim_session` dengan status `IN_PROGRESS` melalui Hasura GraphQL.
- `session_name` memakai timestamp `YYYYMMDDHHmmss`.
- `site_id` diambil dari `NEXT_PUBLIC_SITE_ID` jika tersedia.
- Step UI saat ini menggambarkan sequence: Menunggu Kendaraan, Deteksi Plat Nomor, Penimbangan, Deteksi Sumbu, Ukur Dimensi, Analisis Hasil.
- Subscription realtime mendengarkan ANPR, weighing, axle, dimension, dan CCTV berdasarkan `site_id` serta `created_after` session start.
- Flow membuat dan update `transact_vehicle_actual` untuk mengaitkan ANPR, weighing, axle, dimension, CCTV, lokasi, dan hasil aktual.
- Session ditutup dengan update `transact_wim_session` ketika flow selesai.
- Processing state disinkronkan antar tab/window via `BroadcastChannel` `processing-sync`.

## Target Behavior Paralel

- Web adalah trigger utama session: create/start/complete `transact_wim_session` melalui Hasura.
- Setelah session `IN_PROGRESS`, web tidak boleh menunggu ANPR untuk mulai memonitor weighing, AXLE, dimension, dan CCTV.
- Semua source card/status harus berjalan independen: ANPR, weighing, AXLE, dimension, CCTV.
- UI harus menampilkan status per source: pending, captured, missing, timeout, invalid, manual adjusted, atau verified.
- `transact_vehicle_actual` harus bisa dibuat/diupdate dari data parsial yang tersedia pada `session_id`.
- Verifikasi operator harus bisa mengisi atau memperbaiki data yang tidak tercapture atau tidak valid.
- Jika source missing, web tetap harus bisa membaca placeholder row `id + session_id` dan menampilkan field kosong untuk adjustment.
- Subscription/query utama sebaiknya memfilter `session_id` jika field sudah tersedia; `created_after` hanya fallback legacy.
- Jika ANPR missing, UI tetap harus menampilkan weighing/AXLE/dimension/CCTV yang masuk untuk session yang sama.

## Rules

- State realtime harus melalui `ProcessingContext` atau abstraction yang setara.
- Step processing visual boleh tetap ada, tetapi tidak boleh menjadi dependency gate antar source.
- Timeout satu source hanya mengubah status source tersebut, bukan menggagalkan seluruh session.
- ODOL analysis wajib memakai `checkOdolViolation` dan `getOdolTolerances` saat data aktual tersedia.
- Session lifecycle harus konsisten dengan backend watcher yang hanya memproses session `IN_PROGRESS`.
- Perubahan GraphQL untuk session/source harus diikuti `npm run codegen`.
