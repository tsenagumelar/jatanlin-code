# Web Feature: LED, Preview, Guide

## Source Area

- `app/(private)/led/page.tsx`
- `app/(fullscreen)/led/fullscreen/page.tsx`
- `app/(private)/preview/page.tsx`
- `app/(private)/panduan/page.tsx`
- `src/modules/led/index.tsx`

## Behavior

- LED display membaca state dari `ProcessingContext`.
- LED reguler dan fullscreen menampilkan status/hasil processing untuk kebutuhan display lapangan.
- Preview page menyediakan tampilan monitoring/operasional.
- Panduan page berisi dokumentasi penggunaan aplikasi untuk operator.

## Rules

- Tampilan fullscreen harus bisa keluar dengan interaksi keyboard/browser yang aman.
- LED tidak boleh punya state paralel yang berbeda dari processing context.
- Preview/panduan harus tetap read-only kecuali ada kebutuhan operasional eksplisit.
