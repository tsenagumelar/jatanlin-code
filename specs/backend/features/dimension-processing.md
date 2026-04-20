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
- Ada fallback table `vehicle_dimensions` untuk save result generic.
- Detector saat ini masih perlu validasi production sesuai catatan code/README.
- Current gap: dimension session masih ter-couple ke ANPR capture, sehingga ANPR missing dapat membuat dimension tidak terbentuk.

## Target Behavior Paralel

- Dimension processor harus bisa menyimpan hasil dengan `session_id` saat source image/dimension tersedia.
- Jika dimension tetap memakai ANPR full image, dependency itu harus eksplisit sebagai source dependency, bukan gate untuk weighing/AXLE/CCTV.
- Jika ada source image non-ANPR, dimension harus dapat diproses tanpa ANPR ID.
- Dimension missing/invalid harus masuk verifikasi sebagai status source, bukan menggagalkan session.
- Jika dimension missing, tetap buat placeholder `transact_dimension` dengan `id` dan `session_id`; `anpr_id`, `filepath`, length, width, dan height boleh `NULL`.
- Schema/GraphQL perlu mendukung query dimension by `session_id` untuk flow paralel.

## Rules

- Calibration harus dikunci per site/camera sebelum dipakai production.
- Detector mock/placeholder tidak boleh dianggap hasil legal.
- Insert dimension harus terhubung ke `session_id` pada flow session aktif.
- Link ke ANPR capture boleh nullable jika flow paralel membutuhkan dimension tanpa ANPR.
