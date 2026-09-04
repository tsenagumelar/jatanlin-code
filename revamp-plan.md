# Jatanlin Revamp Plan

## 1. Objective

Merapikan logic, proses, struktur kode, dan model data Jatanlin tanpa mengubah tampilan yang sudah ada dan tanpa mengganggu sistem current yang sedang berjalan.

Target utama revamp:

- proses tetap menghasilkan transaksi ketika satu atau beberapa device gagal mengirim data;
- operator dapat melengkapi data yang kosong saat verifikasi;
- mode demo dapat dipilih per sumber data, bukan satu mode untuk seluruh proses;
- kegagalan satu service tidak menghentikan service lain;
- tidak ada transaksi ganda, relasi lintas site, atau session aktif yang tertinggal tanpa status jelas;
- perubahan manual dan sumber asli data dapat diaudit;
- sinkronisasi ke data center dapat di-retry dan direkonsiliasi.

## 2. Keputusan Utama

1. Source revamp tetap berada di root repository ini. Tidak dibuat folder `revamp/` tambahan.
2. Development dilakukan di branch `feat/revamp` dan tidak menggunakan database, volume, bucket, FTP directory, atau cursor milik sistem current.
3. Tampilan existing dipertahankan. Perubahan frontend dibatasi pada data access, state management, error handling, dan orchestration.
4. Tabel per sumber (`ANPR`, `AXLE`, `WIM`, `dimension`, dan `CCTV`) tetap dipertahankan.
5. `transact_wim_session` menjadi pusat satu proses kendaraan.
6. Satu session menghasilkan maksimal satu `transact_vehicle_actual`.
7. Data sumber dan relasinya boleh kosong karena device failure adalah kondisi bisnis yang valid.
8. Session tetap difinalisasi setelah seluruh sumber selesai atau timeout, lalu transaksi masuk ke status menunggu verifikasi.
9. Data mentah device tidak ditimpa oleh koreksi operator. Nilai final/koreksi disimpan pada transaksi dan dicatat dalam revision history.
10. Lifecycle dan finalisasi transaksi menjadi tanggung jawab backend, bukan browser.

## 3. Fakta, Asumsi, dan Pertanyaan Terbuka

### Fakta yang disepakati

- Sistem current sudah berjalan dan tidak boleh terganggu.
- ANPR dan AXLE real diterima melalui upload FTP.
- CCTV dan WIM dapat menggunakan dummy data untuk kebutuhan demo.
- Dalam satu proses, sebagian device dapat gagal dan tidak menghasilkan data.
- Transaksi tetap harus terbentuk ketika data parsial.
- Operator dapat melengkapi data saat verifikasi.
- UI tidak diubah, kecuali data center web bila nanti memang diperlukan.

### Asumsi kerja

- Satu session merepresentasikan satu kendaraan.
- Setiap source menghasilkan maksimal satu hasil utama per session.
- Nilai pada tabel source merupakan raw/device evidence.
- Nilai `actual_*` pada `transact_vehicle_actual` merupakan nilai final yang digunakan untuk verifikasi dan report.

### Pertanyaan yang harus diputuskan sebelum implementasi terkait

- Apakah satu session dapat menerima lebih dari satu capture ANPR/AXLE/CCTV yang perlu disimpan sebagai history?
- Apakah koreksi manual wajib selalu memiliki alasan?
- Apakah transaksi dengan seluruh source kosong boleh diverifikasi atau harus dibatalkan?
- Berapa timeout masing-masing source dan apakah nilainya dapat dikonfigurasi per site?
- Apakah nilai dummy ikut disinkronkan ke data center, dan bagaimana penandaannya pada report?

## 4. Scope dan Non-goals

### Scope

1. Master data dan login.
2. Session, transaksi, ingest device, demo mode, dan penindakan.
3. List transaksi, verifikasi, dan report.
4. Dashboard.
5. Sync site ke data center.
6. Data center backend dan web.
7. Migration database, recovery, observability, dan test terkait.

### Non-goals

- Mengubah desain visual aplikasi site.
- Menulis ulang seluruh aplikasi sekaligus.
- Mengoperasikan current dan revamp sebagai dua writer pada device/FTP/database yang sama.
- Menghapus data mentah hanya karena data tersebut belum mempunyai session.
- Memaksa seluruh relasi source menjadi `NOT NULL`.

