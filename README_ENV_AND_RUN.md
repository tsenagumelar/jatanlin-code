# Env Setup and Run Commands

Dokumen ini merangkum:

- nilai `.env` terkini untuk `jatanlin-web-apps` dan `jatanlin-backend-services`,
- command menjalankan service: `web`, `api`, `anpr`, `axle`, `cctv`, dan `wb-agent`.

## 1) Web `.env` (jatanlin-web-apps/.env)

```env
NEXT_PUBLIC_HASURA_URL=http://51.79.173.213:8080/v1/graphql
NEXT_PUBLIC_HASURA_WS=ws://hasura.activa.id/v1/graphql
NEXT_PUBLIC_HASURA_WS_IP=ws://51.79.173.213:8080/v1/graphql
NEXT_PUBLIC_HASURA_SECRET=devhasurasecret
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_ID=e1123daf-a4db-4ee1-88da-ba9bff382f45
NEXT_PUBLIC_SITE_CODE=MST-25-00001
NEXT_PUBLIC_SITE_NAME=Mampang
NEXT_PUBLIC_SITE_LOCATION=Central Office
NEXT_PUBLIC_SITE_REGION=Default
NEXT_PUBLIC_MINIO_URL=http://51.79.173.213:9000
NEXT_PUBLIC_DEVICE_CHECK_PROD_MODE=false
NEXT_PUBLIC_DEVICE_CHECK_TIMEOUT_MS=3000
NEXT_PUBLIC_ANPR_IP=51.79.173.213
NEXT_PUBLIC_AXLE_IP=51.79.173.213
NEXT_PUBLIC_WIM_IP=51.79.173.213
```

## 2) Backend `.env` (jatanlin-backend-services/.env)

