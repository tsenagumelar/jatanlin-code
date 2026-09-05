# Phase 7 — Dashboard Aggregation

## Objective

Menyediakan angka dashboard yang dapat direkonsiliasi dengan list/report berdasarkan site, timezone, rentang waktu, dan hasil verifikasi yang sama tanpa mengubah tampilan dashboard.

## API

`GET /api/dashboard/summary` membutuhkan JWT dan menggunakan site yang dikonfigurasi pada backend. Response memuat periode tujuh hari, timezone, metric, trend per hari, distribusi, jumlah pending, dan sepuluh pelanggaran verified terbaru.

## Classification rules

- Authoritative: current status `verified` dan result salah satu dari `Normal`, `Over Dimension`, `Over Loading`, atau `Over Dimension & Over Loading`.
- Normal: hanya authoritative result `Normal`.
- Violation: authoritative result selain `Normal`.
- Pending: belum verified, draft, rejected, result kosong/invalid, serta transaksi partial yang belum selesai diverifikasi.
- Transaksi partial yang sudah dilengkapi dan diverifikasi mengikuti result verified; status raw source tetap dapat dilihat melalui provenance transaksi.

## Consistency

Seluruh query dashboard berjalan dalam satu read-only repeatable-read transaction. Periode menggunakan tanggal kalender site: mulai 00:00 enam hari sebelum hari ini sampai 00:00 hari setelah hari ini.

## Validation evidence

- Endpoint dashboard lokal menghasilkan HTTP 200, timezone `Asia/Jakarta`, dan tepat tujuh trend points.
- Data smoke dengan result historis invalid tidak lagi masuk normal maupun pelanggaran dan tercatat sebagai pending.
- Endpoint verifikasi menolak result di luar kategori resmi dengan HTTP 400.
- Backend package tests dan ESLint dashboard lulus tanpa error.
