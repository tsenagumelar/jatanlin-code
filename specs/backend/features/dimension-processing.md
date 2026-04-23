# Backend Feature: Dimension Processing

## Source Area

- `internal/handler/dimension_handler.go`
- `internal/vision/*`
- `cmd/dimension-sample/main.go`

## Current Behavior dari Code

- `DimensionHandler` menggunakan `vision.DimensionService`.
- Camera calibration dari env: focal length, image size, camera height, tilt angle, reference pixel/real length, reference distance.
- Dapat process image standalone atau ANPR image.
- Hasil dimension berisi length, width, height, distance, confidence, center point, class info.
- Untuk ANPR image, handler mencari `transact_anpr_capture` dari `external_id` dan insert ke `transact_dimension`.
- Jalur session-aware sekarang juga dapat menulis `session_id` ke `transact_dimension`.
- Ada fallback table `vehicle_dimensions` untuk save result generic.
- Detector saat ini masih perlu validasi production sesuai catatan code/README.
- Current gap: dimension session masih ter-couple ke ANPR capture, sehingga ANPR missing dapat membuat dimension tidak terbentuk.

## Target Behavior Paralel

- Dimension processor harus bisa menyimpan hasil dengan `session_id` saat source image/dimension tersedia.
- Pada target saat ini, dimension memang memakai ANPR full image sebagai source utama.
- Dependency itu harus eksplisit sebagai source dependency, bukan gate untuk weighing/AXLE/CCTV.
- Trigger target dimension adalah listen data ANPR baru yang memiliki `session_id` sama, lalu proses full image ANPR tersebut.
- Jika nanti ada source image non-ANPR, dimension dapat diperluas, tetapi itu bukan requirement utama saat ini.
- Dimension missing/invalid harus masuk verifikasi sebagai status source, bukan menggagalkan session.
- Jika dimension missing, tetap buat placeholder `transact_dimension` dengan `id` dan `session_id`; `anpr_id`, `filepath`, length, width, dan height boleh `NULL`.
- Schema/GraphQL perlu mendukung query dimension by `session_id` untuk flow paralel.

## Dummy Mode

- Dummy mode dimension boleh diaktifkan untuk development/testing melalui config/env khusus.
- Jika dummy mode aktif, dimension tetap harus menunggu session aktif dan event/data ANPR pada session yang sama, kecuali ada desain khusus untuk dimension-only dummy.
- Target default dummy dimension adalah membuat hasil dimensi dummy yang tetap terkait ke `session_id` dan, bila tersedia, ke ANPR dummy/real pada session yang sama.
- Dummy dimension harus ditulis ke `transact_dimension` dengan schema yang sama seperti mode real.
- Jika image source tidak dipakai di dummy mode, field seperti `filepath` atau `anpr_id` boleh `NULL` sesuai kontrak nullable table.
- Dummy insert dimension harus idempotent per session/source atau per ANPR source yang dipakai.
- Config/env utama:
  - `DIMENSION_ENABLED=true|false`
  - `DIMENSION_DUMMY_ENABLED=true|false`

## Rules

- Calibration harus dikunci per site/camera sebelum dipakai production.
- Detector mock/placeholder tidak boleh dianggap hasil legal.
- Insert dimension harus terhubung ke `session_id` pada flow session aktif.
- Link ke ANPR capture boleh nullable jika nanti ada source dimension non-ANPR, tetapi target saat ini tetap menghubungkan dimension ke data ANPR session yang sama.
- Dummy mode dimension tidak boleh mengubah dimension menjadi gate untuk source lain.
- Jika `DIMENSION_DUMMY_ENABLED=true`, dimension harus membuat/update satu row dummy per `session_id` tanpa membutuhkan image ANPR nyata.
- Jika `DIMENSION_DUMMY_ENABLED=false`, dimension tetap harus menghitung dari gambar ANPR yang tersedia.
