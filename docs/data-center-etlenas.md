# Data Center ETLENAS Delivery

Pengiriman ETLENAS dimiliki oleh backend Data Center, bukan browser atau site. Worker hanya
memilih transaksi canonical yang status terbarunya `verified` dan result-nya salah satu dari
`Over Dimension`, `Over Loading`, atau `Over Dimension & Over Loading`.

Setiap percobaan dicatat sebagai row baru di `dc_etlenas_delivery`. Kolom
`source_vehicle_actual_id` dan `source_vehicle_status_id` menyimpan ID asli dari site,
sedangkan `vehicle_actual_id` menunjuk row canonical Data Center. Request, response JSON/body,
HTTP status, status ETLENAS, error, waktu mulai, dan waktu selesai ikut disimpan untuk tracing.
Satu transaksi yang sudah `SUCCESS` tidak dikirim ulang. Percobaan gagal dapat diulang setelah
5 menit dan tetap dipertahankan sebagai histori.

Worker nonaktif secara default. Konfigurasi minimum:

```dotenv
ETLENAS_ENABLED=true
ETLENAS_USER_TOKEN=
ETLENAS_PASS_TOKEN=
ETLENAS_CLIENT_SECRET=
ETLENAS_SATWIL=Korlantas
ETLENAS_VIOLATION_CODE=TM
ETLENAS_VIOLATION_NAME="Melanggar Tata Cara Muatan"
```

Nilai kode/nama pelanggaran dan satwil di atas mengikuti implementasi ETLE pada PR #2.
Response body seperti `{"status":1112}` disimpan apa adanya untuk tracing; keberhasilan
transport mengikuti HTTP status `2xx`, sama seperti implementasi PR tersebut.

`deviceName` memakai `dc_site.site_name`, sedangkan `locationName` memakai
`dc_site.site_location` (fallback ke nama bila kosong). Deskripsi, latitude, dan longitude
memakai profil site yang diterima Data Center melalui heartbeat. Dengan begitu
setiap site mempunyai identitas ETLENAS sendiri dan konfigurasi global tidak dapat membuat
semua site memakai nama yang sama. Jalankan `make infra-migrate`, lalu restart backend dan
sync-agent setelah mengubah konfigurasi.

Contoh tracing:

```sql
SELECT site_id, vehicle_actual_id, source_vehicle_actual_id,
       source_vehicle_status_id, delivery_status, http_status,
       etlenas_status_code, started_at, synced_at, error_message,
       response_payload, response_body
FROM public.dc_etlenas_delivery
ORDER BY started_at DESC;
```
