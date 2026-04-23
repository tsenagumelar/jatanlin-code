# WB Feature: Capture Endpoints

## Source Area

- `Program.cs`
- `Services/DummyDeviceSimulator.cs`

## Endpoints

- `GET /`: service info dan daftar endpoint.
- `POST /ws/login?user=&pass=`: login manual ke WServer.
- `POST /ws/mode/static`: set static mode.
- `POST /ws/mode/wim?direction=LEFT|RIGHT`: set WIM dynamic mode.
- `GET /ws/msgs`: ambil recent raw `#MSG` ring buffer.
- `GET /ws/stream`: Server-Sent Events untuk raw `#MSG` dan `#RES` realtime.
- `POST /ws/wim/start`: validasi direction dan start WIM mode.
- `GET /ws/wim/data`: SSE khusus WIM mode dan vehicle result.
- `POST /ws/wim/stop`: stop WIM dan kembali static.
- `POST /ws/wim/capture`: start WIM, tunggu `OBJECT:VEHICLE`, parse vehicle, insert, stop static.
- `POST /ws/wim/capture-stream`: baca progress `MODE:5`, akumulasi axle weights dari `LASTWEIGHT`, hitung total, optional save.
- `POST /ws/wim/anpr-capture`: endpoint capture yang saat ini dipakai trigger legacy dari backend ANPR; set static, delay, start WIM, capture stream, optional save, dummy mode.
- `POST /ws/wim/insert-test`: insert weighing manual dengan axle1, axle2, totalWeight, optional siteId, dan direction.
- `POST /capture`: legacy/body-based capture untuk capture vehicle dan simpan.

## Current Gap

- `POST /ws/wim/anpr-capture` secara nama dan pemakaian masih menggambarkan ANPR sebagai trigger, padahal target flow harus session-driven.
- Default timeout di docs dan code masih banyak dicontohkan `45` detik, sehingga perlu ditegaskan bahwa angka tersebut adalah default request, bukan batas maksimal.
- Konfigurasi session-listener WB belum terdokumentasi penuh di docs runtime/env.

## Target Behavior Paralel

- Capture weighing harus bisa dipicu oleh listener session aktif dari database, bukan hanya dari ANPR handler.
- WB agent harus memonitor `transact_wim_session` untuk `status = 'IN_PROGRESS'` pada site yang sama.
- Saat session aktif terdeteksi, WB agent mulai tugas capture weighing untuk session tersebut.
- Jika session masih aktif, WB agent tidak boleh memulai capture kedua untuk `session_id` yang sama.
- Jika session selesai, WB agent berhenti mengaitkan capture baru ke session tersebut.
- Endpoint capture untuk flow session wajib menerima `session_id` atau `sessionId`.
- Response capture harus mencantumkan session yang dipakai jika request membawa session.
- Jika WServer timeout atau tidak mengirim vehicle, hanya status weighing yang timeout/missing; session tetap lanjut untuk source lain.
- Target flow session mengharuskan WB agent siap bekerja selama session aktif tanpa menunggu event ANPR.
- Timeout capture weighing default tetap boleh `45` detik, tetapi harus configurable per request/session policy.
- Timeout `60` detik valid dan didukung oleh code saat ini, selama request mengirim `timeoutSeconds=60`.

## Validasi Timeout dari Code dan Docs

- Code WB saat ini memakai pola `if (timeoutSeconds <= 0) timeoutSeconds = 45`, sehingga `45` detik adalah nilai default, bukan batas maksimal.
- Jalur code yang sudah tervalidasi:
  - `POST /ws/wim/capture`: `Program.cs` memakai `if (timeoutSeconds <= 0) timeoutSeconds = 45`
  - `POST /ws/wim/capture-stream`: `timeoutSeconds.GetValueOrDefault(45)`
  - `POST /ws/wim/anpr-capture`: `timeoutSeconds.GetValueOrDefault(45)`
  - `POST /capture`: `if (timeoutSeconds <= 0) timeoutSeconds = 45`
