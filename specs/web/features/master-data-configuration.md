# Web Feature: Master Data & Configuration

## Source Area

- `app/(private)/master-data/pengguna/page.tsx`
- `app/(private)/master-data/kelas-kendaraan/page.tsx`
- `app/(private)/konfigurasi/page.tsx`
- `src/modules/master-user/*`
- `src/modules/master-vehicle-class/*`
- `src/modules/configuration/*`

## Behavior

- Master user mendukung list, detail, create, update, soft delete, filter, pagination, role options, dan cek username exists.
- Master vehicle class mendukung list, detail, create, update, soft delete, restore, cek code/type exists, dan menyimpan batas berat/dimensi per kelas.
- Configuration module mendukung list, detail, edit, filter, pagination, soft delete/restore, cek code/key exists, dan config by type.
- Config `TOLERANCE_WEIGHT` dan `TOLERANCE_DIM` dipakai dalam processing ODOL.

## Rules

- Semua master data harus soft delete, bukan hard delete.
- Code/key/type uniqueness harus dicek sebelum insert/update.
- Audit field harus diisi dari current user jika tersedia.
- Config yang mempengaruhi legal/operasional harus terdokumentasi dan tidak silent fallback.
