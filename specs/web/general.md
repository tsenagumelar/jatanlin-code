# Web Apps General

## Lokasi

`jatanlin-web-apps`

Folder ini berisi full code frontend lama dari `jatanlin-web`. Kode `wim-web` tidak dipakai dalam monorepo ini.

## Ringkasan Area

Frontend operator Jatanlin berbasis Next.js untuk autentikasi, dashboard, monitoring transaksi ODOL, proses session WIM/Jatanlin, master data, konfigurasi, LED display, preview, panduan, detail kendaraan, verifikasi, dan export laporan.

## Routes dan Halaman

- `/`: redirect berdasarkan status auth ke `/beranda` atau `/login`.
- `/login`: halaman login public.
- `/beranda`: dashboard ringkasan, statistik, chart, dan daftar transaksi terbaru.
- `/jatanlin`: list transaksi kendaraan aktual dengan filter, pagination, refresh, export, dan tombol mulai sistem.
- `/jatanlin/[id]`: detail kendaraan/transaksi.
- `/jatanlin/[id]/verify`: verifikasi transaksi dan status pelanggaran.
- `/konfigurasi`: master konfigurasi aplikasi.
- `/master-data/pengguna`: CRUD user.
- `/master-data/kelas-kendaraan`: CRUD kelas kendaraan dan batas ODOL.
- `/processing`: flow inisialisasi dan processing session.
- `/processing/clicker`: mode processing clicker.
- `/processing/clicker/fullscreen`: fullscreen clicker.
- `/led`: LED display reguler.
- `/led/fullscreen`: LED display fullscreen.
- `/preview`: preview/tampilan data operasional.
- `/panduan`: halaman panduan penggunaan.

## Feature Summary

- Autentikasi operator dan layout private/public.
- Dashboard operasional ODOL.
- List, detail, dan verifikasi transaksi Jatanlin.
- Processing realtime untuk session WIM/Jatanlin.
- Master pengguna, role, kelas kendaraan, dan konfigurasi.
- LED display dan fullscreen display untuk status processing.
- Export Excel/PDF.
- GraphQL query/mutation/subscription berbasis Hasura.

## Code Rules Web

- Semua route baru harus berada di App Router `app/` dan modul UI/business logic diletakkan di `src/modules/<area>`.
- GraphQL operation baru harus ditulis di `src/graphql/queries/*.graphql`, lalu jalankan `npm run codegen`.
- Jangan edit file generated hooks/manual schema types kecuali output codegen.
- Jangan memakai `NEXT_PUBLIC_HASURA_SECRET` untuk production browser build; gunakan JWT/Hasura role claim.
- Query list besar wajib memakai `limit`, `offset`, `where`, dan aggregate count.
- Semua list wajib punya loading, empty/error state, pagination, refresh, dan filter yang eksplisit.
- Mutasi create/update/delete wajib menulis audit field jika schema membutuhkannya.
- Soft delete lebih diprioritaskan daripada hard delete untuk master/transaction data.
- State realtime processing harus melalui `ProcessingContext`; jangan buat state paralel yang tidak disinkronkan.
- Perhitungan ODOL harus memakai util `src/utils/odol.ts` agar konsisten antara processing, detail, dan verify.
- Export harus menyebut sumber data yang diexport: current page, filtered page, atau seluruh dataset.
- Hindari `any` untuk fitur baru; beberapa kode lama masih memakai `any`, tetapi modul baru harus menambah type yang jelas.
