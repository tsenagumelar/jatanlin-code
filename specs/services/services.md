# Services

## Backend Go

Target revamp: `services/backend`.

Scope:
- API utama.
- Integrasi ANPR, AXLE, CCTV, dimension.
- Data processing non-WB.
- Shared config, logging, healthcheck.

## WB Agent

Target revamp: `services/wb-agent`.

WB agent masuk `services` karena merupakan backend service. Dia berkomunikasi dengan WIM/WServer, device, dan database. Web hanya mengonsumsi status/data hasil service.

Struktur revamp WB agent:

```text
services/wb-agent/
├── Configuration/
├── Endpoints/
├── Models/
├── Services/
├── Program.cs
└── WServerApi.csproj
```

Endpoint HTTP tetap sama seperti baseline. Refactor saat ini hanya memindahkan wiring service, endpoint dasar, endpoint vehicle, helper WIM frame, dan resolver session ke file/domain yang lebih mudah dibaca.

## Service Contract

Setiap service harus punya:

- README singkat.
- `.env.example`.
- Healthcheck atau command smoke test.
- Target Makefile untuk run, test, dan build.

## Refactor Rule

Kode lama boleh dicopy dari folder lama ke target revamp. Setelah dicopy, refactor dilakukan di dalam revamp saja.
