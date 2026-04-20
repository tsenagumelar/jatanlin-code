# Spesifikasi Web Apps

## Lokasi

`jatanlin-web-apps`

Folder ini berisi full code frontend lama dari `jatanlin-web`. Kode `wim-web` tidak dipakai dalam monorepo ini.

## Ringkasan Area

Frontend operator Jatanlin berbasis Next.js untuk autentikasi, dashboard, monitoring transaksi ODOL, proses session WIM/Jatanlin, master data, konfigurasi, LED display, preview, panduan, detail kendaraan, verifikasi, dan export laporan.

## Tech Stack

- Runtime/build: Node.js dengan Next.js App Router.
- Framework UI: React 19 dan Next.js 16.
- Bahasa: TypeScript 5.9.
- Styling: Tailwind CSS 4 dan Fluent UI React Components.
- State management: Redux Toolkit, React Redux, Redux Persist, dan React Context untuk processing session.
- Data layer: Apollo Client, GraphQL HTTP, GraphQL WebSocket subscription, dan generated hooks dari GraphQL Code Generator.
- Export dokumen: `xlsx`, `jspdf`, dan `jspdf-autotable`.
- Charting/dashboard: Recharts.
- Date/time: Moment dan native `Intl`/`Date` formatting.
- Deployment: Dockerfile dan GitHub Actions docker publish workflow.

## Package Direct Dependencies

- `@apollo/client@^3.14.0`: Apollo GraphQL client, HTTP link, error link, cache, split link, subscriptions.
- `@fluentui/react-components@^9.72.9`: komponen UI utama seperti Button, Card, Spinner, Toast, Dialog.
- `@fluentui/react-icons@^2.0.316`: icon Fluent UI.
- `@reduxjs/toolkit@^2.11.2`: Redux store dan slice.
- `dotenv@^17.2.3`: load env untuk tooling/codegen.
- `graphql@^16.12.0`: GraphQL runtime/types.
- `graphql-ws@^6.0.6`: GraphQL subscription melalui WebSocket.
- `jspdf@^3.0.4`: generate PDF.
- `jspdf-autotable@^5.0.2`: table PDF export.
- `moment@^2.30.1`: formatting timestamp untuk nama file export dan UI.
- `next@16.1.1`: framework aplikasi.
- `react@19.2.3`: React runtime.
- `react-dom@19.2.3`: DOM renderer.
- `react-redux@^9.2.0`: binding Redux ke React.
- `recharts@^3.6.0`: grafik dashboard.
- `redux-persist@^6.0.0`: persist login/session state.
- `xlsx@^0.18.5`: export Excel.

## Package Dev Dependencies

- `@graphql-codegen/cli@^6.0.1`: CLI generate GraphQL artifacts.
- `@graphql-codegen/client-preset@^5.1.1`: preset client GraphQL.
- `@graphql-codegen/introspection@^5.0.0`: introspection output.
- `@graphql-codegen/near-operation-file-preset@^3.1.0`: generated hooks dekat operation file.
- `@graphql-codegen/typescript@^5.0.2`: TypeScript schema types.
- `@graphql-codegen/typescript-operations@^5.0.2`: operation types.
- `@graphql-codegen/typescript-react-apollo@^3.3.7`: React Apollo hooks.
- `@tailwindcss/postcss@^4`: Tailwind PostCSS integration.
- `@types/node@^20`: Node types.
- `@types/react@^19`: React types.
- `@types/react-dom@^19`: React DOM types.
- `eslint@^9`: linting.
- `eslint-config-next@16.1.1`: Next.js ESLint config.
- `tailwindcss@^4`: CSS framework.
- `typescript@5.9.3`: TypeScript compiler.

## Scripts

- `npm run dev`: menjalankan Next.js development server.
- `npm run build`: build production.
- `npm run start`: start production build.
- `npm run lint`: menjalankan ESLint.
- `npm run codegen`: generate GraphQL hooks dari `src/graphql/codegen.js`.

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

## Feature Utama

- Autentikasi operator via query `Login` ke `master_user` dengan username/email, password hash, `is_active`, dan `is_deleted`.
- Redux login state menyimpan user, role, loading, error, dan status authenticated.
- Layout private memakai sidebar/navbar untuk navigasi internal.
- Dashboard `beranda` membaca `transact_vehicle_actual`, `master_vehicle_class`, dan `master_config` untuk statistik ODOL, chart, dan recent violations.
- List Jatanlin membaca `transact_vehicle_actual` dengan server-side pagination, filter search, status, dan tanggal.
- Export Excel/PDF untuk transaksi Jatanlin dan master data.
- Detail kendaraan menampilkan data aktif, evidence, timeline, class, info kendaraan, histori, dan violation card.
- Verifikasi kendaraan menyediakan workflow review/validasi status transaksi dan attachment/evidence.
- Master user mendukung list, detail, create, update, soft delete, filter, pagination, role options, dan cek username exists.
- Master vehicle class mendukung list, detail, create, update, soft delete, restore, cek code/type exists, dan menyimpan batas berat/dimensi per kelas.
- Configuration module mendukung list, detail, edit, filter, pagination, soft delete/restore, cek code/key exists, dan config by type.
- Processing session membuat `transact_wim_session` dengan status `IN_PROGRESS` saat inisialisasi selesai.
- Processing flow memiliki step: Menunggu Kendaraan, Deteksi Plat Nomor, Penimbangan, Deteksi Sumbu, Ukur Dimensi, Analisis Hasil.
- Processing realtime memakai subscription ANPR, weighing, axle, dimension, dan CCTV berdasarkan `site_id` dan `created_after` session start.
- Processing membuat dan update `transact_vehicle_actual`, mengaitkan ANPR, weighing, axle, dimension, CCTV, lokasi, dan hasil aktual.
- Processing menutup session dengan update `transact_wim_session` ketika flow selesai.
- ODOL analysis memakai `checkOdolViolation`, `getOdolTolerances`, data kelas kendaraan, dan config `TOLERANCE_WEIGHT`/`TOLERANCE_DIM`.
- Processing Context memakai `BroadcastChannel` `processing-sync` untuk sinkronisasi state antar tab/window.
- LED display membaca state processing dan menampilkan status/hasil ke layar reguler/fullscreen.
- Error boundary, loading page, dan not-found page tersedia di App Router.