## 5. Target Process

```text
Operator login
    -> start session dan memilih REAL/DUMMY per source
    -> backend membuat session serta status awal seluruh source
    -> ANPR/AXLE/WIM/Dimension/CCTV bekerja independen
    -> masing-masing source menjadi RECEIVED, TIMEOUT, FAILED, atau SKIPPED
    -> backend melakukan finalisasi idempotent
    -> vehicle_actual dibuat walaupun datanya parsial
    -> session menjadi COMPLETED
    -> transaksi menjadi PENDING_VERIFICATION
    -> operator melengkapi atau mengoreksi data
    -> perubahan dicatat dalam revision history
    -> transaksi menjadi VERIFIED atau REJECTED
    -> data disinkronkan ke data center
```

Arti status session `COMPLETED` adalah proses pengambilan data telah selesai, bukan seluruh data pasti lengkap.

## 6. Target Data Model

### Relasi inti

```text
master_site
  +-- master_device
  +-- transact_wim_session
        +-- transact_session_source
        +-- transact_anpr_capture
        +-- transact_axle_capture
        +-- transact_weighing
        +-- transact_dimension
        +-- transact_cctv
        +-- transact_vehicle_actual
              +-- transact_vehicle_status
              +-- transact_vehicle_revision
```

### `transact_session_source`

Mencatat expectation dan kondisi setiap sumber dalam satu session.

Field minimum:

- `site_id`
- `session_id`
- `source_type`: `ANPR`, `AXLE`, `WIM`, `DIMENSION`, `CCTV`
- `source_mode`: `REAL`, `DUMMY`
- `status`: `WAITING`, `RECEIVED`, `TIMEOUT`, `FAILED`, `SKIPPED`, `MANUAL`
- `source_record_id`, nullable
- `received_at`, `timeout_at`
- `error_code`, `error_message`
- `attempt_count`
- audit timestamps
- unique `(site_id, session_id, source_type)`

### `transact_vehicle_actual`

- Source FK dan nilai `actual_*` tetap nullable.
- Tambahkan `verification_status`: `PENDING`, `IN_REVIEW`, `VERIFIED`, `REJECTED`.
- Tambahkan `data_completeness_status`: `COMPLETE`, `PARTIAL`, `EMPTY`.
- Tambahkan `has_manual_override`, `verified_by`, dan `verified_at`.
- Tambahkan unique `(site_id, session_id)` untuk mencegah transaksi ganda.

### Audit actor

- Aksi operator menggunakan `created_by`/`updated_by` yang merujuk ke `master_user`.
- Session mengisi `started_by` saat mulai dan `ended_by` saat selesai.
- Raw data device boleh mempunyai `created_by = NULL`, tetapi harus mempunyai `created_source` dan, jika tersedia, `device_id`.
- Hindari UUID nol sebagai actor.
- Tambahkan FK nullable audit columns ke `master_user` setelah data lama dibersihkan.

### Revision history

`transact_vehicle_revision` mencatat:

- transaksi dan field yang berubah;
- nilai sebelum dan sesudah;
- alasan perubahan;
- user dan waktu perubahan.

### Integrity constraints

- Maksimal satu session `IN_PROGRESS` per site.
- Maksimal satu `vehicle_actual` aktif per session.
- Composite FK `(session_id, site_id)` memastikan child dan session berasal dari site yang sama.
- Relasi source pada `vehicle_actual` harus berasal dari site dan session yang sama.
- Unique `external_id` dibuat site/device scoped, bukan global, bila ID device tidak dijamin global.

## 7. Target Code Structure

Perubahan dilakukan bertahap pada modul yang disentuh; tidak perlu memindahkan semua file sekaligus.

```text
services/backend/
  cmd/
    api/
    transaction-worker/
    anpr-watcher/
    axle-watcher/
    cctv-streamer/
    sync-agent/
  internal/
    domain/
      session/
      transaction/
      verification/
      source/
    application/
      startsession/
      ingestsource/
      finalizetransaction/
      verifytransaction/
    adapter/
      postgres/
      ftp/
      minio/
      nats/
      wim/
    transport/
      http/
```

Aturan struktur:

