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

- Endpoint capture yang dipakai flow legacy belum menerima/meneruskan `session_id` ke model `Vehicle`.
- `POST /ws/wim/anpr-capture` secara nama dan pemakaian masih menggambarkan ANPR sebagai trigger, padahal target flow harus session-driven.

## Target Behavior Paralel

- Capture weighing harus bisa dipicu oleh session start/orchestration, bukan hanya dari ANPR handler.
- Endpoint capture untuk flow session wajib menerima `session_id` atau `sessionId`.
- Response capture harus mencantumkan session yang dipakai jika request membawa session.
- Jika WServer timeout atau tidak mengirim vehicle, hanya status weighing yang timeout/missing; session tetap lanjut untuk source lain.

## Disabled Query Endpoints

- `GET /ws/latest-vehicle`: repository saat ini mengembalikan null.
- `GET /ws/vehicles/{id}`: repository saat ini mengembalikan null.
- `GET /ws/vehicles`: repository saat ini mengembalikan empty list.
- `GET /ws/vehicles/stats`: repository saat ini mengembalikan zero stats.
- `GET /ws/vehicles/recid/{recid}`: repository saat ini mengembalikan null.

## Rules

- Capture endpoint harus selalu mengembalikan device ke static mode setelah capture atau timeout.
- `dummy=true` boleh dipakai untuk testing tanpa device.
- Query endpoint disabled harus diimplementasikan penuh atau dihapus dari daftar public endpoint.
- Nama endpoint baru sebaiknya netral terhadap source, misalnya session capture, supaya tidak mengikat weighing ke ANPR.
