# Arsitektur Aplikasi Jatanlin/WIM

## Ringkasan

Sistem Jatanlin/WIM menggabungkan data pelanggaran ODOL dari beberapa sumber:

- ANPR: plat nomor, gambar kendaraan, lokasi kamera, dan waktu capture.
- AXLE/VAC: dimensi kendaraan, jumlah roda/as, kategori kendaraan, dan gambar pendukung.
- WIM/WServer: total berat, jumlah as, detail berat per as, dan data stream device.
- Frontend operator: pembuatan session, monitoring, verifikasi, export, dan dashboard.

## Komponen

```text
Operator Browser
  -> jatanlin-web-apps
  -> Hasura GraphQL
  -> PostgreSQL

wim-service
  -> ANPR FTP watcher
  -> AXLE FTP watcher
  -> MinIO object storage
  -> NATS JetStream queue
  -> PostgreSQL
  -> optional trigger ke jatanlin-wb-agent dan CCTV recorder

jatanlin-wb-agent
  -> WServer/WIM device via TCP/WebSocket protocol client
  -> REST/SSE endpoint lokal
  -> PostgreSQL transact_weighing
  -> NATS KV cache untuk retry insert
```

## Alur Session

1. Operator membuka halaman proses di frontend.
2. Frontend membuat row `transact_wim_session` dengan status `IN_PROGRESS`.
3. `wim-service` ANPR/AXLE watcher hanya memproses file yang jatuh dalam window session aktif.
4. Saat ANPR session aktif terdeteksi, `wim-service` dapat trigger `jatanlin-wb-agent` melalui endpoint capture WIM.
5. `jatanlin-wb-agent` mengambil data berat/as dari WServer lalu insert ke `transact_weighing`.
6. Frontend membaca data aktual, status, ANPR, AXLE, dan weighing melalui Hasura GraphQL.

## Data Storage

- PostgreSQL menyimpan master data, session, capture ANPR, capture AXLE, actual vehicle, status verifikasi, dan weighing.
- MinIO menyimpan XML, full image, plate image, attachment, atau file hasil capture lain.
- NATS JetStream digunakan sebagai queue insert ANPR/AXLE di `wim-service`.
- NATS KeyValue digunakan sebagai cache retry insert weighing di `jatanlin-wb-agent`.

## Boundary Tanggung Jawab

- Frontend tidak mengakses FTP, MinIO secret, atau device WServer langsung.
- `wim-service` tidak bertanggung jawab mengontrol device WServer secara langsung; trigger ke `jatanlin-wb-agent` jika perlu capture weighing.
- `jatanlin-wb-agent` tidak bertanggung jawab query list vehicle untuk dashboard; saat ini query list/stats dinonaktifkan dan fokus pada insert `transact_weighing`.
- Hasura menjadi lapisan GraphQL utama untuk query/mutation data aplikasi.

## Risiko Teknis Saat Ini

- Beberapa konfigurasi default di kode lama masih mengandung nilai endpoint/credential. Ini harus dipindah ke environment sebelum production.
- `AUTH_ENABLED` backend Go default-nya `false`, sehingga endpoint profile/upload dapat berjalan tanpa JWT jika tidak dikonfigurasi.
- Frontend memakai Hasura admin secret dari `NEXT_PUBLIC_HASURA_SECRET`; ini tidak aman untuk production karena terekspos ke browser.
- Beberapa fitur dashboard masih memakai mock atau transformasi client-side. Search production sebaiknya dilakukan server-side.
