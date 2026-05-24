#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# rollback.sh — Rollback jatanlin-web ke versi sebelumnya
#
# Cara pakai:
#   ./rollback.sh                      → tampilkan daftar versi & pilih interaktif
#   ./rollback.sh v20260519-abc1234    → langsung rollback ke tag tertentu
#   ./rollback.sh --list               → tampilkan daftar image + deploy log
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Konfigurasi (harus sama dengan deploy.sh) ─────────────────────────────────
SERVER_IP="51.79.173.213"
SERVER_USER="root"
SERVER_PORT_HOST="33000"
SERVER_PORT_CONTAINER="3000"
IMAGE_NAME="taufansena/jatanlin-web"
CONTAINER_NAME="jatanlin-web"
DEPLOY_LOG_PATH="/opt/jatanlin/deploy.log"

# ── Warna ─────────────────────────────────────────────────────────────────────
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

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        JATANLIN WEB — ROLLBACK SCRIPT                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── Fetch info dari server ────────────────────────────────────────────────────
info "Mengambil info dari server ${SERVER_IP}..."

SERVER_INFO=$(ssh "${SERVER_USER}@${SERVER_IP}" bash <<'REMOTE'
  IMAGE_NAME="taufansena/jatanlin-web"
  CONTAINER_NAME="jatanlin-web"
  DEPLOY_LOG_PATH="/opt/jatanlin/deploy.log"

  echo "=== CURRENT ==="
  CURRENT=$(docker inspect --format '{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
  STATUS=$(docker inspect --format '{{.State.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "not found")
  echo "${CURRENT}|${STATUS}"

  echo "=== IMAGES ==="
  docker images "${IMAGE_NAME}" --format "{{.Tag}}|{{.Size}}|{{.CreatedAt}}" \
    | grep -v "^latest|" \
    | sort -r

  echo "=== LOG ==="
  if [ -f "${DEPLOY_LOG_PATH}" ]; then
    tail -10 "${DEPLOY_LOG_PATH}"
  else
    echo "(log belum ada)"
  fi
REMOTE
)

# ── Parse output ──────────────────────────────────────────────────────────────
CURRENT_IMAGE=$(echo "$SERVER_INFO" | awk '/=== CURRENT ===/,/=== IMAGES ===/' | grep -v "===" | head -1)
CURRENT_TAG=$(echo "$CURRENT_IMAGE" | cut -d: -f2)
CURRENT_STATUS=$(echo "$CURRENT_IMAGE" | cut -d'|' -f2)

AVAILABLE_TAGS=$(echo "$SERVER_INFO" | awk '/=== IMAGES ===/,/=== LOG ===/' | grep -v "===")
DEPLOY_LOG=$(echo "$SERVER_INFO" | awk '/=== LOG ===/,0' | grep -v "===")

# ── Tampilkan status ──────────────────────────────────────────────────────────
echo -e "  ${BOLD}Container aktif :${NC} ${CONTAINER_NAME}"
echo -e "  ${BOLD}Image sekarang  :${NC} ${CURRENT_IMAGE%|*}"
echo -e "  ${BOLD}Status          :${NC} ${CURRENT_STATUS}"
echo ""

echo -e "${BOLD}${CYAN}Image tersedia di server:${NC}"
if [ -z "$AVAILABLE_TAGS" ]; then
  warn "Tidak ada image lain. Tidak dapat rollback."
  exit 1
fi

IDX=1
declare -a TAG_LIST
while IFS= read -r line; do
  TAG=$(echo "$line" | cut -d'|' -f1)
  SIZE=$(echo "$line" | cut -d'|' -f2)
  CREATED=$(echo "$line" | cut -d'|' -f3)
  IS_CURRENT=""
  [ "$TAG" = "$CURRENT_TAG" ] && IS_CURRENT=" ${GREEN}← AKTIF${NC}"
  echo -e "  ${BOLD}[$IDX]${NC} ${TAG}  (${SIZE})  ${CREATED}${IS_CURRENT}"
  TAG_LIST[$IDX]="$TAG"
  IDX=$((IDX+1))
done <<< "$AVAILABLE_TAGS"

echo ""
echo -e "${BOLD}${CYAN}Deploy log terakhir:${NC}"
echo "$DEPLOY_LOG" | while IFS= read -r line; do
  echo "  $line"
done

# ── Jika hanya --list, stop di sini ──────────────────────────────────────────
if [[ "${1:-}" == "--list" ]]; then
  echo ""
  exit 0
fi

# ── Tentukan target tag ───────────────────────────────────────────────────────
echo ""
TARGET_TAG="${1:-}"

if [ -z "$TARGET_TAG" ]; then
  # Interaktif: pilih dari list
  echo -ne "${BOLD}Pilih nomor versi untuk rollback (atau ketik tag langsung): ${NC}"
  read -r CHOICE

  if [[ "$CHOICE" =~ ^[0-9]+$ ]] && [ -n "${TAG_LIST[$CHOICE]+_}" ]; then
    TARGET_TAG="${TAG_LIST[$CHOICE]}"
  elif [ -n "$CHOICE" ]; then
    TARGET_TAG="$CHOICE"
  else
    error "Pilihan tidak valid"
  fi
fi

# ── Konfirmasi ────────────────────────────────────────────────────────────────
echo ""
warn "Akan rollback dari ${BOLD}${CURRENT_TAG}${NC}${YELLOW} → ${BOLD}${TARGET_TAG}${NC}"
echo -ne "${BOLD}Lanjutkan? (y/N): ${NC}"
read -r CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { info "Dibatalkan."; exit 0; }

# ── Eksekusi rollback di server ───────────────────────────────────────────────
info "Menjalankan rollback ke ${IMAGE_NAME}:${TARGET_TAG}..."

ssh "${SERVER_USER}@${SERVER_IP}" bash <<EOF
  set -e

  TARGET_IMAGE="${IMAGE_NAME}:${TARGET_TAG}"
  DEPLOY_LOG_PATH="${DEPLOY_LOG_PATH}"

  # Verifikasi image ada
  if ! docker image inspect "\${TARGET_IMAGE}" > /dev/null 2>&1; then
    echo "[SERVER] ❌ Image \${TARGET_IMAGE} tidak ditemukan di server"
    exit 1
  fi

  # Stop & remove container aktif
  OLD_IMAGE=\$(docker inspect --format '{{.Config.Image}}' "${CONTAINER_NAME}" 2>/dev/null || echo "none")
  echo "[SERVER] Menghentikan container: \${OLD_IMAGE}"
  docker stop "${CONTAINER_NAME}" 2>/dev/null || true
  docker rm "${CONTAINER_NAME}" 2>/dev/null || true

  # Jalankan dengan image lama
  echo "[SERVER] Menjalankan: \${TARGET_IMAGE}"
  docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    -p "${SERVER_PORT_HOST}:${SERVER_PORT_CONTAINER}" \
    "\${TARGET_IMAGE}"

  # Tunggu & cek status
  sleep 4
  STATUS=\$(docker inspect --format '{{.State.Status}}' "${CONTAINER_NAME}")
  if [ "\$STATUS" = "running" ]; then
    echo "[SERVER] ✅ Container berjalan — \${TARGET_IMAGE}"
  else
    echo "[SERVER] ❌ Gagal — Status: \$STATUS"
    docker logs --tail 30 "${CONTAINER_NAME}"
    exit 1
  fi

  # Update latest tag
  docker tag "\${TARGET_IMAGE}" "${IMAGE_NAME}:latest"

  # Tulis log
  mkdir -p "$(dirname ${DEPLOY_LOG_PATH})"
  echo "\$(date '+%Y-%m-%d %H:%M:%S') | ROLLBACK | ${TARGET_TAG} | prev: \${OLD_IMAGE}" >> "\${DEPLOY_LOG_PATH}"
EOF

# ── Health check ──────────────────────────────────────────────────────────────
info "Health check..."
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --connect-timeout 10 --max-time 15 \
  "http://${SERVER_IP}:${SERVER_PORT_HOST}/" 2>/dev/null || echo "000")

if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "307" || "$HTTP_STATUS" == "302" ]]; then
  success "Health check OK — HTTP ${HTTP_STATUS}"
else
  warn "Health check HTTP ${HTTP_STATUS}"
fi

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║             ROLLBACK BERHASIL ✅                     ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Versi aktif :${NC} ${TARGET_TAG}"
echo -e "  ${BOLD}URL Live    :${NC} http://${SERVER_IP}:${SERVER_PORT_HOST}/"
echo ""
echo -e "  ${BOLD}Logs        :${NC} ssh ${SERVER_USER}@${SERVER_IP} docker logs -f ${CONTAINER_NAME}"
echo ""