- transport/handler hanya memvalidasi input dan membentuk response;
- application/use case mengatur workflow bisnis;
- repository mengelola SQL dan database transaction;
- adapter mengelola FTP, MinIO, NATS, dan device;
- dependency mengarah ke interface domain/application;
- error tidak ditelan dan selalu memiliki context;
- retry hanya dilakukan pada operasi yang idempotent;
- operasi finalisasi menggunakan database transaction dan row locking;
- hindari generic repository yang menyembunyikan aturan domain.

Frontend processing dipecah tanpa mengubah visual:

```text
modules/v3/monitoring/processing/
  components/
  hooks/
    useDeviceHealth
    useProcessingSession
    useSessionSources
    useTransactionFinalization
    useProcessingPresentation
  api.ts
  mapper.ts
  state.ts
  types.ts
```

## 8. Urutan Implementasi

### Phase 0 — Isolasi dan baseline

- [ ] Pastikan `feat/revamp` menggunakan Compose project terpisah.
- [ ] Pisahkan database, Docker volume, network, port, FTP directory, MinIO bucket, NATS storage, dan sync cursor.
- [ ] Default-kan integrasi device real dan data-center sync menjadi nonaktif pada environment development.
- [ ] Dokumentasikan perintah start/stop/smoke test revamp pada Makefile/README.
- [ ] Catat baseline flow dan kontrak endpoint yang harus tetap kompatibel.

Definition of done:

- Revamp dapat dijalankan dan dihentikan tanpa menulis ke resource current.

### Phase 1 — Master data dan login

- [x] Satukan create/update user melalui backend API.
- [x] Pastikan password selalu di-hash oleh backend.
- [x] Gunakan user login untuk `created_by`/`updated_by`.
- [x] Hilangkan UUID nol dan fallback actor yang bukan user pada scope master data Phase 1.
- [x] Standarkan error handling GraphQL/API agar operasi gagal tidak terlihat sukses.
- [ ] Validasi create user -> login dan reset password -> login.

Catatan implementasi 4 September 2026:

- Migration dan initial seed revamp berhasil dijalankan melalui `make infra-bootstrap`, kemudian migration `007_phase1_master_audit.sql` dan seed diterapkan ulang.
- Mutation master user selalu melewati JWT middleware; backend menolak actor kosong, UUID nol, atau UUID tidak valid.
- `master_user` dan `master_vehicle_class` memiliki FK audit ke `master_user`; nilai UUID nol/orphan lama dinormalisasi menjadi `NULL` agar data legacy tetap dapat dimigrasikan.
- Initial admin dan operator memakai bcrypt serta memiliki `created_by` eksplisit dari proses bootstrap.
- Apollo mutation memakai `errorPolicy: none`; GraphQL error sekarang masuk ke failure path UI.
- Unit test backend untuk bcrypt dan validasi actor lulus. Smoke test end-to-end create/login/reset/login masih terbuka karena backend revamp belum dibuild/dijalankan pada sesi ini.
- `site.json` menjadi katalog `sites[]`; deployment memilih site aktif dengan `SITE=<nomor>` dan menyimpan pilihannya sebagai `SITE_SELECTOR`.
- Seluruh katalog site di-upsert ke `master_site` saat initial seed. Site aktif saja yang mengisi runtime config, identitas web/service, dan fallback latitude/longitude transaksi.
- `system_runtime_config` tetap menjadi sumber key-value runtime. `config_key` dibuat unik secara global karena seluruh consumer saat ini membaca berdasarkan key, sedangkan `master_config` dipertahankan untuk referensi bisnis dan tidak digunakan sebagai runtime override baru.

Definition of done:

- User yang dibuat atau diubah dari master data dapat login dan seluruh perubahan memiliki actor yang benar.

### Phase 2 — Migration fondasi transaksi

- [x] Siapkan migration incremental; jangan menjalankan migration revamp pada database current.
- [x] Tambahkan `transact_session_source`.
- [x] Tambahkan verification/completeness fields pada `vehicle_actual`.
- [x] Tambahkan `transact_vehicle_revision`.
- [x] Tambahkan satu active session per site.
- [x] Tambahkan satu `vehicle_actual` per `(site_id, session_id)`.
- [x] Tambahkan composite FK untuk site/session consistency.
- [x] Ubah uniqueness `external_id` menjadi site/device scoped bila diperlukan.
- [x] Siapkan audit query dan backfill terpisah sebelum menambah FK audit.

Catatan implementasi Phase 2:

