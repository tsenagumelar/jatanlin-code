# Jatanlin Monorepo

Monorepo ini menggabungkan kode aplikasi Jatanlin/WIM dari repository lama ke struktur baru.

## Struktur

```text
jatanlin-code/
├── jatanlin-web-apps/
│   └── ...                  # Full code frontend dari jatanlin-web
├── jatanlin-wb-agent/                # Full code agent .NET 8 untuk WServer/WIM bridge
├── jatanlin-backend-services/
│   └── ...                  # Full code backend Go dari wim-service
└── specs/                   # Rules, arsitektur, dan spesifikasi aplikasi
```

## Catatan Migrasi

Kode dipindahkan dari:

- `jatanlin-web` ke `jatanlin-web-apps`
- `Wim-agent-wb` ke `jatanlin-wb-agent`
- `wim-service` ke `jatanlin-backend-services`

Dependency, build output, runtime data, dan secret lokal tidak ikut disalin: `.git`, `node_modules`, `.next`, `bin`, `obj`, `recordings`, `.env`, `.DS_Store`, dan database lokal.

`wim-web` tidak dimigrasikan karena aplikasi web yang dipakai hanya kode lama dari `jatanlin-web`.

## Dokumen Spesifikasi

- [Rules](specs/rules.md)
- [Arsitektur](specs/architecture.md)
- [Specs Index](specs/README.md)
- [Web Apps](specs/web/general.md)
- [WB Agent](specs/wb/general.md)
- [Backend Services](specs/backend/general.md)
