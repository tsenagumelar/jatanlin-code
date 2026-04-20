# WIM Session API Documentation

## Overview
WIM Session API menyediakan endpoint untuk mengelola session proses WIM (Weigh In Motion). Session digunakan untuk tracking proses penimbangan kendaraan dari awal hingga selesai.

## Base URL
```
http://localhost:4000/api/wim/session
```

## Authentication
Semua endpoint memerlukan JWT token dalam header Authorization (kecuali jika auth disabled).

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Start WIM Session

Memulai session WIM baru.

**Endpoint:** `POST /api/wim/session/start`

**Request Body:**
```json
{
  "site_code": "MST-25-00001",
  "session_name": "Session Pagi 03 Jan 2025",
  "notes": "Session penimbangan shift pagi"
}
```

**Request Fields:**
- `site_code` (required): Kode site dari tabel master_site
- `session_name` (optional): Nama custom untuk session
- `notes` (optional): Catatan tambahan

**Response Success (201):**
```json
{
  "success": true,
  "message": "WIM session started successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "WIM-2025-0001",
    "session_name": "Session Pagi 03 Jan 2025",
    "site_id": "123e4567-e89b-12d3-a456-426614174000",
    "site_code": "MST-25-00001",
    "site_name": "Mampang",
    "started_at": "2025-01-03T08:00:00Z",
    "status": "STARTED",
    "notes": "Session penimbangan shift pagi"
  }
}
```

**Response Error (404 - Site Not Found):**
```json
{
  "success": false,
  "message": "Site not found or inactive"
}
```

**Response Error (500 - Internal Error):**
```json
{
  "success": false,
  "message": "Failed to create session"
}
```

---

### 2. Get Active Session

Mendapatkan informasi session yang sedang aktif untuk site tertentu.

**Endpoint:** `GET /api/wim/session/active`

**Query Parameters:**
- `site_code` (required): Kode site

**Example:**
```
GET /api/wim/session/active?site_code=MST-25-00001
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Active session found",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "WIM-2025-0001",
    "session_name": "Session Pagi 03 Jan 2025",
    "site_id": "123e4567-e89b-12d3-a456-426614174000",
    "site_code": "MST-25-00001",
    "site_name": "Mampang",
    "started_at": "2025-01-03T08:00:00Z",
    "status": "STARTED",
    "notes": "Session penimbangan shift pagi"
  }
}
```

**Response Error (404 - No Active Session):**
```json
{
  "success": false,
  "message": "No active session found for this site"
}
```

**Response Error (400 - Missing Parameter):**
```json
{
  "success": false,
  "message": "site_code is required"
}
```

---

### 3. End Session

Mengakhiri session WIM yang sedang aktif.

**Endpoint:** `POST /api/wim/session/end`

**Request Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Session selesai, total 25 kendaraan diproses"
}
```

**Request Fields:**
- `session_id` (required): UUID dari session yang akan diakhiri
- `notes` (optional): Catatan tambahan saat mengakhiri session

**Response Success (200):**
```json
{
  "success": true,
  "message": "Session ended successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "WIM-2025-0001",
    "status": "COMPLETED"
  }
}
```

**Response Error (404 - Session Not Found):**
```json
{
  "success": false,
  "message": "Session not found or already ended"
}
```

**Response Error (400 - Invalid Session ID):**
```json
{
  "success": false,
  "message": "Invalid session ID"
}
```

---

## Session Status

| Status | Deskripsi |
|--------|-----------|
| STARTED | Session baru dibuat, siap menerima data |
| IN_PROGRESS | Session sedang berjalan, ada data yang sedang diproses |
| COMPLETED | Session selesai normal |
| CANCELLED | Session dibatalkan |
| ERROR | Session mengalami error |

---

## Database Schema

### transact_wim_session

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | varchar(50) | Unique session code (auto-generated: WIM-YYYY-NNNN) |
| session_name | varchar(200) | Optional custom session name |
| site_id | uuid | Foreign key to master_site |
| started_at | timestamptz | Timestamp when session started |
| ended_at | timestamptz | Timestamp when session ended (nullable) |
| status | varchar(50) | Session status |
| total_vehicles | int4 | Total vehicles expected |
| processed_vehicles | int4 | Vehicles processed so far |
| notes | text | Additional notes |
| started_by | uuid | User who started the session |
| ended_by | uuid | User who ended the session |

### Related Tables with session_id

Session ID ditambahkan ke tabel-tabel berikut:
- `transact_anpr_capture.session_id`
- `transact_axle_capture.session_id`
- `transact_dimension.session_id`
- `transact_weighing.session_id`
- `transact_vehicle_matched.session_id` (jika ada)

---

## Usage Example

### Frontend Flow

```javascript
// 1. Start session when user clicks "Mulai Penimbangan"
const startSession = async () => {
  const response = await fetch('http://localhost:4000/api/wim/session/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      site_code: 'MST-25-00001',
      session_name: 'Session Pagi',
      notes: 'Shift pagi hari ini'
    })
  });

  const result = await response.json();
  if (result.success) {
    // Save session_id to local state
    sessionStorage.setItem('active_session_id', result.data.id);
    sessionStorage.setItem('active_session_code', result.data.code);
  }
};

// 2. Check for active session on page load
const checkActiveSession = async () => {
  const response = await fetch(
    'http://localhost:4000/api/wim/session/active?site_code=MST-25-00001',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const result = await response.json();
  if (result.success) {
    // Restore active session
    sessionStorage.setItem('active_session_id', result.data.id);
    sessionStorage.setItem('active_session_code', result.data.code);
    return result.data;
  }
  return null;
};

// 3. End session when user clicks "Selesai"
const endSession = async (sessionId) => {
  const response = await fetch('http://localhost:4000/api/wim/session/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      notes: 'Session selesai'
    })
  });

  const result = await response.json();
  if (result.success) {
    sessionStorage.removeItem('active_session_id');
    sessionStorage.removeItem('active_session_code');
  }
};
```

---

## Notes

1. **Session Code Format:** WIM-YYYY-NNNN (contoh: WIM-2025-0001)
   - Auto-generated oleh database trigger
   - Sequential per tahun

2. **Active Session:** Hanya satu session yang bisa aktif per site
   - Status STARTED atau IN_PROGRESS dianggap aktif
   - Frontend harus check active session saat load

3. **Session Tracking:**
   - Semua data ANPR, Axle, Dimension, Weighing yang diproses akan dikaitkan dengan session_id
   - Berguna untuk laporan dan audit trail

4. **User Tracking:**
   - `started_by` dan `ended_by` otomatis terisi dari JWT token
   - Jika auth disabled, field ini akan NULL

---

## Testing with cURL

```bash
# 1. Start Session
curl -X POST http://localhost:4000/api/wim/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "site_code": "MST-25-00001",
    "session_name": "Test Session",
    "notes": "Testing session API"
  }'

# 2. Get Active Session
curl http://localhost:4000/api/wim/session/active?site_code=MST-25-00001

# 3. End Session
curl -X POST http://localhost:4000/api/wim/session/end \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "notes": "Session completed"
  }'
```
