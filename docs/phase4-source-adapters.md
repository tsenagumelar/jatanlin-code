# Phase 4 — Source adapters dan mixed demo mode

## Keputusan

Mode setiap device dibaca dari snapshot `transact_session_source`, bukan dari flag dummy global pada session. Semua lookup menyertakan `site_id` dan `session_id`; service tidak boleh mengambil session milik site lain.

## Perilaku source

| Source | `REAL` | `DUMMY` | `DISABLED` |
|---|---|---|---|
| ANPR | ingest FTP | generator dummy | tidak ingest |
| AXLE | ingest FTP | generator dummy | tidak ingest |
| WIM | capture weighbridge | generator dummy | tidak capture |
| CCTV | record RTSP | referensi dummy | tidak record |
| DIMENSION | inference image | dimensi dummy | tidak proses |

Data yang berhasil masuk mengubah status menjadi `RECEIVED` dan menyimpan `source_record_id`, `received_at`, serta jumlah attempt. Kegagalan WIM dan retry queue yang habis dicatat sebagai `FAILED` beserta kode/pesan error. Source lain tetap berjalan independen sehingga finalisasi dapat menghasilkan actual `PARTIAL` atau `EMPTY`.

ANPR, AXLE, dan CCTV memakai maksimal lima delivery dengan delayed backoff. Setelah batas tercapai pesan dihentikan dari redelivery dan status source ditandai gagal. Endpoint health/readiness queue masih menjadi pekerjaan operasional lanjutan.

## Risiko dan prasyarat

- Migration Phase 2 wajib sudah diterapkan sebelum service revamp dijalankan karena adapter bergantung pada `transact_session_source`.
- Konfigurasi site yang salah sekarang menyebabkan service tidak menemukan session; ini disengaja untuk mencegah cross-site contamination.
- Mixed mode yang secara alami tidak mempunyai input pendukung, misalnya ANPR dummy dengan dimension real tanpa image, dapat membuat dimension gagal sementara source lain tetap selesai.
- Perubahan ini belum dikompilasi atau diuji sesuai instruksi owner; validasi dilakukan sekaligus pada tahap validasi berikutnya.