- Endpoint yang sudah mendukung timeout request saat ini:
  - `POST /ws/wim/capture`
  - `POST /ws/wim/capture-stream`
  - `POST /ws/wim/anpr-capture`
  - `POST /capture`
- Docs lokal WB juga sudah memberi contoh request `timeoutSeconds: 60`, sehingga timeout 1 menit konsisten dengan implementasi saat ini.
- Session listener WB memakai config/env `WB_CAPTURE_TIMEOUT_SEC`; nilai `60` harus diperlakukan sama validnya dengan request timeout `60`.

## Validasi dari Vendor PDF

- Vendor PDF `NAV19-005 - WAPI DLL EN v 2.5` menjelaskan bahwa WIM vehicle mode dimulai dengan `#REQ CMD:SETMODE DYNAV LEFT|RIGHT`.
- Selama WIM berjalan, progress dibaca dari `#MSG MODE:5 ... TIMEOUT:...`.
- Hasil timbang kendaraan dikirim sebagai `#MSG OBJECT:VEHICLE ... RECID ... DIR ... WEIGHT ... SPEED ... AXLECOUNT ...`.
- Terminasi WIM menurut vendor docs terjadi karena timeout berakhir atau mode dikembalikan ke static.
- Maka implementasi endpoint/service yang:
  - set `DYNAV`
  - menunggu `OBJECT:VEHICLE`
  - lalu set kembali `STAT`
  tetap sesuai dengan kontrak vendor docs.
- Perubahan orkestrasi di level aplikasi, misalnya trigger dari session database alih-alih trigger ANPR, tidak bertentangan dengan vendor docs selama protokol packet WSERVER tetap dipatuhi.

## Dummy Mode

- WB capture endpoint boleh mendukung mode dummy untuk development/testing.
- Jika dummy mode aktif, endpoint tetap harus menerima `session_id` dan menulis dummy data ke `transact_weighing` yang sama seperti mode real.
- Dummy response harus tetap mencantumkan session yang dipakai.
- Dummy insert WB harus idempotent per session/source atau per request key stabil.
- Jika dummy mode aktif, proses capture real ke device tidak boleh dijalankan untuk request tersebut.
- Untuk flow session-driven, dummy WB juga harus bisa berjalan otomatis dengan listener session aktif tanpa perlu trigger manual endpoint.
- Env runtime WB session listener:
  - `WB_SESSION_LISTENER_ENABLED=true|false`
  - `WB_DUMMY_ENABLED=true|false`
  - `WB_SESSION_INTERVAL_SEC`
  - `WB_CAPTURE_TIMEOUT_SEC`
  - `WB_CAPTURE_DIRECTION=LEFT|RIGHT`
  - `WB_LOCATION_CODE`
  - `WB_SITE_ID`

## Disabled Query Endpoints

- `GET /ws/latest-vehicle`: repository saat ini mengembalikan null.
- `GET /ws/vehicles/{id}`: repository saat ini mengembalikan null.
- `GET /ws/vehicles`: repository saat ini mengembalikan empty list.
- `GET /ws/vehicles/stats`: repository saat ini mengembalikan zero stats.
- `GET /ws/vehicles/recid/{recid}`: repository saat ini mengembalikan null.

## Rules

- Capture endpoint harus selalu mengembalikan device ke static mode setelah capture atau timeout.
- `dummy=true` boleh dipakai untuk testing tanpa device.
- `45` detik adalah default operasional, bukan hard limit.
- Jika kebutuhan lapangan memerlukan window lebih panjang, `timeoutSeconds=60` harus dianggap valid.
- Query endpoint disabled harus diimplementasikan penuh atau dihapus dari daftar public endpoint.
- Nama endpoint baru sebaiknya netral terhadap source, misalnya session capture, supaya tidak mengikat weighing ke ANPR.