## GraphQL Operation Area

- Auth: `Login`.
- Master role: `GetRoles`, `GetRoleById`, `InsertRole`, `UpdateRole`, `SoftDeleteRole`, `RestoreRole`, `CheckRoleCodeExists`, `CheckRoleNameExists`.
- Master user: `GetUsers`, `GetUserById`, `InsertUser`, `UpdateUser`, `SoftDeleteUser`, `RestoreUser`, `CheckUsernameExists`.
- Master vehicle class: `GetVehicleClasses`, `GetVehicleClassById`, `InsertVehicleClass`, `UpdateVehicleClass`, `SoftDeleteVehicleClass`, `RestoreVehicleClass`, `CheckVehicleClassCodeExists`, `CheckVehicleClassTypeExists`.
- Configuration: `GetConfigs`, `GetConfigById`, `GetConfigsByType`, `InsertConfig`, `UpdateConfig`, `SoftDeleteConfig`, `RestoreConfig`, `CheckConfigCodeExists`, `CheckConfigKeyExists`.
- ANPR capture: list, by ID, by plate, date range, insert, update, soft delete, latest subscription.
- AXLE capture: list, by ID, by plate, date range, insert, update, soft delete, latest subscription.
- Weighing: list, by ID, by site, date range, insert, update, soft delete, latest subscription.
- Dimension: list, by ID, by ANPR, by site, insert, update, soft delete, latest subscription, by ANPR subscription.
- CCTV: latest CCTV subscription.
- Vehicle actual: fragment full relation, list, by ID, by ANPR, by site, history by plate, date range, insert, update, soft delete, latest subscription, by ANPR subscription.
- Vehicle status: fragment full relation, list, by ID, by actual, by site, by status, by result, date range, statistics, insert, batch insert, update, update by actual, soft delete, delete, and multiple subscriptions.
- WIM session: insert and update session.

## Data dan Integrasi

- Hasura HTTP endpoint dari `NEXT_PUBLIC_HASURA_URL`.
- Hasura WebSocket endpoint dari `NEXT_PUBLIC_HASURA_WS_IP`.
- Hasura admin secret dibaca dari `NEXT_PUBLIC_HASURA_SECRET`; ini hanya aman untuk local/dev dan harus diganti JWT/role-based auth untuk production.
- Site context dibaca dari `NEXT_PUBLIC_SITE_ID` dan dipakai untuk filter realtime/data operasional.
- Image MinIO dibangun dari bucket/object field seperti `minio_full_image_object`, `minio_plate_image_object`, dan `minio_image_object`.
- Auth cookie `authToken` dipakai oleh Apollo auth link.

## Code Rules Web

- Semua route baru harus berada di App Router `app/` dan modul UI/business logic diletakkan di `src/modules/<area>`.
- GraphQL operation baru harus ditulis di `src/graphql/queries/*.graphql`, lalu jalankan `npm run codegen`.
- Jangan edit file generated hooks/manual schema types kecuali output codegen.
- Jangan memakai `NEXT_PUBLIC_HASURA_SECRET` untuk production browser build; gunakan JWT/Hasura role claim.
- Query list besar wajib memakai `limit`, `offset`, `where`, dan aggregate count.
- Semua list wajib punya loading, empty/error state, pagination, refresh, dan filter yang eksplisit.
- Mutasi create/update/delete wajib menulis audit field (`created_by`, `created_date`, `updated_by`, `updated_date`) jika schema membutuhkannya.
- Soft delete lebih diprioritaskan daripada hard delete untuk master/transaction data.
- State realtime processing harus melalui `ProcessingContext`; jangan buat state paralel yang tidak disinkronkan.
- Step processing tidak boleh maju hanya karena timeout jika data wajib belum jelas; jika fallback timeout dipakai, UI harus menandai step timeout.
- Perhitungan ODOL harus memakai util `src/utils/odol.ts` agar konsisten antara processing, detail, dan verify.
- Export harus menyebut sumber data yang diexport: current page, filtered page, atau seluruh dataset.
- Jangan simpan credential atau token di source; `.env` lokal harus ignored.
- Hindari `any` untuk fitur baru; beberapa kode lama masih memakai `any`, tetapi modul baru harus menambah type yang jelas.
