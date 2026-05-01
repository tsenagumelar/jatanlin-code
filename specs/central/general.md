# Central Dashboard General

## Tujuan

Menambahkan aplikasi dashboard terpusat di data center untuk mengkonsolidasikan data transaksi dari banyak deployment area/site Jatanlin. Setiap area tetap berjalan independen, dan mengirim salinan data transaksi ke pusat untuk kebutuhan monitoring nasional/regional, analitik lintas area, dan pelaporan manajemen.

## Scope

- In scope:
  - Konsolidasi data transaksi lintas area ke data center.
  - Dashboard web terpusat untuk membaca data agregat semua area.
  - Penyaringan data berdasarkan area/site, waktu, status verifikasi, dan indikator ODOL.
  - Ringkasan KPI lintas area dan drill-down per area.
- Out of scope (fase awal):
  - Kontrol operasi realtime device di area (ANPR, AXLE, WB, CCTV) dari data center.
  - Replikasi full media file berukuran besar (video/foto raw) sebagai default.
  - Menggantikan dashboard operasional lokal area.

## Prinsip Arsitektur

- Tiap area tetap menjadi source system untuk operasional lokal.
- Data center menerima data turunan (replica/projection) untuk kebutuhan observability dan reporting.
- Integrasi harus idempotent, tahan retry, dan tidak membuat duplicate row pusat.
- Isolasi area wajib dijaga melalui `site_id`/`area_id` dan `source_system_id`.
- Kegagalan jalur central sync tidak boleh mengganggu proses capture lokal area.

## Persona Utama

- Admin Pusat: melihat seluruh area, KPI nasional, quality monitoring data.
- Supervisor Area: melihat area sendiri dan benchmark terhadap area lain (sesuai hak akses).
- Auditor/Manajemen: melihat tren pelanggaran, volume transaksi, dan kualitas verifikasi.

## Success Metrics (MVP)

- Data freshness p95 dari area ke pusat <= 5 menit.
- Data completeness transaksi pusat >= 99% terhadap transaksi final di area (D+1).
- Duplicate rate di tabel transaksi pusat < 0.1%.
- Dashboard query utama (filter 30 hari semua area) p95 < 3 detik.

## Terminologi

- Area/Site: lokasi deployment mandiri aplikasi Jatanlin.
- Local System: stack aplikasi area (web + backend + wb-agent + DB area).
- Central Ingestion: layanan penerima data transaksi dari area.
- Central Warehouse: penyimpanan data terstandar di data center.
- Central Dashboard: aplikasi web untuk visualisasi dan analitik lintas area.
