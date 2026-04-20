# Web Feature: Auth & Layout

## Source Area

- `app/page.tsx`
- `app/(public)/login/page.tsx`
- `app/(private)/layout.tsx`
- `src/modules/login/*`
- `src/redux/*`
- `src/utils/auth.ts`

## Behavior

- Root route redirect berdasarkan `login.isAuthenticated` ke `/beranda` atau `/login`.
- Login memakai GraphQL query `Login` ke tabel `master_user`.
- Credential input mendukung username atau email.
- User hanya valid jika `is_active=true` dan `is_deleted=false`.
- Login state disimpan di Redux slice `login`.
- Auth cookie `authToken` ditulis melalui utility auth.
- Private layout menyediakan shell navigasi dengan sidebar/navbar.

## Rules

- Jangan validasi password plain-text di frontend untuk production; flow saat ini mengikuti kode lama dan harus diganti mekanisme auth server/JWT.
- Jangan menaruh token/secret hardcoded di Redux initial state.
- Route private harus tetap bergantung pada state auth yang konsisten.
