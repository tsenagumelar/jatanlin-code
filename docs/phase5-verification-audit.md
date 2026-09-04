# Phase 5 — Verification and Correction Audit

## Objective

Memastikan data perangkat tetap menjadi bukti mentah, sedangkan koreksi operator disimpan sebagai nilai final yang dapat diaudit tanpa mengubah tampilan verifikasi existing.

## Decision

- UI mengirim aksi `save`, `verify`, atau `reject` ke `PUT /api/transactions/vehicles/:id/verification` menggunakan JWT user login.
- Backend hanya memperbarui kolom `actual_*`, lokasi, dan metadata verifikasi pada `transact_vehicle_actual`.
- Perubahan nilai actual atau penolakan wajib memiliki `reason`.
- Setiap perubahan nilai/status membuat snapshot before/after pada `transact_vehicle_revision`.
- Revision bersifat immutable melalui trigger database yang dibuat pada migration Phase 2.
- Setiap aksi menambahkan history `transact_vehicle_status` dengan `created_by` dari actor login.

## Data origin

- `REAL`: actual dibentuk tanpa source dummy yang diterima.
- `DUMMY`: setidaknya satu source dummy diterima saat actual dibentuk. Detail source tetap dibaca dari `transact_session_source`.
- `MANUAL`: operator mengubah atau melengkapi nilai actual melalui proses verifikasi.

## Transaction boundary

Lock pada row actual, update actual, insert revision, dan insert status dijalankan dalam satu serializable transaction. Jika salah satu gagal, seluruh perubahan dibatalkan.

## Validation evidence

- Perubahan manual tanpa alasan menghasilkan HTTP 400.
- Perubahan lengkap dengan alasan menghasilkan HTTP 200, `VERIFIED`, `verified_by`, `verified_at`, dan origin `MANUAL`.
- Snapshot revision menyimpan nilai sebelum/sesudah, daftar field berubah, alasan, serta actor.
- Raw ANPR, AXLE, WIM, dan dimension pada session smoke test tetap kosong setelah manual completion.
- Migration berhasil dijalankan dua kali berturut-turut.

## Remaining boundary

Phase 6 harus menggunakan `actual_*` sebagai nilai final untuk list dan report. Penyajian provenance pada UI/export tetap keputusan bisnis Phase 6 dan tidak ditambahkan pada Phase 5.
