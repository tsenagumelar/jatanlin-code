# Rules Pengembangan

## Struktur Monorepo

- Semua aplikasi frontend berada di `jatanlin-web-apps/`.
- Agent penimbangan WIM berbasis .NET berada di `jatanlin-wb-agent/`.
- Service backend berbasis Go berada di `jatanlin-backend-services/`.
- Spesifikasi domain, arsitektur, dan aturan teknis berada di `specs/`.
- Jangan menaruh dependency hasil install ke repository: `node_modules`, `.next`, `bin`, `obj`, dan sejenisnya harus tetap ignored.
- Jangan menaruh runtime data besar ke repository: rekaman video, database lokal, cache device, dan file hasil processing sementara harus tetap ignored.

## Konfigurasi dan Secret

- `.env` tidak boleh di-commit. Gunakan `.env.example` sebagai template konfigurasi.
- Secret produksi tidak boleh disimpan di source code. Konfigurasi seperti database password, Hasura admin secret, JWT secret, MinIO secret, NATS URL, dan credential FTP harus berasal dari environment variable atau secret manager.
- Jika ada config historis yang masih hardcoded di kode lama, jadikan target refactor sebelum production.
- `NEXT_PUBLIC_*` terekspos ke browser. Jangan menaruh secret sungguhan di variable frontend dengan prefix tersebut.

## Integrasi Data

- PostgreSQL/Hasura adalah sumber data utama untuk frontend.
- Frontend hanya melakukan query/mutation ke Hasura GraphQL, kecuali ada endpoint REST eksplisit dari backend service.
- `wim-service` bertanggung jawab mengambil data ANPR/AXLE dari FTP, upload file ke MinIO, dan insert metadata ke PostgreSQL.
- `jatanlin-wb-agent` bertanggung jawab komunikasi dengan device WServer/WIM, parsing data penimbangan, insert ke `transact_weighing`, dan retry via NATS cache jika insert gagal.
- Session aktif berada di tabel `transact_wim_session` dengan status `IN_PROGRESS`; ANPR/AXLE processing harus mengikuti window session yang aktif.

## Kualitas Kode

- Tambahkan validasi konfigurasi saat startup untuk service yang membutuhkan koneksi eksternal.
- Pertahankan idempotency untuk insert berbasis `external_id` atau identifier device.
- Handler device/FTP harus toleran terhadap file belum lengkap, koneksi putus, timeout, dan duplicate message.
- Query frontend yang menampilkan data operasional harus punya loading state, empty state, error handling, pagination, dan refresh behavior yang jelas.
- Perubahan schema database harus ditempatkan di folder migration service terkait dan didokumentasikan di specs.

## Operasional

- Setiap service harus bisa dijalankan terpisah untuk development dan deployment.
- Log tidak boleh mencetak password, token, admin secret, atau connection string penuh.
- Endpoint health check wajib tersedia untuk backend service yang dideploy sebagai API.
- Untuk service watcher/agent, mekanisme retry dan observability harus dianggap bagian dari behavior utama, bukan fitur tambahan.
