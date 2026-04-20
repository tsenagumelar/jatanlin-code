# Web Feature: Jatanlin Transactions

## Source Area

- `app/(private)/jatanlin/page.tsx`
- `app/(private)/jatanlin/[id]/page.tsx`
- `app/(private)/jatanlin/[id]/verify/page.tsx`
- `src/modules/jatanlin/*`
- `src/utils/export.ts`
- `src/utils/odol.ts`

## Behavior

- List transaksi membaca `transact_vehicle_actual` dengan `limit`, `offset`, `where`, dan aggregate count.
- Filter search mencocokkan `actual_plat_no` dan `transact_anpr_capture.plate_no`.
- Filter status memakai relasi `transact_vehicle_statuses.status`.
- Filter tanggal memakai `created_date`.
- Export Excel/PDF memetakan plat, waktu, dimensi aktual, berat aktual, total axle, jenis pelanggaran, dan status terakhir.
- Detail kendaraan menampilkan data aktif, evidence, timeline, class, info kendaraan, histori, dan violation card.
- Verifikasi kendaraan menyediakan workflow review/validasi status transaksi dan attachment/evidence.

## Rules

- List besar wajib server-side pagination.
- Detail dan verify harus memakai source perhitungan ODOL yang sama.
- Export harus jelas apakah current page atau filtered dataset.
- Soft delete/status update harus menyertakan audit field jika schema membutuhkan.