- Migration disiapkan di `010_phase2_transaction_foundation.sql` dan dibungkus satu database transaction.
- Migration sengaja gagal tanpa mengubah schema bila menemukan duplicate active session, duplicate actual per site/session, atau duplicate external ID pada scope site/device.
- Lima source (`ANPR`, `AXLE`, `WIM`, `CCTV`, `DIMENSION`) mempunyai mode dan status independen; source gagal/timeout tidak membuat field payload menjadi wajib.
- Revision koreksi bersifat immutable dan menyimpan before/after JSON serta user pelaku perubahan.
- Preflight read-only tersedia di `infra/database/audits/phase2_preflight.sql`; recovery dijelaskan di `docs/phase2-transaction-migration.md`.
- Atas instruksi owner, migration Phase 2 belum dijalankan dan seluruh test/validasi ditunda untuk dilakukan sekaligus kemudian.

Definition of done:

- Migration dapat dijalankan pada clone data current, dapat diulang dengan aman bila memang didesain idempotent, dan mempunyai prosedur rollback/recovery yang terdokumentasi.

### Phase 3 — Transaction orchestrator

- [x] Buat backend use case untuk start session.
- [x] Simpan user sebagai `started_by` dan `created_by`.
- [x] Inisialisasi mode/status semua source saat session dibuat.
- [x] Implementasikan timeout independen per source.
- [x] Implementasikan finalisasi idempotent dalam satu database transaction.
- [x] Selalu buat `vehicle_actual`, termasuk untuk data `PARTIAL` atau `EMPTY`.
- [x] Ubah session menjadi `COMPLETED` hanya setelah `vehicle_actual` berhasil dibuat/upsert.
- [x] Sediakan recovery untuk session `IN_PROGRESS` yang ditinggalkan browser/service restart.

Catatan implementasi Phase 3:

- Lifecycle tersedia melalui endpoint backend start, active/recover, dan finalize yang selalu memerlukan JWT.
- Start diserialisasi dengan advisory transaction lock per site dan mengembalikan session aktif existing secara idempotent.
- Web v3 memakai orchestrator untuk start/finalize dan memulihkan session ketika halaman dimuat ulang; pemeriksaan device tidak lagi memblokir dimulainya transaksi parsial.
- Finalisasi menemukan source record terbaru berdasarkan `(site_id, session_id)`, menandai source yang tidak masuk, membuat tepat satu actual, lalu menyelesaikan session.
- GPS aktual dikirim saat finalisasi; koordinat master site dipakai backend ketika GPS tidak tersedia.
- Kontrak dan transaction guarantee didokumentasikan di `docs/phase3-transaction-orchestrator.md`.
- Compilation, migration lokal, dan smoke test lifecycle Phase 3 sudah dijalankan setelah Phase 4 selesai.
- Validasi lanjutan memperbaiki inferensi tipe parameter PostgreSQL dan parsing `missing_sources`; smoke test start, recover, finalize, serta finalize idempotent sudah lulus pada database revamp lokal.

Definition of done:

- Refresh atau penutupan browser tidak menghilangkan proses dan pemanggilan finalisasi berulang tidak membuat transaksi ganda.

### Phase 4 — Source adapters dan demo mode

- [x] ANPR real membaca file FTP dan mengaitkannya ke session yang tepat.
- [x] AXLE real membaca file FTP dan mengaitkannya ke session yang tepat.
- [x] WIM, CCTV, dan dimension mengikuti mode per source.
- [x] Service tidak mengambil fallback session dari site lain.
- [x] Queue consumer mempunyai log startup failure, backoff, dan batas retry/terminal handling.
- [x] Simpan `device_id`, source mode, error, dan waktu penerimaan.
- [x] Pastikan kegagalan satu source tidak menghentikan source lain.

Catatan implementasi Phase 4:

