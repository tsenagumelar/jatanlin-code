# WB Feature: WServer Protocol

## Source Area

- `Services/WsClient.cs`
- `Services/ProtocolParser.cs`
- `Services/VehicleMessageParser.cs`
- `Models/MsgFrame.cs`
- `Models/ResFrame.cs`

## Behavior

- `WsClient` berjalan sebagai background reconnect loop.
- Koneksi menggunakan `TcpClient` ke `WServer:Host` dan `WServer:Port`.
- Saat connected dan `AutoLogin=true`, service melakukan `LOGIN` dengan credential config.
- Incoming bytes dikumpulkan dalam buffer dan diparse oleh `ProtocolParser.ParseFrames`.
- `#RES ... #ENDRES` diparse menjadi `ResFrame`.
- `#MSG ...` diparse menjadi `MsgFrame`.
- Recent `#MSG` disimpan dalam ring buffer memory maksimal 200 message.
- Command request dibangun sebagai `#REQ KEY:VALUE ...;\r\n`.
- Raw static mode command: `CMD:SETMODE STAT`.
- Raw WIM mode command: `CMD:SETMODE DYNAV <direction>`.

## Vehicle Parsing

- Vehicle hanya dianggap valid jika field `OBJECT` bernilai `VEHICLE`.
- Field utama: `RECID`, `TIME`, `DIR`, `WEIGHT`, `SPEED`, `RES`, `INFOTEXT`, `WS`, `AXLECOUNT`.
- Timestamp device format `yyyy-MM-dd HH:mm:ss` dan dikonversi ke UTC.
- Axle diparse dari blok berulang `AXLENO:` pada raw message.
- Axle fields: `AXLENO`, `WEIGHT`, `GWEIGHT`, `WHEEL1`, `WHEEL2`, `BASE`, `SPEED`.
- Parse error tidak throw ke caller; parser mengembalikan null agar invalid message bisa diskip.

## Rules

- Parser hanya boleh diubah dengan sample raw device message.
- Semua request WServer harus punya timeout.
- Jangan log credential WServer atau raw data sensitif.
