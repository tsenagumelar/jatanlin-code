# Local Development

Local development revamp dijalankan dari folder `jatanlin-revamp`.

## Target Makefile

```bash
make infra-up
make infra-bootstrap
make infra-migrate
make infra-seed
make infra-down
make infra-ps
make infra-logs
```

Target infra di atas tidak menjalankan web, backend Go, atau WB agent. Target app seperti `make web`, `make backend`, `make wb-agent`, `make dev`, `make test`, dan `make build` ditambahkan pada fase berikutnya.

## Expected Services

| Service | Target folder | Default port |
| --- | --- | --- |
| Web | `apps/web` | `3000` |
| Backend Go | `services/backend` | `8080` |
| WB agent | `services/wb-agent` | mengikuti config service |
| PostgreSQL | `infra/compose` | `5432` |
| Hasura | `infra/compose` | `18080` |
| MinIO | `infra/compose` | `19000`, `19001` |
| NATS | `infra/compose` | `14222` |
| Redis | `infra/compose` | `16379` |
| FTP sample | `infra/compose` | `10021`, `21100-21110` |

## Env

- Root revamp menyediakan `.env.example`.
- Setiap service boleh punya `.env.example` sendiri bila config-nya spesifik.
- Secret lokal tidak dicommit.
- Env lama boleh dijadikan referensi, tetapi file env lama tidak diedit.

## Compose

Compose local hanya untuk dependency runtime. Aplikasi tetap dijalankan dari source melalui Makefile agar debugging lebih mudah.

## Database Init

Database revamp memakai dua file inisiasi:

- `infra/database/001_schema.sql`: schema final untuk local bootstrap, termasuk tambahan `is_dummy` di `transact_wim_session` dan `system_runtime_config`.
- `infra/database/001_seed.sql`: seed awal semua master data, sample device, site, dan user lokal.

Command:

```bash
make infra-migrate
make infra-seed
make infra-bootstrap
```
