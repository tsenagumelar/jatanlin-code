# Jatanlin Data Center

Stack ini terpisah dari site/local revamp. Fokus awalnya hanya:

- PostgreSQL data center
- Hasura data center
- Backend API untuk login dan overview data center
- Web data center dengan route `/login` dan `/data-center`

## Default Local Ports

- Web: `http://localhost:3001`
- Backend API: `http://localhost:28001`
- Hasura Console: `http://localhost:28080`
- PostgreSQL: `localhost:25432`

## Default Login

- Username: `admin`
- Password: `admin123`

## Commands

```sh
make infra-bootstrap
make web
```

Untuk menjalankan API dan web di luar Docker:

```sh
make infra-up
make infra-migrate
make infra-seed
make dev
```

## Structure

```text
data-center/
  infra/
    compose/              # Postgres, Hasura, backend API
    database/             # Schema dan seed data center
  services/
    backend/              # Go API auth + overview
  apps/
    web/                  # Next web login + data center page
  scripts/                # Migration dan seed runner
```
