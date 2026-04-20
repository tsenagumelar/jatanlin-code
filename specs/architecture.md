# Arsitektur Aplikasi Jatanlin/WIM

## Ringkasan

Sistem Jatanlin/WIM menggabungkan data pelanggaran ODOL dari beberapa sumber:

- ANPR: plat nomor, gambar kendaraan, lokasi kamera, dan waktu capture.
- AXLE/VAC: dimensi kendaraan, jumlah roda/as, kategori kendaraan, dan gambar pendukung.
- WIM/WServer: total berat, jumlah as, detail berat per as, dan data stream device.
- CCTV: rekaman/video pendukung proses kendaraan.
- Frontend operator: pembuatan session, monitoring, verifikasi, adjustment, export, dan dashboard.

## Komponen

```text
Operator Browser
  -> jatanlin-web-apps
  -> Hasura GraphQL
  -> PostgreSQL

jatanlin-backend-services
  -> ANPR FTP watcher
  -> AXLE FTP watcher
  -> dimension processor
  -> CCTV streamer/recorder
  -> MinIO object storage
  -> NATS JetStream queue
  -> PostgreSQL

jatanlin-wb-agent
  -> WServer/WIM device via TCP/WebSocket protocol client
  -> REST/SSE endpoint lokal
  -> PostgreSQL transact_weighing
  -> NATS KV cache untuk retry insert
```

## Source of Truth Session

- Web membuat/mengubah `transact_wim_session` melalui Hasura GraphQL.
- PostgreSQL table `transact_wim_session` adalah source of truth session.
- Backend Go saat ini membaca active session dari DB lewat `SessionService.GetActiveSession()`, bukan subscribe langsung ke Hasura.
- Service boleh memakai polling DB, trigger HTTP, atau event DB untuk mendeteksi session, tetapi hasil akhirnya harus konsisten dengan row session di PostgreSQL.

## Target Alur Session Paralel

1. Operator membuka halaman proses di frontend.
2. Frontend membuat atau mengaktifkan row `transact_wim_session` dengan status `IN_PROGRESS`.
3. Status `IN_PROGRESS` menjadi sinyal bahwa semua source boleh mulai capture secara independen.
4. ANPR watcher memproses ANPR jika data/file tersedia dan menyimpan `session_id`.
5. `jatanlin-wb-agent` melakukan capture weighing secara independen dan menyimpan `session_id` ke `transact_weighing`.
6. AXLE watcher memproses data AXLE dalam session window dan menyimpan `session_id`.
7. Dimension processor menghitung dimensi dari source yang tersedia dan menyimpan link ke session/data source.
8. CCTV recorder menangkap rekaman session dan menyimpan `session_id`.
9. Frontend membaca semua source melalui Hasura subscription/query dan menyusun verifikasi dari data yang tersedia.
10. Operator dapat melakukan adjustment jika sebagian data missing, timeout, invalid, atau tidak cocok.

## Legacy Behavior yang Harus Dihindari

- Flow lama menempatkan ANPR sebagai awal sequence dan dapat trigger WB/CCTV setelah ANPR valid.
- Behavior tersebut riskan karena ANPR gagal akan membuat source lain tidak tercapture.
- Implementasi baru tidak boleh menjadikan ANPR sebagai gate wajib untuk weighing, AXLE, dimension, atau CCTV.

## Data Storage

- PostgreSQL menyimpan master data, session, capture ANPR, capture AXLE, dimension, CCTV, actual vehicle, status verifikasi, dan weighing.
- MinIO menyimpan XML, full image, plate image, attachment, video recording, atau file hasil capture lain.
- NATS JetStream digunakan sebagai queue insert ANPR/AXLE/CCTV di backend.
- NATS KeyValue digunakan sebagai cache retry insert weighing di `jatanlin-wb-agent`.

## Boundary Tanggung Jawab

- Frontend tidak mengakses FTP, MinIO secret, RTSP credential, atau device WServer langsung.
- Hasura menjadi lapisan GraphQL utama untuk query/mutation/subscription data aplikasi.
- Backend Go bertanggung jawab mengambil data ANPR/AXLE/CCTV/dimension dari source eksternal dan menyimpannya ke PostgreSQL/MinIO.
- `jatanlin-wb-agent` bertanggung jawab komunikasi WServer/WIM dan insert weighing.
- `transact_wim_session.id` adalah correlation key utama lintas source; window waktu hanya fallback/legacy aid.

## Risiko Teknis Saat Ini

- Beberapa konfigurasi default di kode lama masih mengandung nilai endpoint/credential. Ini harus dipindah ke environment sebelum production.
- `AUTH_ENABLED` backend Go default-nya `false`, sehingga endpoint profile/upload dapat berjalan tanpa JWT jika tidak dikonfigurasi.
- Frontend memakai Hasura admin secret dari `NEXT_PUBLIC_HASURA_SECRET`; ini tidak aman untuk production karena terekspos ke browser.
- Beberapa fitur dashboard masih memakai mock atau transformasi client-side. Search production sebaiknya dilakukan server-side.
- Session ID belum konsisten dipakai oleh WB/AXLE/Dimension pada implementasi saat ini, walaupun schema migration sudah menyiapkan kolom session di beberapa table.
