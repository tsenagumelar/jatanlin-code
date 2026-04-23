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
4. ANPR watcher mulai listen FTP ANPR sejak session aktif sampai session selesai, lalu menyimpan `session_id`.
5. `jatanlin-wb-agent` melakukan capture weighing secara independen selama session aktif dan menyimpan `session_id` ke `transact_weighing`.
6. AXLE watcher mulai listen FTP AXLE secara independen selama session aktif dan menyimpan `session_id`.
7. CCTV recorder menangkap rekaman session secara independen dan menyimpan `session_id`.
8. Dimension processor menunggu data ANPR baru pada session yang sama, lalu menghitung dimensi dari image ANPR dan menyimpan link ke session/data source.
9. Frontend membaca semua source melalui Hasura subscription/query dan menyusun verifikasi dari data yang tersedia.
10. Operator dapat melakukan adjustment jika sebagian data missing, timeout, invalid, atau tidak cocok.

## Mekanisme Data per Session

Target arsitektur data untuk flow baru adalah:

- Satu session mewakili satu proses kendaraan.
- Untuk setiap session, tiap area source hanya memiliki satu row operasional:
  - satu row ANPR
  - satu row WB
  - satu row AXLE
  - satu row CCTV
  - satu row DIMENSION
- Row tersebut boleh lahir sebagai placeholder lebih dulu, lalu diperkaya melalui update saat data sensor masuk.
- Retry, polling, replay FTP, klik `Mulai Ulang`, dan duplicate message device tidak boleh membuat row tambahan untuk source yang sama pada session yang sama.
- Arsitektur ini sengaja memindahkan model dari `append many records lalu pilih salah satu` menjadi `own one record per source lalu update record itu`.

## Legacy Behavior yang Harus Dihindari

- Flow lama menempatkan ANPR sebagai awal sequence dan dapat trigger WB/CCTV setelah ANPR valid.
- Behavior tersebut riskan karena ANPR gagal akan membuat source lain tidak tercapture.
- Implementasi baru tidak boleh menjadikan ANPR sebagai gate wajib untuk weighing, AXLE, atau CCTV.
- Dependency yang masih sah hanya dimension terhadap image/data ANPR dalam session yang sama.

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
- Database saat ini masih berisiko duplicate row per `session_id` pada beberapa source karena constraint dan strategi upsert berbasis session belum konsisten.
