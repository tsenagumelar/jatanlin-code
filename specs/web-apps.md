# Spesifikasi Web Apps

## Lokasi

`jatanlin-web-apps`

Folder ini berisi full code frontend lama dari `jatanlin-web`. Kode `wim-web` tidak dipakai dalam monorepo ini.

## Tujuan

Frontend operator Jatanlin dengan gaya Fluent UI untuk login, dashboard/beranda, master data, konfigurasi, monitoring transaksi kendaraan, dan proses session Jatanlin.

## Stack

- Next.js `16.1.1`
- React `19.2.3`
- Apollo Client `3.14`
- Redux Toolkit dan Redux Persist
- Fluent UI React Components
- Tailwind CSS
- GraphQL Code Generator
- `xlsx`, `jspdf`, `jspdf-autotable` untuk export

## Modul Utama

- `app/page.tsx`: redirect berdasarkan status autentikasi ke `/beranda` atau `/login`.
- `src/modules/login`: login via query `master_user`, menyimpan user ke Redux, dan menulis auth cookie.
- `src/modules/jatanlin`: list transaksi kendaraan aktual dengan filter search/status/date, pagination, refresh, export Excel/PDF, dan tombol mulai sistem.
- `src/modules/processing`: flow inisialisasi sistem lalu processing data; membuat `transact_wim_session` status `IN_PROGRESS`.
- `src/modules/master-user`, `master-vehicle-class`, `configuration`: pengelolaan master/config data lewat GraphQL.
- `src/graphql`: query `.graphql`, generated hooks, Apollo client, dan schema types.

## Integrasi GraphQL

- HTTP endpoint memakai `NEXT_PUBLIC_HASURA_URL`, fallback `http://localhost:8080/v1/graphql`.
- WebSocket subscription memakai `NEXT_PUBLIC_HASURA_WS_IP`, fallback `ws://localhost:5000/v1/graphql`.
- Header auth memakai cookie `authToken`.
- Hasura admin secret dikirim jika `NEXT_PUBLIC_HASURA_SECRET` tersedia.

## Behavior Jatanlin

- Query utama mengambil `transact_vehicle_actual` dan aggregate count.
- Filter search mencocokkan `actual_plat_no` dan `transact_anpr_capture.plate_no`.
- Filter status memakai relasi `transact_vehicle_statuses.status`.
- Filter tanggal memakai `created_date`.
- Data export memetakan plat, waktu, dimensi aktual, berat aktual, total axle, jenis pelanggaran, dan status terakhir.
- Tombol `Mulai Sistem` reset processing context dan membuka `/processing`.

## Behavior Processing

- Setelah inisialisasi selesai, frontend membuat session dengan:
  - `session_name`: timestamp `YYYYMMDDHHmmss`.
  - `status`: `IN_PROGRESS`.
  - `started_at`: waktu saat ini.
  - `site_id`: `NEXT_PUBLIC_SITE_ID` jika tersedia.
- ID session disimpan di processing context untuk flow berikutnya.

## Aturan Frontend

- Jangan gunakan Hasura admin secret di browser untuk production.
- Semua query/mutation baru harus ditulis di `src/graphql/queries` lalu generate hook melalui script `codegen`.
- Komponen page harus punya loading state dan error handling yang eksplisit.
- List operasional harus memakai pagination server-side jika data bisa besar.
- Export harus jelas apakah meng-export current page, filtered page, atau seluruh dataset.
- Status session dan process state harus single source of truth di Redux/context, bukan local state tersebar.
