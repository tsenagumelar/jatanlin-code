# Session Ownership Validation

Dokumen ini menjelaskan cara simulasi untuk memvalidasi behavior baru:

- satu row ANPR per `session_id`
- satu row AXLE per `session_id`
- ANPR update berdasarkan `confidence`, lalu completeness, lalu recency
- AXLE update berdasarkan validitas axle, lalu completeness, lalu recency

## Tujuan Uji

Perubahan baru dianggap benar jika:

1. selama satu session aktif, ANPR tidak membuat row kedua untuk `session_id` yang sama
2. selama satu session aktif, AXLE tidak membuat row kedua untuk `session_id` yang sama
3. payload ANPR baru dengan confidence lebih tinggi meng-update row session yang sama
4. payload ANPR baru dengan confidence lebih rendah tidak menimpa data lama
5. payload AXLE baru yang lebih lengkap meng-update row session yang sama
6. klik `Mulai Ulang` saat session masih aktif tidak menghasilkan row ANPR/AXLE tambahan

## Prasyarat

- PostgreSQL aktif dan berisi schema terbaru
- NATS aktif
- `jatanlin-backend-services` bisa connect ke DB dan NATS
- ada `site_id` valid yang dipakai aplikasi
- web atau SQL bisa membuat `transact_wim_session` dengan status `IN_PROGRESS`

File bantu query:

- [validate_session_ownership_simulation.sql](/Users/taufansenagumelar/Documents/Project/Jatanlin/jatanlin-code/jatanlin-backend-services/docs/sql/validate_session_ownership_simulation.sql)

## Mode Uji yang Disarankan

### 1. Uji cepat dengan dummy mode

Paling cepat untuk memastikan ownership row per session sudah bekerja.

Set environment:

```env
ANPR_DUMMY_ENABLED=true
AXLE_DUMMY_ENABLED=true
ANPR_FTP_INTERVAL_SEC=5
AXLE_FTP_INTERVAL_SEC=5
```

Lalu jalankan:

```bash
cd jatanlin-code/jatanlin-backend-services
GOCACHE=$(pwd)/.gocache go run ./cmd/anpr-watcher
GOCACHE=$(pwd)/.gocache go run ./cmd/axle-watcher
```

Kemudian buat session aktif dari web atau SQL.

Expected:

- dalam beberapa detik akan terbentuk tepat 1 row ANPR untuk session itu
- dalam beberapa detik akan terbentuk tepat 1 row AXLE untuk session itu
- watcher polling berikutnya tidak boleh menambah row baru

Validasi dengan query section B/C/D pada file SQL helper.

### 2. Uji real dengan FTP input

Pakai saat ingin memvalidasi logic merge/update real payload.

Set environment:

```env
ANPR_DUMMY_ENABLED=false
AXLE_DUMMY_ENABLED=false
```

Lalu siapkan beberapa file FTP dengan urutan skenario di bawah.

## Skenario Uji Inti

### Skenario A: Dummy mode basic ownership

Langkah:

1. aktifkan dummy mode ANPR dan AXLE
2. buat session `IN_PROGRESS`
3. tunggu 1 sampai 2 interval polling
4. jalankan query count per session

Expected:

- `anpr_rows = 1`
- `axle_rows = 1`
- `created_date` boleh tetap
- `updated_date` boleh berubah bila ada update merge, tetapi jumlah row tidak bertambah

### Skenario B: ANPR higher confidence should replace

Gunakan real FTP input.

Masukkan payload/file ANPR 1:

- plate sama
- confidence lebih rendah, misal `80`
- image atau metadata sebagian

Pastikan row session sudah terbentuk.

Masukkan payload/file ANPR 2:

- masih untuk session yang sama
- confidence lebih tinggi, misal `95`
- metadata lebih lengkap

Expected:

- tetap hanya 1 row ANPR untuk `session_id`
- nilai `confidence` berubah ke `95`
- `external_id`, object path, dan metadata boleh ikut berganti ke payload baru jika payload baru terpilih
- `updated_date` berubah

### Skenario C: ANPR lower confidence should not replace

Lanjutan dari skenario B.

Masukkan payload/file ANPR 3:

- session yang sama
- confidence lebih rendah, misal `70`

Expected:

- tetap hanya 1 row ANPR
- confidence tetap `95`
- data penting dari payload sebelumnya tidak tertimpa data yang lebih buruk

### Skenario D: ANPR equal confidence, more complete should replace

Masukkan payload/file ANPR 1:

- confidence `90`
- missing full image / plate image

Masukkan payload/file ANPR 2:

- confidence `90`
- file image lengkap

Expected:

- tetap hanya 1 row ANPR
- payload kedua dipakai untuk update karena completeness lebih tinggi

### Skenario E: AXLE placeholder/partial should become valid

Gunakan real FTP atau jalur insert manual.

Masukkan payload/file AXLE 1:

- `total_axles = 0` atau metadata sangat minim

Masukkan payload/file AXLE 2:

- `total_axles > 0`
- panjang, roda, kategori, body type terisi

Expected:

- tetap hanya 1 row AXLE
- row AXLE existing berubah menjadi data valid
- `total_axles` menjadi nilai valid dari payload kedua

