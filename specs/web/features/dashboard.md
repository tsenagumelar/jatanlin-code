# Web Feature: Dashboard

## Source Area

- `app/(private)/beranda/page.tsx`
- `src/modules/beranda/index.tsx`

## Behavior

- Dashboard membaca data `transact_vehicle_actual`, `master_vehicle_class`, dan `master_config`.
- Menampilkan statistik transaksi/pelanggaran, chart, dan daftar pelanggaran terbaru.
- Menghitung kategori ODOL dari data aktual kendaraan dan batas kelas kendaraan.
- Menyediakan aksi menuju detail dan verifikasi transaksi.

## Rules

- Data dashboard harus difilter berdasarkan site jika context site tersedia.
- Chart harus tahan data kosong.
- Statistik yang bergantung pada toleransi harus memakai source config yang sama dengan processing/verifikasi.
