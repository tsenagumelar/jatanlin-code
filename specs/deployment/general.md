# Deployment General

## Tujuan

Menyediakan mekanisme deployment per area/site yang konsisten, repeatable, dan dapat dijalankan dengan satu perintah (one-click) menggunakan konfigurasi input per area.

## Scope

- In scope:
  - Provisioning host runtime untuk stack area.
  - Setup Portainer (jika belum tersedia di host area).
  - Deploy layanan inti area: web, general API, ANPR (termasuk dimension), AXLE, CCTV, WB, PostgreSQL, MinIO, FTP, Hasura, dan NATS.
  - Menjalankan migration DB awal, seed master data baseline, dan bootstrap user admin default area dari config.
  - Inject environment variable dari file konfigurasi area.
  - Health check dan post-deploy verification.
- Out of scope:
  - Deployment dashboard/data center terpusat.
  - Manajemen device fisik WIM/ANPR/AXLE di layer firmware/jaringan lokal.

## Prinsip

- Idempotent: rerun script tidak boleh merusak deployment existing.
- Declarative config: semua parameter area didefinisikan di file config, bukan hardcoded di script.
- Secure by default: secret tidak tersimpan plaintext di repo.
- Observable: setiap tahap deploy punya log dan status jelas.
- Rollback-aware: jika tahap kritikal gagal, script mengeksekusi recovery langkah aman.
