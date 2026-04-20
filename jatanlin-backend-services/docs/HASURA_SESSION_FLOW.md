# WIM Session Management via Hasura

## Overview

Session management untuk WIM service dikelola sepenuhnya melalui **Hasura GraphQL**. Backend service hanya membaca status session dan memproses data ANPR berdasarkan session yang aktif.

## Architecture

```
Frontend (Web)
    ↓
Hasura GraphQL
    ↓
PostgreSQL (transact_wim_session table)
    ↓
WIM Backend Service (Read-only untuk session)
```

### Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **Frontend** | UI untuk start/stop session, display status |
| **Hasura** | CRUD operations pada transact_wim_session |
| **Backend Service** | Read session status, process ANPR data |
| **PostgreSQL** | Single source of truth untuk session data |

## Session Lifecycle

### 1. Create Session (via Hasura)

Frontend calls Hasura mutation:

```graphql
mutation CreateSession {
  insert_transact_wim_session_one(object: {
    site_id: "uuid-of-site"
    session_name: "Morning Shift"
    status: "STARTED"
    notes: "Session pagi shift 1"
  }) {
    id
    code
    started_at
    status
  }
}
```

**Response:**
```json
{
  "data": {
    "insert_transact_wim_session_one": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "WIM-2025-0001",
      "started_at": "2025-01-03T08:00:00+07:00",
      "status": "STARTED"
    }
  }
}
```

### 2. Start Processing (Update to IN_PROGRESS)

Frontend updates session status via Hasura:

```graphql
mutation StartSession($id: uuid!) {
  update_transact_wim_session_by_pk(
    pk_columns: { id: $id }
    _set: { status: "IN_PROGRESS" }
  ) {
    id
    code
    status
    started_at
  }
}
```

**Variables:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

⚠️ **IMPORTANT**: ANPR listener hanya memproses data ketika status = `IN_PROGRESS`

### 3. ANPR Processing (Automatic)

Backend service:
1. ✅ Detects session with status `IN_PROGRESS`
2. ✅ Collects all ANPR files within time window (20 seconds from `started_at`)
3. ✅ Deduplicates by plate number (keep highest confidence)
4. ✅ Inserts to database with `session_id`

**Backend logs:**
```log
[ANPR] Active session found: WIM-2025-0001 (Window: 20s)
[ANPR_BATCH] Collecting files from session window...
[ANPR_BATCH] After deduplication: 5 unique plates
[ANPR_BATCH] Session WIM-2025-0001: Processed 5 unique plates
```

### 4. Complete Session (via Hasura)

Frontend completes session when done:

```graphql
mutation CompleteSession($id: uuid!) {
  update_transact_wim_session_by_pk(
    pk_columns: { id: $id }
    _set: {
      status: "COMPLETED"
      ended_at: "now()"
    }
  ) {
    id
    code
    status
    started_at
    ended_at
  }
}
```

## Session Status Flow

```
STARTED
  ↓ (Frontend: Click "Mulai Proses")
IN_PROGRESS
  ↓ (Backend: Process ANPR data)
  ↓ (Frontend: Click "Selesai")
COMPLETED
```

**Status Values:**
- `STARTED` - Session dibuat, belum diproses
- `IN_PROGRESS` - Sedang memproses data (ANPR listener aktif)
- `COMPLETED` - Session selesai
- `CANCELLED` - Session dibatalkan
- `ERROR` - Session error

## Time Window Configuration

**Environment Variable:**
```bash
SESSION_WINDOW_SECONDS=60  # Default: 60 detik
```

**Window Calculation:**
```
Window Start: session.started_at
Window End: session.started_at + SESSION_WINDOW_SECONDS

Example:
Started: 08:00:00
Window: 20 seconds
End: 08:00:20

Files with captured_at between 08:00:00 - 08:00:20 akan diproses
```

## Hasura Queries

### Get Active Session

```graphql
query GetActiveSession($site_id: uuid!) {
  transact_wim_session(
    where: {
      site_id: { _eq: $site_id }
      status: { _in: ["STARTED", "IN_PROGRESS"] }
      is_deleted: { _eq: false }
    }
    order_by: { started_at: desc }
    limit: 1
  ) {
    id
    code
    session_name
    status
    started_at
    ended_at
    total_vehicles
    processed_vehicles
  }
}
```