```env
SITE_ID="e1123daf-a4db-4ee1-88da-ba9bff382f45"
SITE_CODE="MST-25-00001"
SITE_NAME="Mampang"
SITE_LOCATION="Central Office"
SITE_REGION="Default"

DATABASE_URL="postgres://jatanlin:SuperSecretPasswordBang123@51.79.173.213:5432/jatanlin?sslmode=disable"
CENTRAL_DATABASE_URL=""
SYNC_ENABLED=false

API_PORT=4000
JWT_SECRET="wim-secret-key-change-in-production-2024"
AUTH_ENABLED=false

CCTV_MODE="rtsp"
CCTV_RTSP_URL="rtsp://admin:P@ssw0rd@10.0.43.20:554/profile1"
ONVIF_ENDPOINT="http://10.0.43.20/onvif/device_service"
ONVIF_USERNAME="admin"
ONVIF_PASSWORD="P@ssw0rd"
ONVIF_PROFILE_TOKEN=""
ONVIF_TIMEOUT_SECONDS=15

RTSP_ENABLED=true
RTSP_URL="rtsp://admin:P@ssw0rd@10.0.43.20:554/profile1"
RECORD_SECONDS=20
RECORD_DIR="./recordings"
RECORD_ON_START=false
CCTV_HTTP_ENABLED=true
CCTV_HTTP_PORT=8090
CCTV_UPLOAD_PREFIX="cctv"
CCTV_TRIGGER_ENABLED=true
CCTV_TRIGGER_URL="http://localhost:8090/record"
CCTV_TRIGGER_SECONDS=20
CCTV_TRIGGER_DUMMY=true
CCTV_TRIGGER_FILENAME="e41ee755-20d4-4d51-885a-f3d4e8a6cf13-20260127_194341.mp4"
CCTV_TRIGGER_FILEPATH="attachment/e41ee755-20d4-4d51-885a-f3d4e8a6cf13-20260127_194341.mp4"

ANPR_FTP_HOST="51.79.173.213:21"
ANPR_FTP_USER="ftpuser"
ANPR_FTP_PASS="ftpsecret123"
ANPR_FTP_DIR="/ftp/ftpuser/anpr/"
ANPR_FTP_INTERVAL_SEC=5
ANPR_DUMMY_ENABLED=true

ANPR_MINIO_ENDPOINT="51.79.173.213:9000"
ANPR_MINIO_ACCESS_KEY="admin"
ANPR_MINIO_SECRET_KEY="admin12345"
ANPR_MINIO_BUCKET="anpr"
ANPR_MINIO_USE_SSL=false

AXLE_FTP_HOST="51.79.173.213:21"
AXLE_FTP_USER="ftpuser"
AXLE_FTP_PASS="ftpsecret123"
AXLE_FTP_DIR="/home/ftpuser/axle/"
AXLE_FTP_INTERVAL_SEC=5
AXLE_DUMMY_ENABLED=true

AXLE_MINIO_ENDPOINT="51.79.173.213:9000"
AXLE_MINIO_ACCESS_KEY="admin"
AXLE_MINIO_SECRET_KEY="admin12345"
AXLE_MINIO_BUCKET="axle"
AXLE_MINIO_USE_SSL=false

ATTACHMENT_MINIO_ENDPOINT="51.79.173.213:9000"
ATTACHMENT_MINIO_ACCESS_KEY="admin"
ATTACHMENT_MINIO_SECRET_KEY="admin12345"
ATTACHMENT_MINIO_BUCKET="attachment"
ATTACHMENT_MINIO_USE_SSL=false

DIMENSION_ENABLED=true
DIMENSION_DUMMY_ENABLED=true
DIMENSION_THRESHOLD=0.5
DIMENSION_PROFILE_NAME="anpr-empirical-profile"
DIMENSION_LENGTH_SCALE_M_PER_PX=0.009535
DIMENSION_WIDTH_SCALE_M_PER_PX=0.003522
DIMENSION_HEIGHT_SCALE_M_PER_PX=0.003603
DIMENSION_LENGTH_OFFSET_M=0.0
DIMENSION_WIDTH_OFFSET_M=0.0
DIMENSION_HEIGHT_OFFSET_M=0.0
DIMENSION_MIN_CONFIDENCE=0.45
DIMENSION_ENABLE_POSE_FILTER=true
DIMENSION_INSTALL_TOLERANCE_DISTANCE_PCT=5
DIMENSION_INSTALL_TOLERANCE_TILT_PCT=2
DIMENSION_INSTALL_TOLERANCE_HEIGHT_PCT=10
DIMENSION_MODEL_PATH=

CAMERA_IMAGE_WIDTH=2432
CAMERA_IMAGE_HEIGHT=2080
CAMERA_FOCAL_LENGTH=1000.0
CAMERA_HEIGHT_METERS=5.0
CAMERA_TILT_ANGLE=25.0
CAMERA_REF_PIXEL_LENGTH=960
CAMERA_REF_REAL_LENGTH=4.7
CAMERA_REF_DISTANCE=55.0

SESSION_WINDOW_SECONDS=600
NATS_URL="nats://51.79.173.213:4222"

WEIGHING_TRIGGER_URL="http://localhost:5000/ws/wim/anpr-capture"
WEIGHING_TRIGGER_DIRECTION="RIGHT"
WEIGHING_TRIGGER_TIMEOUT_SECONDS=60
WEIGHING_TRIGGER_SAVE=true
WEIGHING_TRIGGER_DUMMY=true
```

## 3) Command Menjalankan Service

Jalankan di terminal terpisah.

### A. Web

```bash
cd jatanlin-web-apps
npm install --legacy-peer-deps
npm run dev
```

### B. API

```bash
cd jatanlin-backend-services
SERVICE=api go run ./cmd/api
```

### C. ANPR Watcher

```bash
cd jatanlin-backend-services
SERVICE=anpr-watcher go run ./cmd/anpr-watcher
```

### D. AXLE Watcher

```bash
cd jatanlin-backend-services
SERVICE=axle-watcher go run ./cmd/axle-watcher
```

### E. CCTV Streamer

```bash
cd jatanlin-backend-services
SERVICE=cctv-streamer go run ./cmd/cctv-streamer
```

### F. WB Agent

```bash
cd jatanlin-wb-agent
ASPNETCORE_URLS=http://+:5000 \
DATABASE_URL="postgres://jatanlin:SuperSecretPasswordBang123@51.79.173.213:5432/jatanlin?sslmode=disable" \
NATS_URL="nats://51.79.173.213:4222" \
SITE_CODE="MST-25-00001" \
WB_SESSION_LISTENER_ENABLED=true \
WB_SESSION_INTERVAL_SEC=5 \
WB_CAPTURE_TIMEOUT_SEC=60 \
WB_CAPTURE_DIRECTION=RIGHT \
dotnet run
```

## 4) Cek Endpoint Dasar

```bash
curl -sS http://localhost:4000/health
curl -sS http://localhost:8090/health
curl -sS http://localhost:5000/
```