### Skenario F: AXLE more complete should replace

Masukkan payload/file AXLE 1:

- `total_axles = 5`
- image belum ada

Masukkan payload/file AXLE 2:

- `total_axles = 5`
- image ada
- metadata lebih lengkap

Expected:

- tetap hanya 1 row AXLE
- payload kedua update row karena completeness lebih tinggi

### Skenario G: Mulai Ulang while session still active

Langkah:

1. buat session aktif
2. biarkan ANPR dan AXLE masing-masing sudah punya satu row
3. di web klik `Mulai Ulang` saat session belum `COMPLETED`
4. biarkan watcher tetap berjalan

Expected:

- `session_id` tetap sama
- tidak ada row ANPR kedua
- tidak ada row AXLE kedua
- jika ada payload baru, yang terjadi hanya update row existing

### Skenario H: New session after completed

Langkah:

1. selesaikan session pertama menjadi `COMPLETED`
2. trigger proses baru sampai web membuat session baru
3. watcher menangkap data lagi

Expected:

- session baru memiliki `session_id` berbeda
- ANPR row baru muncul untuk session baru
- AXLE row baru muncul untuk session baru
- row session lama tidak berubah lagi

## Query Validasi Minimum

### Hitung row ANPR dan AXLE per session aktif

Gunakan section B di file SQL helper.

Hasil yang benar:

```text
anpr_rows = 1
axle_rows = 1
```

### Cek duplicate historis

Gunakan section E di file SQL helper.

Interpretasi:

- jika ada hasil lama dengan `row_count > 1`, itu bisa duplicate historis sebelum perubahan
- yang penting: setelah implementasi baru, session yang baru diuji tidak menambah duplicate baru

## Kalau Ingin Uji Tanpa FTP

Ada 2 opsi:

1. aktifkan dummy mode untuk sanity check ownership row
2. gunakan `cmd/session-simulator` untuk mengirim payload ANPR/AXLE langsung ke NATS queue tanpa FTP

### Opsi 1: Dummy mode

Ini memvalidasi:

- listener berbasis session aktif
- hanya satu row per `session_id`
- polling berikutnya tidak menambah row baru

### Opsi 2: Session simulator

Ini memvalidasi merge/update logic backend tanpa perlu FTP.

Jalankan command dari folder backend:

```bash
cd /Users/taufansenagumelar/Documents/Project/Jatanlin/jatanlin-code/jatanlin-backend-services
```

Contoh ANPR confidence rendah:

```bash
GOCACHE=$(pwd)/.gocache go run ./cmd/session-simulator \
  -source anpr \
  -session-id YOUR_SESSION_UUID \
  -external-id ANPR-LOW-001 \
  -plate B1234TEST \
  -confidence 80 \
  -location SIM-GATE \
  -camera-id SIM-ANPR-01
```

Contoh ANPR confidence lebih tinggi untuk session yang sama:

```bash
GOCACHE=$(pwd)/.gocache go run ./cmd/session-simulator \
  -source anpr \
  -session-id YOUR_SESSION_UUID \
  -external-id ANPR-HIGH-001 \
  -plate B1234TEST \
  -confidence 95 \
  -location SIM-GATE \
  -camera-id SIM-ANPR-01
```

Expected:

- tetap 1 row ANPR untuk `session_id` tersebut
- row yang sama di-update
- `confidence` berubah menjadi `95`

Contoh AXLE partial:

```bash
GOCACHE=$(pwd)/.gocache go run ./cmd/session-simulator \
  -source axle \
  -session-id YOUR_SESSION_UUID \
  -external-id AXLE-PARTIAL-001 \
  -plate B1234TEST \
  -camera-id SIM-AXLE-01 \
  -length 0 \
  -nwheels 0 \
  -naxles 0
```

Contoh AXLE valid dan lebih lengkap:

```bash
GOCACHE=$(pwd)/.gocache go run ./cmd/session-simulator \
  -source axle \
  -session-id YOUR_SESSION_UUID \
  -external-id AXLE-FULL-001 \
  -plate B1234TEST \
  -camera-id SIM-AXLE-01 \
  -length 12000 \
  -nwheels 10 \
  -naxles 5 \
  -category TRUCK \
  -body-type BOX
```

Expected:

- tetap 1 row AXLE untuk `session_id` tersebut
- row AXLE di-update menjadi data valid/lebih lengkap

Namun untuk validasi operasional penuh, tetap lebih baik memakai FTP real untuk ANPR/AXLE.

## Evidence yang Sebaiknya Dicatat

Saat testing, simpan:

1. `session_id`
2. hasil query count sebelum dan sesudah payload tambahan
3. snapshot row ANPR sebelum dan sesudah update
4. snapshot row AXLE sebelum dan sesudah update
5. log watcher yang menunjukkan payload diproses

## Batasan Saat Ini

- proteksi duplicate utama masih ada di level aplikasi
- database belum memiliki unique partial index `session_id IS NOT NULL` untuk semua source
- jadi validasi ini memastikan code sudah comply, tetapi hard guard di DB masih sebaiknya ditambahkan di langkah berikutnya