- Snapshot `transact_session_source` menjadi sumber kebenaran mode `REAL`, `DUMMY`, atau `DISABLED`; flag legacy `transact_wim_session.is_dummy` tidak lagi menentukan adapter secara global.
- ANPR dan AXLE hanya membaca FTP dalam mode `REAL`, sedangkan generator dummy hanya berjalan dalam mode `DUMMY`. Dimension membaca modenya sendiri.
- WB agent memilih live/dummy dari row source `WIM` dan mencatat `RECEIVED` atau penyebab kegagalan/timeout tanpa menghentikan source lain.
- CCTV live dan dummy membaca mode source `CCTV`; hasil queue mengisi record source dan `received_at`.
- Lookup session aktif dibatasi ketat oleh configured `site_id`; fallback lintas site dihapus.
- Queue ANPR/AXLE/CCTV mempunyai maksimal lima delivery, delayed backoff, terminal handling, serta menyimpan error source saat retry habis. Seluruh queue mencatat startup/fetch failure.
- Health/readiness endpoint queue belum ditambahkan agar scope tidak melebar; status operasional sementara diperoleh dari startup log dan `transact_session_source`.
- Compilation dan smoke test transaksi parsial Phase 4 sudah dijalankan; pengujian dengan seluruh device fisik tetap menunggu environment perangkat.
- Validasi lanjutan memperbaiki race penyimpanan dimension terhadap queue ANPR dan conflict clause legacy ANPR/AXLE. Skenario satu source diterima dan satu source gagal sudah menghasilkan `PARTIAL` dengan `missing_sources=[AXLE]`.

Definition of done:

- Kombinasi real/dummy dapat dipilih per source dan kegagalan terkontrol menghasilkan transaksi parsial.

### Phase 5 — Verifikasi dan audit koreksi

- [ ] Form verifikasi mengisi nilai `actual_*`, bukan menimpa raw source.
- [ ] Wajibkan alasan untuk manual completion/override sesuai keputusan bisnis.
- [ ] Catat setiap perubahan ke `transact_vehicle_revision`.
- [ ] Isi `verified_by`, `verified_at`, dan status verifikasi.
- [ ] Pastikan user login tersimpan pada status/penindakan.
- [ ] Bedakan data `REAL`, `DUMMY`, dan `MANUAL` pada data model tanpa harus mengubah tampilan existing.

Definition of done:

- Data kosong dapat dilengkapi dan seluruh perubahan dapat ditelusuri ke user serta nilai sebelumnya.

### Phase 6 — List transaksi dan report

- [ ] Scope query berdasarkan site.
- [ ] Perbaiki boundary tanggal dan timezone site.
- [ ] Pastikan pagination/filter dilakukan server-side untuk dataset besar.
- [ ] Export seluruh hasil filter, bukan hanya page aktif.
- [ ] Gunakan nilai final hasil verifikasi untuk report.
- [ ] Tampilkan/ekspor completeness dan source provenance bila diperlukan bisnis.

Definition of done:

- List, detail, dan export menghasilkan data yang konsisten untuk filter dan site yang sama.

### Phase 7 — Dashboard

- [ ] Pindahkan agregasi ke query/API server-side.
- [ ] Scope dashboard berdasarkan site dan rentang waktu.
- [ ] Jangan mengklasifikasikan data tidak lengkap sebagai normal secara otomatis.
- [ ] Gunakan hasil verifikasi sebagai nilai authoritative.
- [ ] Tentukan perlakuan transaksi `PENDING` dan `PARTIAL` pada metrik.

Definition of done:

- Angka dashboard dapat direkonsiliasi dengan list/report untuk filter yang sama.

### Phase 8 — Sync data center

- [ ] Gunakan cursor, status, dan retry per tabel/source.
- [ ] Kegagalan satu tabel tidak menghentikan tabel lain.
- [ ] Jangan memajukan attachment cursor ketika object belum tersedia.
- [ ] Tambahkan reconciliation untuk late-arriving data dan attachment.
- [ ] Sinkronkan source status, completeness, verification, revision yang diperlukan, dan actor.
- [ ] Pastikan payload/update bersifat idempotent.

Definition of done:

- Gangguan jaringan atau satu payload gagal dapat dipulihkan tanpa kehilangan record lain atau membuat duplikasi.

### Phase 9 — Data center backend dan web

- [ ] Tetapkan satu canonical transaction store di data center.
- [ ] Migrasikan atau hentikan jalur legacy sebelum menghapus tabel lama.
- [ ] Hindari `UNION ALL` dari dua store yang dapat memuat transaksi sama.
- [ ] Sesuaikan detail transaksi dengan partial data dan source status.
- [ ] Evaluasi perubahan UI data center setelah kontrak data stabil.

Definition of done:

- Satu transaksi site muncul tepat satu kali di data center dan detailnya dapat menjelaskan data yang tidak tersedia.

