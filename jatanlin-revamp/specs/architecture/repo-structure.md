# Repo Structure

Struktur ini berlaku hanya di dalam `jatanlin-revamp`.

```text
jatanlin-revamp/
├── Makefile
├── .env.example
├── apps/
│   └── web/
├── services/
│   ├── backend/
│   └── wb-agent/
├── infra/
│   ├── compose/
│   └── portainer/
├── scripts/
└── specs/
```

## Source Mapping

| Source lama | Target revamp | Catatan |
| --- | --- | --- |
| `../jatanlin-web-apps` | `apps/web` | Copy atau scaffold ulang Next app. V3 menjadi acuan UI. |
| `../jatanlin-backend-services` | `services/backend` | Copy backend Go lalu refactor bertahap di revamp. |
| `../jatanlin-wb-agent` | `services/wb-agent` | Copy WB agent karena dia backend service. |
| `../deploy` | `infra/portainer` | Copy material deploy yang masih relevan. |
| `../specs` | `specs/reference` bila perlu | Hanya referensi, jangan edit specs lama. |

## Aturan

- Tidak ada `apps/`, `services/`, `infra/`, atau `Makefile` baru di root lama.
- Semua command Makefile berjalan dari `jatanlin-revamp`.
- Path relatif dari revamp boleh menunjuk ke folder lama hanya untuk proses copy/audit, bukan runtime normal.
