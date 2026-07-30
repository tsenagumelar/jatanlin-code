# LED Compact

LED compact memakai basis LED v1/lama, lalu dimasukkan ke pengalaman v3 di `apps/web`.

## Tujuan

- Tampilan lebih compact.
- Cocok untuk fullscreen monitoring.
- Status utama mudah dibaca dari jarak jauh.
- Tetap mengikuti data/flow lama yang sudah berjalan.

## Target Module

```text
apps/web/src/modules/v3/monitoring/led-display/
```

## Requirement

- Normal view dan fullscreen view.
- Layout responsive.
- Data utama: vehicle, weight/status, lane/device status, timestamp.
- Warna status jelas dan konsisten.
- Tidak bergantung pada route LED lama di luar revamp.

## Gate

- Route LED v3 terbuka tanpa 404.
- Build web berhasil.
- Smoke test visual dilakukan bersama.