### Get Session with ANPR Data

```graphql
query GetSessionWithData($session_id: uuid!) {
  transact_wim_session_by_pk(id: $session_id) {
    id
    code
    session_name
    started_at
    ended_at
    status

    # Related ANPR captures
    anpr_captures: transact_anpr_capture(
      where: { session_id: { _eq: $session_id } }
    ) {
      id
      plate_no
      confidence
      captured_at
      minio_full_image_object
    }

    # Aggregate
    anpr_captures_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

### List All Sessions

```graphql
query ListSessions($site_id: uuid!, $limit: Int = 20) {
  transact_wim_session(
    where: {
      site_id: { _eq: $site_id }
      is_deleted: { _eq: false }
    }
    order_by: { started_at: desc }
    limit: $limit
  ) {
    id
    code
    session_name
    status
    started_at
    ended_at
    anpr_captures_aggregate {
      aggregate {
        count
      }
    }
  }
}
```

## Frontend Integration Example

### React/Vue Component

```javascript
// 1. Create new session
const createSession = async () => {
  const mutation = `
    mutation CreateSession($site_id: uuid!, $session_name: String) {
      insert_transact_wim_session_one(object: {
        site_id: $site_id
        session_name: $session_name
        status: "STARTED"
      }) {
        id
        code
        started_at
      }
    }
  `;

  const response = await hasuraClient.request(mutation, {
    site_id: currentSiteId,
    session_name: `Session ${new Date().toLocaleString()}`
  });

  return response.insert_transact_wim_session_one;
};

// 2. Start processing (IN_PROGRESS)
const startProcessing = async (sessionId) => {
  const mutation = `
    mutation StartSession($id: uuid!) {
      update_transact_wim_session_by_pk(
        pk_columns: { id: $id }
        _set: { status: "IN_PROGRESS" }
      ) {
        id
        status
      }
    }
  `;

  await hasuraClient.request(mutation, { id: sessionId });

  console.log('ANPR listener will now process data for this session');
};

// 3. Complete session
const completeSession = async (sessionId) => {
  const mutation = `
    mutation CompleteSession($id: uuid!) {
      update_transact_wim_session_by_pk(
        pk_columns: { id: $id }
        _set: {
          status: "COMPLETED"
          ended_at: "now()"
        }
      ) {
        id
        status
        ended_at
      }
    }
  `;

  await hasuraClient.request(mutation, { id: sessionId });
};

// 4. Check active session on page load
const checkActiveSession = async (siteId) => {
  const query = `
    query GetActiveSession($site_id: uuid!) {
      transact_wim_session(
        where: {
          site_id: { _eq: $site_id }
          status: { _in: ["STARTED", "IN_PROGRESS"] }
          is_deleted: { _eq: false }
        }
        order_by: { started_at: desc }
        limit: 1
      ) {
        id
        code
        status
        started_at
      }
    }
  `;

  const response = await hasuraClient.request(query, { site_id: siteId });
  return response.transact_wim_session[0] || null;
};
```

### Full Workflow

```javascript
// Component lifecycle
async function initializeWIMSession() {
  // 1. Check if there's an active session
  const activeSession = await checkActiveSession(siteId);

  if (activeSession) {
    console.log('Resuming active session:', activeSession.code);
    setCurrentSession(activeSession);
    return;
  }

  // 2. No active session, create new one
  const newSession = await createSession();
  console.log('Created new session:', newSession.code);
  setCurrentSession(newSession);
}

