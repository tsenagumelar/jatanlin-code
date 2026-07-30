# Migration Plan

Migration di sini berarti membangun revamp terisolasi, bukan memindahkan folder lama.

## Phase 0 - Specs

- Tetapkan boundary: folder lama tidak diubah.
- Tetapkan struktur revamp.
- Tetapkan task backlog.

## Phase 1 - Scaffold Revamp

- Buat `Makefile` di `jatanlin-revamp`.
- Buat `.env.example`.
- Buat folder `apps`, `services`, `infra`, dan `scripts`.
- Buat compose local untuk dependency.

## Phase 2 - Bring In Source

- Scaffold atau copy web ke `apps/web`.
- Copy backend Go ke `services/backend`.
- Copy WB agent ke `services/wb-agent`.
- Copy deploy material yang relevan ke `infra/portainer`.

## Phase 3 - Stabilize Local Run

- `make setup`.
- `make web`.
- `make backend`.
- `make wb-agent`.
- `make dev`.

## Phase 4 - Web V3 + LED Compact

- Jadikan v3 sebagai primary UI.
- Port LED v1/lama ke LED compact v3.
- Tambah route normal dan fullscreen.
- Smoke test browser.

## Phase 5 - Backend Cleanup

- Audit backend setelah dicopy.
- Refactor package kecil dengan test.
- Pastikan API contract yang dipakai web stabil.

## Phase 6 - Test Bersama

- `make test`.
- `make build`.
- Local smoke test end-to-end.
- Bandingkan behavior dengan app lama.

## Phase 7 - Cutover Decision

Cutover hanya dibahas setelah revamp stabil. Sampai fase itu, folder lama tetap menjadi versi yang berjalan.
