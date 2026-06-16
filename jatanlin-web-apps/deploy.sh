#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Build, tag, transfer, dan deploy jatanlin-web ke server
#
# Cara pakai:
#   ./deploy.sh                     → deploy dengan tag otomatis (tanggal+git hash)
#   ./deploy.sh v20260520-66867c7   → deploy dengan tag tertentu (rebuild)
#
# Prasyarat: ssh-key sudah terdaftar di server (ssh-copy-id root@SERVER_IP)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Konfigurasi ──────────────────────────────────────────────────────────────
SERVER_IP="51.79.173.213"
SERVER_USER="root"
SERVER_PORT_HOST="33000"
SERVER_PORT_CONTAINER="3000"
IMAGE_NAME="taufansena/jatanlin-web"
CONTAINER_NAME="jatanlin-web"
ENV_FILE=".env.local"
DEPLOY_LOG_PATH="/opt/jatanlin/deploy.log"

# ── Warna output ─────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }
step()    { echo -e "\n${BOLD}${CYAN}▶ $*${NC}"; }

# ── Validasi env file ─────────────────────────────────────────────────────────
[ -f "$ENV_FILE" ] || error "File $ENV_FILE tidak ditemukan. Buat dari .env.example terlebih dahulu."

# ── Generate tag ─────────────────────────────────────────────────────────────
DATE_TAG=$(date +%Y%m%d)
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
VERSION_TAG="${1:-v${DATE_TAG}-${GIT_HASH}}"
FULL_IMAGE="${IMAGE_NAME}:${VERSION_TAG}"
LATEST_IMAGE="${IMAGE_NAME}:latest"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        JATANLIN WEB — DEPLOYMENT SCRIPT              ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
info "Server      : ${SERVER_USER}@${SERVER_IP}:${SERVER_PORT_HOST}"
info "Image       : ${FULL_IMAGE}"
info "Container   : ${CONTAINER_NAME}"
info "Env file    : ${ENV_FILE}"
echo ""

# ── Load env vars ─────────────────────────────────────────────────────────────
step "1/5 — Membaca env vars dari ${ENV_FILE}"
while IFS= read -r line || [[ -n "$line" ]]; do
  # Lewati baris komentar dan baris kosong
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line//[[:space:]]/}" ]] && continue
  # Export dengan aman (nilai bisa mengandung spasi)
  export "$line"
done < "$ENV_FILE"
success "Env vars dimuat"

# ── Build Docker image ────────────────────────────────────────────────────────
step "2/5 — Build Docker image: ${FULL_IMAGE}"
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_HASURA_URL="${NEXT_PUBLIC_HASURA_URL:-}" \
  --build-arg NEXT_PUBLIC_HASURA_WS="${NEXT_PUBLIC_HASURA_WS:-}" \
  --build-arg NEXT_PUBLIC_HASURA_WS_IP="${NEXT_PUBLIC_HASURA_WS_IP:-}" \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}" \
  --build-arg NEXT_PUBLIC_SITE_ID="${NEXT_PUBLIC_SITE_ID:-}" \
  --build-arg NEXT_PUBLIC_SITE_CODE="${NEXT_PUBLIC_SITE_CODE:-}" \
  --build-arg NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME:-}" \
  --build-arg NEXT_PUBLIC_SITE_LOCATION="${NEXT_PUBLIC_SITE_LOCATION:-}" \
  --build-arg NEXT_PUBLIC_SITE_REGION="${NEXT_PUBLIC_SITE_REGION:-}" \
  --build-arg NEXT_PUBLIC_MINIO_URL="${NEXT_PUBLIC_MINIO_URL:-}" \
  -t "${FULL_IMAGE}" \
  -t "${LATEST_IMAGE}" \
  .

success "Image berhasil dibuild: ${FULL_IMAGE}"

# ── Transfer ke server ────────────────────────────────────────────────────────
step "3/5 — Transfer image ke server (${SERVER_IP}) via SSH"
info "Menyimpan dan mengirim image... (proses ini bisa memakan beberapa menit)"

docker save "${FULL_IMAGE}" | gzip | \
  ssh "${SERVER_USER}@${SERVER_IP}" \
  "gunzip | docker load && docker tag ${FULL_IMAGE} ${LATEST_IMAGE}"

