# Phase 6 — Transaction List and Report

## Objective

Menjamin list, detail, dan export membaca dataset, site, rentang tanggal, serta nilai final yang sama tanpa mengubah tampilan halaman existing.

## Decisions

- `NEXT_PUBLIC_SITE_ID` selalu menjadi bagian filter list dan lookup detail.
- Tanggal input dipahami sebagai tanggal kalender pada `NEXT_PUBLIC_SITE_TIMEZONE`.
- Rentang waktu menggunakan `created_date >= start` dan `created_date < next-day start`.
- Pagination list dilakukan Hasura dengan page size 10 dan aggregate count dari filter identik.
- Export melakukan fetch seluruh hasil filter dalam batch 500 sampai aggregate count terpenuhi.
- Nilai report berasal dari `actual_*`. Raw source hanya tetap digunakan untuk bukti media dan tampilan data sumber.
- Pelanggaran dianggap authoritative hanya ketika current status `verified`; status lain ditampilkan sebagai `Pending`.

## Current status invariant

Migration `012_phase6_current_status.sql` mempertahankan seluruh status sebagai history, menonaktifkan status lama, dan menambahkan partial unique index agar satu kendaraan maksimal memiliki satu status aktif. Proses verifikasi menonaktifkan status sebelumnya sebelum menambahkan current status baru dalam transaction yang sama.

## Export fields

CSV dan PDF memuat nomor plat, waktu, lokasi, sumbu, berat, dimensi, hasil pelanggaran, status, completeness, origin data, dan daftar source yang tidak masuk.

## Validation evidence

- GraphQL code generation berhasil terhadap schema Hasura hasil migration terbaru.
- Query smoke list mengembalikan aggregate dan page yang sama serta tidak menemukan row dari site lain.
- Audit database tidak menemukan kendaraan dengan lebih dari satu current status.
- Boundary tanggal site Asia/Jakarta menghasilkan jumlah verified yang sama dengan dataset smoke.
- Migration Phase 6 berhasil dijalankan ulang tanpa perubahan tambahan.
