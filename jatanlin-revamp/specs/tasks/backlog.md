# Backlog

## Phase 0 - Guardrail

- [x] Buat folder `jatanlin-revamp`.
- [x] Buat specs awal.
- [x] Tegaskan folder lama tidak boleh diedit.
- [x] Tetapkan WB agent di `services/wb-agent`.

## Phase 1 - Scaffold

- [x] Buat `jatanlin-revamp/Makefile`.
- [x] Buat `jatanlin-revamp/.env.example`.
- [x] Buat folder `apps/web`.
- [x] Buat folder `services/backend`.
- [x] Buat folder `services/wb-agent`.
- [x] Buat folder `infra/compose`.
- [x] Buat folder `scripts`.

## Phase 2 - Copy Source

- [x] Copy atau scaffold Next app ke `apps/web`.
- [x] Copy backend Go ke `services/backend`.
- [x] Copy WB agent ke `services/wb-agent`.
- [ ] Copy deploy material relevan ke `infra/portainer`.
- [ ] Pastikan tidak ada perubahan di folder lama setelah copy.

## Phase 3 - Makefile Local Run

- [ ] Tambah target `make setup`.
- [x] Tambah target `make web-dev`.
- [ ] Tambah target `make backend`.
- [ ] Tambah target `make wb-agent`.
- [ ] Tambah target `make dev`.
- [ ] Tambah target `make down`.
- [ ] Tambah target `make test`.
- [ ] Tambah target `make build`.
- [x] Tambah target infra-only: `make infra-up`, `make infra-down`, `make infra-ps`, `make infra-logs`.
- [x] Tambah target database: `make infra-migrate`, `make infra-seed`, `make infra-bootstrap`.
- [x] Konsolidasikan database init menjadi `infra/database/001_schema.sql` dan `infra/database/001_seed.sql`.
- [x] Tambahkan sample data untuk semua master data utama.

## Phase 4 - Web V3

- [x] Tentukan apakah web dimulai dari Next baru atau copy app lama.
- [x] Jadikan v3 sebagai default surface tanpa prefix `/v3`.
- [ ] Rapikan sidebar/menu v3.
- [ ] Pastikan semua route utama tidak 404.
- [ ] Hubungkan config/env API revamp.

## Phase 5 - LED Compact

- [ ] Audit LED lama/v1.
- [ ] Port logic dan tampilan penting ke module v3.
- [ ] Buat route LED normal.
- [ ] Buat route LED fullscreen.
- [ ] Smoke test visual bersama.

## Phase 6 - Backend

- [x] Copy backend Go ke `services/backend`.
- [x] Build/test baseline backend setelah copy.
- [x] Audit package besar.
- [x] Pisahkan `internal/handler` menjadi domain package: `anpr`, `axle`, `dimension`, `session`, `attachment`, `veam`.
- [x] Tambah shared ingest helper untuk logic lintas ANPR/AXLE.
- [x] Refactor API routing menjadi modular tanpa mengubah endpoint.
- [ ] Tambah healthcheck/smoke endpoint bila belum ada.

## Phase 7 - WB Agent

- [x] Copy WB agent ke `services/wb-agent`.
- [x] Pisahkan service registration ke `Configuration/ServiceCollectionExtensions.cs`.
- [x] Pisahkan root/basic WServer endpoint ke `Endpoints/RootEndpoints.cs`.
- [x] Pisahkan vehicle query endpoint ke `Endpoints/VehicleEndpoints.cs`.
- [x] Pisahkan helper WIM frame/capture stream ke `Services/WimFrameHelpers.cs`.
- [x] Pisahkan resolver session/site WIM ke `Services/WimSessionResolver.cs`.
- [x] Build baseline WB agent setelah modularisasi.
- [ ] Rapikan env/config local.
- [ ] Tambah target run dari Makefile.
- [ ] Smoke test koneksi dependency local.

## Phase 8 - Verification

- [ ] `make test`.
- [ ] `make build`.
- [ ] `make dev`.
- [ ] Test web, backend, dan WB agent bersama.
- [ ] Dokumentasikan gap sebelum cutover.