### Phase 10 — Cutover readiness

- [ ] Jalankan migration rehearsal pada clone database current.
- [ ] Uji skenario semua source sukses, masing-masing source gagal, beberapa source gagal, semua source gagal, retry, restart, dan duplicate delivery.
- [ ] Rekonsiliasi session, source records, vehicle actual, status, attachment, dan data center.
- [ ] Siapkan backup, rollback runbook, dan release checklist.
- [ ] Pastikan current dan revamp tidak aktif sebagai dua writer saat cutover.

Definition of done:

- Ada bukti test, hasil reconciliation, prosedur cutover, dan rollback yang disetujui sebelum deployment.

## 9. Migration Rules

- Gunakan migration bernomor setelah migration terakhir, misalnya:

```text
007_add_session_source.sql
008_add_transaction_idempotency.sql
009_add_audit_actor_relations.sql
010_add_vehicle_revision.sql
011_add_cross_site_constraints.sql
```

- Setiap migration memisahkan schema change, backfill, dan enforcement bila datanya berisiko tidak kompatibel.
- Jangan langsung membuat audit actor `NOT NULL` sebelum UUID nol dan data lama dibersihkan.
- Migration destructive memerlukan backup, impact query, dan approval terpisah.
- Validasi row count dan orphan relation sebelum serta sesudah migration.

## 10. Test Strategy

Prioritas test mengikuti risiko, bukan angka coverage.

- Unit: parsing, status transition, completeness calculation, dan ODOL calculation.
- Repository integration: unique constraint, composite FK, upsert, transaction rollback, dan concurrent finalization.
- Contract: backend API, queue message, dan data-center sync payload.
- Integration: FTP -> queue -> source row -> session -> vehicle actual.
- Recovery: service restart, browser refresh, timeout, late-arriving data, NATS redelivery, dan network failure.
- End-to-end: login -> start session -> partial source -> verification -> report -> sync.

Skenario minimum per source:

1. `REAL + RECEIVED`.
2. `REAL + TIMEOUT`.
3. `REAL + FAILED` kemudian retry berhasil.
4. `DUMMY + RECEIVED`.
5. Data datang setelah transaction difinalisasi.
6. Payload yang sama dikirim lebih dari satu kali.

## 11. Observability dan Operability

Minimal tersedia per service/source:

- health dan readiness;
- `last_received_at` dan `last_success_at`;
- current session ID dan site ID;
- queue lag/delivery attempts;
- timeout dan failure reason;
- jumlah session aktif/tertinggal;
- jumlah transaksi `PARTIAL`/`EMPTY`;
- sync cursor, retry count, dan last error.

Log harus mempunyai correlation fields:

```text
site_id
session_id
transaction_id
source_type
external_id
```

## 12. Deployment Isolation dan Cutover

Environment revamp harus memakai resource berbeda dari current:

```text
Compose project : jatanlin-revamp
Database        : jatanlin_revamp
Docker volumes  : revamp-specific
MinIO buckets   : revamp-specific
FTP directories : revamp-specific
NATS storage    : revamp-specific
Sync cursor     : revamp-specific
```

Urutan cutover:

1. Freeze perubahan schema current.
2. Backup database dan object storage.
3. Restore ke environment rehearsal.
4. Jalankan migration dan reconciliation.
5. Uji revamp dengan device write dinonaktifkan.
6. Lakukan acceptance test seluruh flow utama.
7. Hentikan writer current.
8. Jalankan migration/cutover yang disetujui.
9. Aktifkan writer revamp.
10. Monitor dan rollback bila reconciliation gagal.

## 13. Working Agreement

Untuk setiap phase:

1. Konfirmasi objective, scope, dan acceptance criteria.
2. Periksa perubahan user/worktree sebelum mengedit.
3. Implementasikan satu slice kecil yang dapat diverifikasi.
4. Tambahkan test sesuai risiko yang disentuh.
5. Jalankan validasi terfokus terlebih dahulu.
6. Catat perubahan schema/API sebagai keputusan yang ADR-friendly.
7. Laporkan perubahan, bukti verifikasi, risiko tersisa, dan langkah berikutnya.

Dokumen ini menjadi reference utama. Jika keputusan bisnis berubah, perbarui bagian keputusan dan phase terkait sebelum implementasi dilanjutkan.
