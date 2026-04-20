# WB Feature: Weighing Insert & Retry

## Source Area

- `Services/VehicleRepository.cs`
- `Services/WeighingInsertService.cs`
- `Services/NatsCacheService.cs`
- `Services/NatsCacheRetryService.cs`

## Current Behavior dari Code

- `VehicleRepository.AddVehicleAsync` mencoba cache vehicle ke NATS KV sebelum insert.
- `WeighingInsertService.TryInsertWeighingAsync` insert ke `public.transact_weighing`.
- Kolom insert: `total_axle`, `axle_detail` JSONB, `total_weight`, `site_id`, `session_id`.
- `axle_detail` berisi array axle number, weight, gross weight, wheel weights, wheelbase, dan speed.
- Jika `Vehicle.SiteId` kosong, kode lama memakai default site ID hardcoded; ini harus dipindah ke config.
- Current gap: `session_id` di insert masih diisi `NULL` karena model/request belum membawa session.
- Jika insert berhasil, cache key dihapus.
- Jika insert gagal, cache dibiarkan untuk retry.
- `NatsCacheRetryService` loop background membaca semua cached vehicle dan mencoba insert ulang.

## Target Behavior Paralel

- Model `Vehicle` harus memiliki `SessionId` nullable untuk flow session.
- Capture endpoint harus mengisi `Vehicle.SessionId` dari request/session context.
- `WeighingInsertService` harus insert `session_id` saat tersedia.
- Retry cache harus menyimpan `session_id` bersama payload vehicle agar retry tetap terkorelasi ke session yang benar.
- Weighing insert harus valid walaupun ANPR tidak ada.
- Jika WServer tidak mengembalikan data sampai timeout, tetap buat placeholder `transact_weighing` dengan `id` dan `session_id`; `total_axle`, `axle_detail`, dan `total_weight` boleh `NULL`.

## Rules

- Insert harus punya strategi dedup sebelum production jika device bisa mengirim ulang data.
- NATS cache harus optional; service tetap mencoba insert langsung jika NATS tidak tersedia.
- Default site ID hardcoded harus diganti env/config.
- Jangan drop `session_id` saat retry atau serialisasi/deserialisasi cache.
