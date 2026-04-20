# WIM Server API Documentation

API Server untuk integrasi dengan WIM (Weigh-In-Motion) device menggunakan protokol WServerAPI.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
  - [Control Endpoints](#control-endpoints)
  - [Data Capture Endpoints](#data-capture-endpoints)
  - [Query Endpoints](#query-endpoints)
- [Device Protocol](#device-protocol)
- [Examples](#examples)

---

## Overview

Server ini mengimplementasikan protokol WServerAPI berdasarkan **NAV19-005 - WAPI DLL EN v 2.5.pdf** untuk:
- Komunikasi real-time dengan WIM device
- Capture data kendaraan otomatis
- Penyimpanan ke database PostgreSQL
- REST API untuk integrasi sistem eksternal

### Tech Stack
- **.NET 8.0** - Runtime
- **ASP.NET Core** - Web Framework
- **Entity Framework Core** - ORM
- **PostgreSQL** - Database
- **WebSocket** - Device Communication

---

## Quick Start

### Prerequisites
```bash
# Install .NET 8 SDK
brew install dotnet@8

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15
```

### Configuration

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "VehicleDatabase": "Host=localhost;Port=5432;Database=wim_db;Username=postgres;Password=postgres"
  },
  "WServer": {
    "Host": "10.0.43.10",
    "Port": 65002,
    "AutoLogin": true,
    "Username": "admin",
    "Password": "admin",
    "ReconnectSeconds": 3
  }
}
```

### Run Application
```bash
# Build
dotnet build WServerApi.csproj

# Run
dotnet run --project WServerApi.csproj
```

Server akan running di: `http://localhost:5000`

---

## Database Setup

### Create Database
```sql
CREATE DATABASE wim_db;
```

### Run Schema Migration
```bash
# Apply schema dari file database/postgresql_schema.sql
psql -U postgres -d wim_db -f database/postgresql_schema.sql
```

### Database Schema

**Table: `transact_wim_vehicle`**
- `id` (UUID, PK) - Unique identifier
- `record_id` (integer) - RECID dari device
- `ws_code` (varchar) - Weighing system code
- `timestamp` (timestamptz) - Waktu penimbangan
- `direction` (varchar) - Arah kendaraan (Left/Right)
- `total_weight` (integer) - Total berat kendaraan (kg)
- `speed` (numeric) - Kecepatan (km/h)
- `axle_count` (integer) - Jumlah as
- `result_code` (integer) - Result code (0=OK)
- `info_text` (text) - Informasi tambahan
- `raw_message` (text) - Raw message untuk audit
- `location_code` (varchar) - Kode lokasi/gate
- `site_id` (uuid) - ID site
- Audit fields (is_active, is_deleted, created_date, dll)

**Table: `transact_wim_axle`**
- `id` (UUID, PK)
- `vehicle_id` (UUID, FK)
- `axle_number` (integer) - Nomor as (1, 2, 3, ...)
- `weight` (integer) - Berat as (kg)
- `gross_weight` (integer) - Berat kotor (kg)
- `wheel1_weight`, `wheel2_weight` (integer) - Berat per roda
- `wheelbase` (numeric) - Jarak ke as berikutnya (m)
- `speed` (numeric) - Kecepatan as (km/h)
- Audit fields

---

## API Endpoints

### Control Endpoints

#### 1. Login to WServer
```http
POST /ws/login?user=admin&pass=admin
```

**Response:**
```json
{
  "raw": "#RES RESULT:OK;#ENDRES",
  "result": "OK",
  "fields": { "RESULT": "OK" }
}
```

---

#### 2. Set Static Mode
```http
POST /ws/mode/static
```

Menghentikan WIM mode dan kembali ke static weighing.

**Response:**
```json
{
  "raw": "#RES RESULT:OK;#ENDRES",
  "result": "OK"
}
```

---

#### 3. Set WIM Mode
```http
POST /ws/mode/wim?direction=RIGHT
```

**Parameters:**
- `direction`: `LEFT` atau `RIGHT`

**Response:**
```json
{
  "raw": "#RES RESULT:OK;#ENDRES",
  "result": "OK"
}
```

---

### Data Capture Endpoints

#### 4. Auto Capture (Legacy - SQLite)
```http
POST /ws/wim/capture?direction=RIGHT&timeoutSeconds=45
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| direction | string | RIGHT | Arah kendaraan (LEFT/RIGHT) |
| timeoutSeconds | int | 45 | Timeout menunggu kendaraan |

**Flow:**
1. Start WIM mode
2. Tunggu kendaraan (max timeout)
3. Save ke database SQLite
4. Stop WIM mode
5. Return hasil

**Success Response:**
```json
{
  "success": true,
  "message": "Vehicle captured and saved successfully",
  "vehicle": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "recordId": 7,
    "timestamp": "2020-01-15T11:21:55Z",
    "direction": "Right",
    "totalWeight": 4140,
    "speed": 4.99,
    "resultCode": 0,
    "infoText": "",
    "axleCount": 2,
    "axles": [
      {
        "axleNumber": 1,
        "weight": 2760,
        "grossWeight": 2755,
        "wheel1Weight": 1378,
        "wheel2Weight": 1378,
        "wheelbase": 1.84,
        "speed": 4.82
      },
      {
        "axleNumber": 2,
        "weight": 1380,
        "grossWeight": 1377,
        "wheel1Weight": 688,
        "wheel2Weight": 688,
        "wheelbase": 0.00,
        "speed": 5.17
      }
    ]
  }
}
```

**Timeout Response:**
```json
{
  "success": false,
  "message": "No vehicle detected within 45 seconds timeout",
  "vehicle": null
}
```

---

#### 5. Capture to PostgreSQL ⭐ **RECOMMENDED**
```http
POST /capture
Content-Type: application/json
```

**Request Body:**
```json
{
  "direction": "Right",
  "timeoutSeconds": 45,
  "locationCode": "GATE-01",
  "siteId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Parameters:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| direction | string | No | Right | Arah kendaraan (Left/Right) |
| timeoutSeconds | integer | No | 45 | Timeout menunggu (detik) |
| locationCode | string | No | null | Kode lokasi/gate |
| siteId | string (UUID) | No | null | ID site/lokasi |

**Flow:**
1. ✅ Start WIM mode
2. ⏳ Tunggu device mengirim progress messages
3. 📡 Parse final vehicle data dengan `OBJECT:VEHICLE`
4. 💾 Simpan ke PostgreSQL dengan UUID
5. 🛑 Stop WIM mode
6. 📤 Return response

**Success Response:**
```json
{
  "success": true,
  "message": "Vehicle captured and saved successfully",
  "vehicle": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "recordId": 7,
    "timestamp": "2020-01-15T11:21:55Z",
    "direction": "Left",
    "totalWeight": 4140,
    "speed": 4.99,
    "resultCode": 0,
    "infoText": "",
    "axleCount": 2,
    "axles": [...]
  }
}
```

---

### Query Endpoints

#### 6. Get Latest Vehicle
```http
GET /ws/latest-vehicle
```

**Response:**
```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "recordId": 7,
  "timestamp": "2020-01-15T11:21:55Z",
  "direction": "Right",
  "totalWeight": 4140,
  "speed": 4.99,
  "resultCode": 0,
  "infoText": "",
  "axleCount": 2,
  "axles": [...]
}
```

---

#### 7. Get Vehicle by ID
```http
GET /ws/vehicles/{id:guid}
```

**Example:**
```bash
curl http://localhost:5000/ws/vehicles/7c9e6679-7425-40de-944b-e07fc1f90ae7
```

---

#### 8. Get Vehicle by Record ID
```http
GET /ws/vehicles/recid/{recid}
```

**Example:**
```bash
curl http://localhost:5000/ws/vehicles/recid/7
```

---

#### 9. List Vehicles (Paginated)
```http
GET /ws/vehicles?page=1&pageSize=20&successOnly=true
```

**Parameters:**
- `page`: Halaman (default: 1)
- `pageSize`: Items per halaman (default: 20)
- `successOnly`: Filter hanya yang sukses (default: false)

**Response:**
```json
{
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "vehicles": [
    {
      "id": "uuid...",
      "recordId": 10,
      "timestamp": "2020-01-15T11:21:55Z",
      "direction": "Right",
      "totalWeight": 4140,
      "axleCount": 2,
      "isSuccess": true
    }
  ]
}
```

---

#### 10. Get Statistics
```http
GET /ws/vehicles/stats
```

**Response:**
```json
{
  "totalVehicles": 150,
  "successfulWeighings": 145,
  "failedWeighings": 5,
  "firstRecordDate": "2020-01-15T08:00:00Z",
  "lastRecordDate": "2020-01-15T17:30:00Z",
  "totalWeightSum": 621000,
  "averageSpeed": 5.2
}
```

---

#### 11. Stream Real-time Messages
```http
GET /ws/stream
```

Server-Sent Events (SSE) untuk monitoring real-time.

**Example (Browser):**
```javascript
const eventSource = new EventSource('http://localhost:5000/ws/stream');
eventSource.onmessage = (event) => {
  console.log('Message:', event.data);
};
```

**Example (curl):**
```bash
curl -N http://localhost:5000/ws/stream
```

---

#### 12. Get Recent Messages
```http
GET /ws/msgs
```

Mendapatkan recent messages (ring buffer).

---

## Device Protocol

### Device Message Flow

#### 1. Progress Messages (Countdown)
Selama proses capture, device mengirim update progress setiap detik:

```
#MSG MODE:5;DISPLAY: DIR:1 AXLE:0 LOAD:0 OVERLOAD:0 LASTWEIGHT:0 TOTAL:0 TIMEOUT:45;
#MSG MODE:5;DISPLAY: DIR:1 AXLE:0 LOAD:0 OVERLOAD:0 LASTWEIGHT:0 TOTAL:0 TIMEOUT:44;
#MSG MODE:5;DISPLAY: DIR:1 AXLE:0 LOAD:0 OVERLOAD:0 LASTWEIGHT:0 TOTAL:0 TIMEOUT:43;
...
#MSG MODE:5;DISPLAY: DIR:1 AXLE:0 LOAD:0 OVERLOAD:0 LASTWEIGHT:0 TOTAL:0 TIMEOUT:1;
#MSG MODE:5;DISPLAY: DIR:1 AXLE:0 LOAD:0 OVERLOAD:0 LASTWEIGHT:0 TOTAL:0 TIMEOUT:0;
```

**Field Descriptions:**
- `MODE:5` - WIM mode
- `DIR` - Direction (0=Left, 1=Right)
- `AXLE` - Nomor as terdeteksi
- `LOAD` - Load status
- `OVERLOAD` - Overload status
- `LASTWEIGHT` - Berat as terakhir (kg)
- `TOTAL` - Total berat sejauh ini (kg)
- `TIMEOUT` - Countdown timeout (detik)

---

#### 2. Final Vehicle Data
Ketika kendaraan selesai ditimbang, device mengirim data lengkap:

```
#MSG OBJECT:VEHICLE RES:0 RECID:7 TIME:"2020-01-15 11:21:55" DIR:0
WEIGHT:4140 SPEED:4.99 INFOTEXT:"" WS:"0" AXLECOUNT:2 AXLENO:1
WEIGHT:2760 GWEIGHT:2755 WHEEL1:1378 WHEEL2:1378 BASE:1.84 SPEED:4.82
AXLENO:2 WEIGHT:1380 GWEIGHT:1377 WHEEL1:688 WHEEL2:688 BASE:0.00
SPEED:5.17;
```

**Vehicle Fields:**
- `OBJECT:VEHICLE` - Object type
- `RES` - Result code (0=OK, 1-49=operational errors, 50-99=hardware errors)
- `RECID` - Record ID
- `TIME` - Timestamp
- `DIR` - Direction (0=Left, 1=Right)
- `WEIGHT` - Total weight (kg)
- `SPEED` - Speed (km/h)
- `INFOTEXT` - Additional info/error text
- `WS` - Weighing system code
- `AXLECOUNT` - Number of axles

**Axle Fields (per axle):**
- `AXLENO` - Axle number (1, 2, 3, ...)
- `WEIGHT` - Axle weight rounded (kg)
- `GWEIGHT` - Gross weight unrounded (kg)
- `WHEEL1` - Left wheel weight (kg)
- `WHEEL2` - Right wheel weight (kg)
- `BASE` - Wheelbase to next axle (m), 0.00 for last axle
- `SPEED` - Axle speed (km/h)

---

### Result Codes

| Code | Description |
|------|-------------|
| 0 | OK - Penimbangan berhasil |
| 1-49 | Operational errors (kecepatan terlalu tinggi, dll) |
| 50-99 | Hardware/system errors |

---

## Examples

### Example 1: Simple Capture (Default Settings)
```bash
curl -X POST http://localhost:5000/capture \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Example 2: Capture dengan Lokasi
```bash
curl -X POST http://localhost:5000/capture \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "Left",
    "timeoutSeconds": 60,
    "locationCode": "GATE-A1",
    "siteId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Example 3: Quick Capture (30 detik)
```bash
curl -X POST http://localhost:5000/capture \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "Right",
    "timeoutSeconds": 30
  }'
```

### Example 4: Monitor Real-time (3 Terminal)

**Terminal 1 - Monitor Stream:**
```bash
curl -N http://localhost:5000/ws/stream
```

**Terminal 2 - Start Capture:**
```bash
curl -X POST http://localhost:5000/capture \
  -H "Content-Type: application/json" \
  -d '{"direction": "Right", "timeoutSeconds": 45}'
```

**Terminal 3 - Query Latest:**
```bash
curl http://localhost:5000/ws/latest-vehicle
```

### Example 5: JavaScript/Frontend Integration
```javascript
// Capture vehicle
async function captureVehicle() {
  const response = await fetch('http://localhost:5000/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      direction: 'Right',
      timeoutSeconds: 45,
      locationCode: 'GATE-01',
      siteId: '550e8400-e29b-41d4-a716-446655440000'
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Vehicle captured:', result.vehicle);
    console.log('Total Weight:', result.vehicle.totalWeight, 'kg');
    console.log('Speed:', result.vehicle.speed, 'km/h');
    console.log('Axles:', result.vehicle.axleCount);
  } else {
    console.log('No vehicle detected:', result.message);
  }
}

// Monitor real-time
const eventSource = new EventSource('http://localhost:5000/ws/stream');
eventSource.onmessage = (event) => {
  const msg = event.data;
  
  // Progress messages
  if (msg.includes('TIMEOUT:')) {
    const timeout = msg.match(/TIMEOUT:(\d+)/)?.[1];
    console.log('Waiting... Timeout:', timeout);
  }
  
  // Final vehicle data
  if (msg.includes('OBJECT:VEHICLE')) {
    console.log('Vehicle detected!', msg);
  }
};

// Get statistics
async function getStats() {
  const response = await fetch('http://localhost:5000/ws/vehicles/stats');
  const stats = await response.json();
  console.log('Statistics:', stats);
}

// List vehicles
async function listVehicles(page = 1) {
  const response = await fetch(
    `http://localhost:5000/ws/vehicles?page=${page}&pageSize=20&successOnly=true`
  );
  const data = await response.json();
  console.log('Vehicles:', data.vehicles);
  console.log('Total:', data.totalCount);
}
```

---

## Troubleshooting

### Connection Issues
```bash
# Check if WServer device is reachable
ping 10.0.43.10

# Check if port is open
nc -zv 10.0.43.10 65002
```

### Database Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Connect to database
psql -U postgres -d wim_db

# Check tables
\dt
```

### View Logs
```bash
# Application logs akan muncul di console
dotnet run --project WServerApi.csproj
```

---

## Notes

- **Auto-reconnect**: Server akan otomatis reconnect ke device jika koneksi terputus
- **Data Persistence**: Semua data tersimpan dengan UUID sebagai primary key
- **Timezone**: Timestamp dikonversi ke UTC
- **Audit Trail**: Raw message disimpan untuk keperluan audit
- **Concurrent Captures**: Hindari multiple capture bersamaan, gunakan queue system
- **Timeout**: Default 45 detik, bisa disesuaikan per request

---

## License

Internal use only - Jatanlin Project

---

## Support

Untuk pertanyaan dan dukungan, hubungi tim development.
