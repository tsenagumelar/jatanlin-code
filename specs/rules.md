# Rules Pengembangan

## Struktur Monorepo

- Frontend berada di `jatanlin-web-apps/`.
- Agent penimbangan WIM berbasis .NET berada di `jatanlin-wb-agent/`.
- Backend Go berada di `jatanlin-backend-services/`.
- Spesifikasi domain, arsitektur, dependency, feature, dan rules berada di `specs/`.
- Jangan membuat folder nested repo lama seperti `jatanlin-web`, `wim-service`, atau `wim-web` di dalam folder code baru.
- Jangan menaruh dependency hasil install ke repository: `node_modules`, `.next`, `bin`, `obj`, dan sejenisnya harus tetap ignored.
- Jangan menaruh runtime data besar ke repository: rekaman video, database lokal, cache device, dan file hasil processing sementara harus tetap ignored.

## Rules Dependency

- Frontend dependency dikelola lewat `jatanlin-web-apps/package.json` dan `package-lock.json`.
- Backend dependency dikelola lewat `jatanlin-backend-services/go.mod` dan `go.sum`.
- WB agent dependency dikelola lewat `jatanlin-wb-agent/WServerApi.csproj`.
- Dependency baru harus punya fungsi jelas dan dicatat di specs area terkait.
- Jangan commit generated dependency folder.
- Setelah dependency Go berubah, jalankan `go mod tidy` dari folder backend.
- Setelah GraphQL operation frontend berubah, jalankan `npm run codegen` dari folder web.

## Rules Secret dan Config

- `.env` tidak boleh di-commit. Gunakan `.env.example` sebagai template konfigurasi.
- Secret produksi tidak boleh disimpan di source code.
- Database password, Hasura admin secret, JWT secret, MinIO secret, NATS URL credential, FTP password, ONVIF password, dan WServer password harus berasal dari environment variable atau secret manager.
- `NEXT_PUBLIC_*` terekspos ke browser. Jangan menaruh secret sungguhan di variable frontend dengan prefix tersebut.
- Config contoh boleh memakai placeholder, bukan credential nyata.
- Log tidak boleh mencetak password, token, admin secret, MinIO secret, FTP password, atau connection string penuh.

## Rules Data dan Integrasi

- PostgreSQL/Hasura adalah sumber data utama untuk frontend.
- Frontend hanya melakukan query/mutation/subscription ke Hasura GraphQL, kecuali ada endpoint REST eksplisit yang sudah disepakati.
- Backend Go bertanggung jawab mengambil data ANPR/AXLE/CCTV/dimension dari device/file/source eksternal dan menyimpannya ke PostgreSQL/MinIO.
- WB agent bertanggung jawab komunikasi dengan WServer/WIM device dan insert weighing ke `transact_weighing`.
- Session aktif berada di `transact_wim_session` dengan status `IN_PROGRESS`; semua capture harus mengikuti session context.
- `session_id` wajib menjadi correlation key utama untuk ANPR, weighing, AXLE, dimension, CCTV, dan vehicle actual saat session aktif.
- Tidak boleh ada source capture yang menjadi blocker source lain; ANPR gagal tidak boleh menghentikan weighing, AXLE, dimension, atau CCTV.
- Data parsial adalah kondisi valid dan harus bisa masuk ke proses verifikasi/adjustment.
- Jika source tidak mendeteksi data, tetap insert placeholder row dengan minimal `id` dan `session_id`; field lainnya harus nullable dan boleh diisi saat verifikasi.
- Field kosong pada placeholder harus `NULL`, bukan empty string; ini penting untuk field unik seperti `external_id`.
- Insert data dari FTP/device harus idempotent dan tahan duplicate.
- Insert placeholder harus idempotent per `session_id + source`.
- Correlation berbasis waktu hanya boleh menjadi fallback atau compatibility layer, bukan primary key flow baru.

## Rules Code Umum

- Pertahankan boundary area: web tidak mengakses FTP/MinIO secret/device langsung; backend tidak menyimpan UI state; agent tidak mengurus dashboard.
- Tambahkan validasi konfigurasi saat startup untuk service yang membutuhkan koneksi eksternal.
- Handler device/FTP harus toleran terhadap file belum lengkap, koneksi putus, timeout, duplicate message, dan capture missing.
- Query frontend yang menampilkan data operasional harus punya loading state, empty state, error handling, pagination, dan refresh behavior.
- Perubahan schema database harus disertai migration dan update specs.
- Kolom source capture tidak boleh dibuat `NOT NULL` kecuali benar-benar wajib untuk identitas row; untuk flow session, `session_id` adalah identitas relasi utama.
- Fitur realtime harus menjelaskan source event, filter `site_id`, dan window waktu/session.
- Semua external call harus punya timeout/cancellation.
- Implementasi flow baru harus mengacu ke `specs/session-processing.md` sebelum mengubah code processing.

## Rules Testing dan Verifikasi

- Frontend: minimal jalankan `npm run lint` dan `npm run build` setelah perubahan UI/data besar.
- Backend Go: jalankan `go test ./...` setelah perubahan handler/config/parser.
- WB agent: jalankan `dotnet build WServerApi.csproj` setelah perubahan .NET.
- Parser protocol/device harus punya sample payload untuk validasi manual atau test.
- Jika test/build tidak bisa dijalankan karena dependency/env, tulis alasan di final report.

## Rules Dokumentasi

- Setiap feature baru harus ditambahkan ke specs area terkait.
- Setiap package baru harus ditambahkan ke daftar package specs area terkait.
- Setiap env baru harus ditambahkan ke config section specs area terkait dan `.env.example` jika relevan.
- Jika behavior lama diketahui riskan, tulis sebagai Known Issue atau Target Refactor, bukan disembunyikan.