success "Image berhasil dikirim ke server"

# ── Deploy di server ──────────────────────────────────────────────────────────
step "4/5 — Deploy container di server"

ssh "${SERVER_USER}@${SERVER_IP}" bash <<EOF
  set -e

  echo "[SERVER] Image yang tersedia di server:"
  docker images ${IMAGE_NAME} --format "  • {{.Tag}}  ({{.Size}})  {{.CreatedAt}}"

  # Simpan info container lama (untuk referensi rollback)
  OLD_IMAGE=\$(docker inspect --format '{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
  echo "[SERVER] Container sebelumnya: \${OLD_IMAGE}"

  # Stop & remove container lama (jika ada)
  if docker ps -q -f name="^/${CONTAINER_NAME}$" | grep -q .; then
    echo "[SERVER] Menghentikan container lama..."
    docker stop "${CONTAINER_NAME}"
    docker rm "${CONTAINER_NAME}"
  elif docker ps -aq -f name="^/${CONTAINER_NAME}$" | grep -q .; then
    echo "[SERVER] Menghapus container yang sudah stop..."
    docker rm "${CONTAINER_NAME}"
  fi

  # Jalankan container baru
  echo "[SERVER] Menjalankan container baru: ${FULL_IMAGE}"
  docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    -p "${SERVER_PORT_HOST}:${SERVER_PORT_CONTAINER}" \
    "${FULL_IMAGE}"

  # Tunggu container ready
  echo "[SERVER] Menunggu container siap..."
  sleep 4

  # Cek status
  STATUS=\$(docker inspect --format '{{.State.Status}}' "${CONTAINER_NAME}")
  if [ "\$STATUS" = "running" ]; then
    echo "[SERVER] ✅ Container berjalan — Status: \$STATUS"
  else
    echo "[SERVER] ❌ Container tidak berjalan — Status: \$STATUS"
    docker logs --tail 30 "${CONTAINER_NAME}"
    exit 1
  fi

  # Tulis log deployment
  mkdir -p "$(dirname ${DEPLOY_LOG_PATH})"
  echo "\$(date '+%Y-%m-%d %H:%M:%S') | DEPLOY | ${VERSION_TAG} | prev: \${OLD_IMAGE}" >> "${DEPLOY_LOG_PATH}"

  # Bersihkan image lama (simpan 5 terbaru + latest)
  echo "[SERVER] Membersihkan image lama (simpan 5 terbaru)..."
  IMAGES_TO_REMOVE=\$(docker images "${IMAGE_NAME}" --format "{{.Tag}} {{.ID}}" \
    | grep -v "latest" \
    | sort -r \
    | tail -n +6 \
    | awk '{print \$2}' || true)
  if [ -n "\$IMAGES_TO_REMOVE" ]; then
    echo \$IMAGES_TO_REMOVE | xargs docker rmi -f 2>/dev/null || true
    echo "[SERVER] Image lama dihapus"
  else
    echo "[SERVER] Tidak ada image lama yang perlu dihapus"
  fi
EOF

# ── Health check ──────────────────────────────────────────────────────────────
step "5/5 — Health check"
info "Menguji koneksi ke http://${SERVER_IP}:${SERVER_PORT_HOST}/ ..."
sleep 3

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --connect-timeout 10 --max-time 15 \
  "http://${SERVER_IP}:${SERVER_PORT_HOST}/" 2>/dev/null || echo "000")

if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "307" || "$HTTP_STATUS" == "302" ]]; then
  success "Health check OK — HTTP ${HTTP_STATUS}"
else
  warn "Health check HTTP ${HTTP_STATUS} — cek logs dengan: ssh ${SERVER_USER}@${SERVER_IP} docker logs ${CONTAINER_NAME}"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║            DEPLOYMENT BERHASIL ✅                    ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Versi    :${NC} ${VERSION_TAG}"
echo -e "  ${BOLD}URL Live :${NC} http://${SERVER_IP}:${SERVER_PORT_HOST}/"
echo -e "  ${BOLD}Rollback :${NC} ./rollback.sh"
echo ""
echo -e "  ${BOLD}Logs     :${NC} ssh ${SERVER_USER}@${SERVER_IP} docker logs -f ${CONTAINER_NAME}"
echo ""
