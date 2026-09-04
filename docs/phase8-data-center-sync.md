# Phase 8 — Data Center Sync

## Objective dan keputusan

Sync site ke data center harus dapat pulih dari gangguan per stream tanpa kehilangan data atau membuat duplikasi. Phase ini mempertahankan endpoint dan UI existing; perubahan dibatasi pada agent, kontrak mirror, dan schema data center.

Keputusan utama:

- setiap tabel dan attachment mempunyai cursor serta runtime status sendiri pada file cursor;
- failure heartbeat atau satu tabel tidak menghentikan tabel lain;
- retry dilakukan pada siklus berikutnya dengan cursor terakhir yang sudah confirmed;
- replay lookback tetap dijalankan untuk menangkap update yang datang terlambat;
- cursor attachment tidak maju selama ada object source yang belum tersedia;
- data center menggunakan upsert `(site_id, source_id)`, sehingga replay payload bersifat idempotent.

## State dan recovery

Format cursor lama pada key `tables` tetap didukung. Key `streams` menambahkan `status`, `retry_count`, `last_error`, `last_attempt_at`, dan `last_success_at` per stream. Penulisan state memakai temporary file lalu atomic rename untuk mengurangi risiko file setengah tertulis ketika process berhenti.

Late-arriving row direkonsiliasi melalui configured lookback window. Late-arriving attachment ditahan pada cursor sebelumnya dan dicoba lagi pada interval berikutnya. Dampaknya, satu object yang permanen hilang akan menahan stream attachment, tetapi tidak menahan tabel transaksi lain; kondisi tersebut terlihat melalui retry count dan last error.

## Kontrak data

Selain tabel transaksi existing, agent sekarang mengirim:

- `transact_session_source`: mode/status source, attempt, error, device, dan actor;
- field completeness, missing source, verification, origin, serta verifier pada `transact_vehicle_actual`;
- `transact_vehicle_revision`: nilai before/after, field berubah, alasan, dan actor.

Migration data center `003_phase8_sync_contract.sql` bersifat additive. Tidak ada seed baru yang diperlukan; initial seed existing tetap dijalankan setelah migration.

## Failure behavior

- API/network failure: cursor stream tidak berubah dan batch diulang.
- Partial rejection: cursor tidak berubah dan seluruh batch diulang secara idempotent.
- Object MinIO belum ada: object sukses boleh ter-upload ulang, tetapi attachment cursor ditahan hingga seluruh candidate tersedia.
- Satu table query/upsert gagal: stream ditandai failed dan agent melanjutkan stream berikutnya.

## Validation evidence

- migration `001` sampai `003` dan initial seed berhasil pada database data center lokal;
- unit test sync-agent membuktikan cursor legacy kompatibel dan attachment cursor ditahan saat object missing;
- backend data center package test lulus;
- smoke API menyimpan source status, `PARTIAL/VERIFIED/MANUAL`, dan revision;
- payload revision yang sama dikirim dua kali dan tetap menghasilkan satu row.
