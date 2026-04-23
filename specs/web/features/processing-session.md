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
- Subscription realtime saat ini ditujukan untuk mendengarkan ANPR, weighing, axle, dimension, dan CCTV berdasarkan `session_id`; `created_after` tetap dianggap fallback legacy.
- Flow membuat dan update `transact_vehicle_actual` untuk mengaitkan ANPR, weighing, axle, dimension, CCTV, lokasi, dan hasil aktual.
- Session ditutup dengan update `transact_wim_session` ketika flow selesai.
- Processing state disinkronkan antar tab/window via `BroadcastChannel` `processing-sync`.

## Target Behavior Paralel

- Web adalah trigger utama session: create/start/complete `transact_wim_session` melalui Hasura.
- Setelah session `IN_PROGRESS`, web tidak boleh menunggu ANPR untuk mulai memonitor weighing, AXLE, dimension, dan CCTV.
- Semua source card/status harus berjalan independen: ANPR, weighing, AXLE, dimension, CCTV.
- Model monitoring target:
  - ANPR, WB, AXLE, dan CCTV adalah source paralel berbasis session aktif.
  - Dimension adalah source turunan yang menunggu data ANPR baru pada `session_id` yang sama.
- UI harus menampilkan status per source: pending, captured, missing, timeout, invalid, manual adjusted, atau verified.
- `transact_vehicle_actual` harus bisa dibuat/diupdate dari data parsial yang tersedia pada `session_id`.
- Verifikasi operator harus bisa mengisi atau memperbaiki data yang tidak tercapture atau tidak valid.
- Jika source missing, web tetap harus bisa membaca placeholder row `id + session_id` dan menampilkan field kosong untuk adjustment.
- Subscription/query utama sebaiknya memfilter `session_id` jika field sudah tersedia; `created_after` hanya fallback legacy.
- Jika ANPR missing, UI tetap harus menampilkan weighing/AXLE/dimension/CCTV yang masuk untuk session yang sama.

## Mekanisme Start dan Mulai Ulang

- Saat operator klik `Mulai Sistem` pada proses baru:
  - web membuat session baru
  - status session menjadi `IN_PROGRESS`
  - halaman processing berpindah ke monitoring source paralel
- Saat operator klik `Mulai Ulang` dan session saat ini masih aktif/non-final:
  - web tidak membuat session baru
  - web hanya mengulang step visual dan monitoring terhadap source pada `session_id` yang sama
  - source backend tetap bekerja pada ownership row yang sama
- Saat operator klik `Mulai Ulang` setelah session sebelumnya completed:
  - web membuat session baru
  - monitoring berpindah penuh ke `session_id` baru

## Mekanisme Monitoring Final Step

- Pada step akhir, web menunggu data source menjadi lengkap sampai batas waktu finalisasi.
- Batas waktu finalisasi target saat ini adalah maksimal 1 menit sejak masuk step akhir.
- Selama waktu tunggu itu:
  - web tetap subscribe/query semua source berdasarkan `session_id`
  - web menganggap data dapat datang dalam urutan apa pun
  - web tidak boleh membuat session baru otomatis
- Jika semua source lengkap sebelum timeout:
  - web menyusun `transact_vehicle_actual`
  - web menutup session sebagai completed
- Jika timeout tercapai dan masih ada source yang kosong:
  - web tetap menyusun `transact_vehicle_actual` dari data yang ada
  - source kosong dianggap missing/partial
  - web tetap menutup session sebagai completed
  - UI pada akhir proses harus menampilkan teks `Data selesai di proses`, bukan `Menunggu Data Lengkap`
  - loading indicator akhir tidak perlu ditampilkan lagi setelah timeout finalisasi lewat

## Kontrak Query per Session

- Untuk flow baru, web harus menganggap tiap source maksimal satu row per `session_id`.
- Query/subscription per source sebaiknya membaca satu row berdasarkan `session_id`, bukan memilih dari banyak row pada session yang sama.
- Jika duplicate historis masih ada selama masa transisi, frontend boleh sementara memilih row paling lengkap atau terbaru, tetapi ini hanya compatibility layer sementara.

## Rules

- State realtime harus melalui `ProcessingContext` atau abstraction yang setara.
- Step processing visual boleh tetap ada, tetapi tidak boleh menjadi dependency gate antar source.
- Timeout satu source hanya mengubah status source tersebut, bukan menggagalkan seluruh session.
- ODOL analysis wajib memakai `checkOdolViolation` dan `getOdolTolerances` saat data aktual tersedia.
- Session lifecycle harus konsisten dengan backend watcher yang hanya memproses session `IN_PROGRESS`.
- Perubahan GraphQL untuk session/source harus diikuti `npm run codegen`.
