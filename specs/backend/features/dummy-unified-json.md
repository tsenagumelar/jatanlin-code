# Backend Feature: Unified Dummy JSON (ANPR + AXLE + WB + DIMENSION + CCTV + ACTUAL)

## Objective

Satu file JSON dapat menyimpan data dummy lengkap per transaksi/session, meliputi:
- `anpr`
- `axle`
- `weighing` (wb)
- `dimension`
- `cctv`
- `vehicle_actual` (data gabungan/final)

Format ini dipakai saat dummy mode aktif agar seluruh source memakai paket data yang konsisten.

## Scope

- Berlaku hanya untuk mode dummy.
- Satu file boleh berisi banyak paket transaksi.
- Tiap paket transaksi merepresentasikan satu korelasi data lintas source.
- Media asset (image/video) diambil dari `bucket dummy/image` secara random sesuai tipe file.

## JSON Contract

```json
{
  "dataset_id": "dummy-unified-20260503-a",
  "version": "1.0",
  "site_code": "SITE_A",
  "items": [
    {
      "external_key": "DUMMY-TXN-0001",
      "captured_at": "2026-05-03T08:15:20Z",
      "anpr": {},
      "axle": {},
      "weighing": {},
      "dimension": {},
      "cctv": {},
      "vehicle_actual": {}
    }
  ]
}
```

## Field Minimal per Source

- Root item:
  - `external_key` (unik per `dataset_id`)
  - `captured_at`
- `anpr`:
  - `external_id`, `plate_no`
  - `confidence` (nullable)
  - `location_code`, `camera_id` (nullable)
  - `minio.bucket`, `minio.date_folder`, `minio.xml_object`
- `axle`:
  - `external_id`
  - `total_axles` (nullable untuk placeholder)
  - `length_mm`, `total_wheels`, `vehicle_category`, `vehicle_body_type` (nullable)
  - `minio.bucket`, `minio.date_folder`, `minio.xml_object`
- `weighing`:
  - `total_axle`, `total_weight` (nullable untuk placeholder)
  - `axle_detail` array (boleh kosong jika placeholder)
- `dimension`:
  - `filepath` (nullable untuk placeholder)
  - `length`, `width`, `height` (nullable)
  - `confidence` (nullable, untuk app-level)
- `cctv`:
  - `filename`, `filepath` (nullable untuk placeholder)
  - `duration_seconds` (nullable)
  - `minio.bucket` (nullable)
- `vehicle_actual`:
  - `actual_plat_no`, `actual_total_axle`, `actual_weight`
  - `actual_length`, `actual_width`, `actual_height` (nullable)

## Runtime Mapping

- Satu `item` dipakai untuk isi row source per `session_id` aktif:
  - `transact_anpr_capture`
  - `transact_axle_capture`
  - `transact_weighing`
  - `transact_dimension`
  - `transact_cctv`
  - `transact_vehicle_actual`
- Semua row source ditulis/update dengan `session_id` yang sama.
- Jika source tertentu kosong/null, service tetap boleh buat placeholder row (`id + session_id`).

## Media Selection Rule (Random by Type)

Sumber media di MinIO:
- `bucket`: `dummy`
- `prefix`: `image/`

Aturan pemilihan random:
- Untuk kebutuhan image (`anpr full image`, `anpr plate image`, `axle image`, `dimension filepath`):
  - pilih random object dari `dummy/image/**` yang bertipe image (`.jpg`, `.jpeg`, `.png`, `.webp`).
- Untuk kebutuhan CCTV:
  - pilih random object dari `dummy/image/**` yang bertipe video (`.mp4`, `.mov`, `.mkv`, `.avi`).

Aturan penting:
- Path media untuk insert harus mengikuti object path asli yang ada di bucket.
- Path media boleh tidak ditulis di JSON; service akan mengisi otomatis dari hasil random picker.
- Jika JSON mengisi path media secara eksplisit, path tersebut diprioritaskan; jika kosong/null maka fallback ke random picker.
- Jika pool image atau video kosong, source terkait dibuat placeholder sesuai kontrak nullable.

## Dedup & Random Rule

- Candidate random diambil dari gabungan `items` semua file JSON.
- Key dedup global: `(dataset_id, external_key)`.
- Item yang sudah dipakai untuk insert session sebelumnya tidak dipilih lagi saat strict uniqueness aktif.

## Notes

- Field tambahan boleh ditaruh di `metadata` per source tanpa merusak kontrak utama.
- Jika schema DB berbeda antar environment, mapper wajib treat field non-wajib sebagai optional.