async function handleStartButton() {
  if (!currentSession) {
    alert('No session created');
    return;
  }

  // Update status to IN_PROGRESS
  await startProcessing(currentSession.id);

  console.log('Session started! ANPR listener will process data for 20 seconds');

  // Optional: Auto-complete after window
  setTimeout(async () => {
    await completeSession(currentSession.id);
    console.log('Session auto-completed after window');
  }, 20000); // 20 seconds
}
```

## Hasura Permissions

### Insert Permission (for creating sessions)

```json
{
  "role": "user",
  "permission": {
    "check": {
      "site": {
        "site_users": {
          "user_id": {
            "_eq": "X-Hasura-User-Id"
          }
        }
      }
    },
    "columns": [
      "site_id",
      "session_name",
      "status",
      "notes"
    ]
  }
}
```

### Update Permission (for status changes)

```json
{
  "role": "user",
  "permission": {
    "filter": {
      "_and": [
        {
          "site": {
            "site_users": {
              "user_id": {
                "_eq": "X-Hasura-User-Id"
              }
            }
          }
        },
        {
          "is_deleted": {
            "_eq": false
          }
        }
      ]
    },
    "columns": [
      "status",
      "session_name",
      "ended_at",
      "notes"
    ]
  }
}
```

### Select Permission (for viewing sessions)

```json
{
  "role": "user",
  "permission": {
    "filter": {
      "site": {
        "site_users": {
          "user_id": {
            "_eq": "X-Hasura-User-Id"
          }
        }
      }
    },
    "columns": "*",
    "limit": 100
  }
}
```

## Backend Service Behavior

### Read-Only Operations

Backend service ONLY performs:
- ✅ `SELECT` queries to check active session
- ✅ `INSERT` ANPR data with `session_id`
- ❌ NO `UPDATE` on session table
- ❌ NO `DELETE` on session table
- ❌ NO auto-complete logic

### Session Detection

```go
// Internal: SessionService.GetActiveSession()
query := `
  SELECT id, code, site_id, started_at, ended_at, status
  FROM transact_wim_session
  WHERE site_id = $1
    AND status = 'IN_PROGRESS'
    AND is_active = true
    AND is_deleted = false
  ORDER BY started_at DESC
  LIMIT 1
`
```

If no session found → Skip ANPR processing
If session found → Collect and process batch

## Monitoring & Debugging

### Check Current Session Status

```sql
SELECT
    code,
    status,
    started_at,
    ended_at,
    started_at + INTERVAL '20 seconds' as window_end,
    NOW() as current_time,
    CASE
        WHEN status = 'IN_PROGRESS' THEN 'PROCESSING'
        WHEN status = 'COMPLETED' THEN 'DONE'
        ELSE 'WAITING'
    END as processing_status
FROM transact_wim_session
WHERE is_deleted = false
ORDER BY started_at DESC
LIMIT 5;
```

### Count Processed Data per Session

```sql
SELECT
    s.code as session_code,
    s.status,
    COUNT(DISTINCT a.plate_no) as unique_plates,
    COUNT(a.id) as total_captures,
    s.started_at,
    s.ended_at
FROM transact_wim_session s
LEFT JOIN transact_anpr_capture a ON s.id = a.session_id
WHERE s.is_deleted = false
GROUP BY s.id, s.code, s.status, s.started_at, s.ended_at
ORDER BY s.started_at DESC
LIMIT 10;
```

### Find Files Outside Window

```sql
SELECT
    a.plate_no,
    a.captured_at,
    s.started_at as session_start,
    s.started_at + INTERVAL '20 seconds' as window_end,
    CASE
        WHEN a.captured_at < s.started_at THEN 'BEFORE WINDOW'
        WHEN a.captured_at > s.started_at + INTERVAL '20 seconds' THEN 'AFTER WINDOW'
        ELSE 'IN WINDOW'
    END as window_status
FROM transact_anpr_capture a
INNER JOIN transact_wim_session s ON a.session_id = s.id
WHERE s.code = 'WIM-2025-0001'
ORDER BY a.captured_at;
```

## Troubleshooting

### Problem: ANPR not processing

**Check:**
1. Is there a session with status `IN_PROGRESS`?
   ```graphql
   query {
     transact_wim_session(
       where: { status: { _eq: "IN_PROGRESS" } }
     ) { id code status }
   }
   ```

2. Backend logs showing session detected?
   ```log
   [ANPR] Active session found: WIM-2025-0001 (Window: 20s)
   ```

### Problem: Files not in database

**Check:**
1. File `captured_at` within window?
2. Session still `IN_PROGRESS`?
3. Backend logs for errors?

### Problem: Duplicate plates

Should not happen due to deduplication logic, but check:

```sql
SELECT plate_no, COUNT(*)
FROM transact_anpr_capture
WHERE session_id = 'your-session-uuid'
GROUP BY plate_no
HAVING COUNT(*) > 1;
```

---

**Last Updated:** 2025-01-03
**Version:** 2.0.0 (Hasura-based)
