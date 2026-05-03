#!/usr/bin/env bash
# ============================================================
# Zahir and Batin — BigCapital Backup Script
# ============================================================
#
# What this script does:
#   1. Dumps the MariaDB database to a timestamped .sql.gz file
#   2. Mirrors MinIO attachments to the backup target
#   3. Deletes backups older than BACKUP_RETAIN_DAYS
#   4. Logs all activity with timestamps
#
# Setup (run once):
#   chmod +x /opt/zb-bigcapital/docker/backup/backup.sh
#   crontab -e
#   # Add: 0 2 * * * /opt/zb-bigcapital/docker/backup/backup.sh >> /var/log/zb-backup.log 2>&1
#
# Manual run:
#   /opt/zb-bigcapital/docker/backup/backup.sh
#
# Requirements:
#   - Docker running with zb-mysql and zb-minio containers
#   - BACKUP_TARGET_PATH set in your .env file (or exported in environment)
#   - TrueNAS share mounted at BACKUP_TARGET_PATH (or use any local path)
# ============================================================

set -euo pipefail

# ── Load configuration ─────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# PROJECT_DIR resolves to /opt/zb-bigcapital when the repo is cloned there
ENV_FILE="${PROJECT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  # Load .env using set -a / source so quoted values with spaces are handled correctly.
  # This is safer than the xargs approach which breaks on values like "Zahir and Batin".
  set -a
  # shellcheck source=/dev/null
  source "${ENV_FILE}"
  set +a
fi

# ── Configuration with fallback defaults ───────────────────
BACKUP_TARGET_PATH="${BACKUP_TARGET_PATH:-/tmp/zb-backups}"
BACKUP_RETAIN_DAYS="${BACKUP_RETAIN_DAYS:-30}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-zb-minio-admin}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-}"
MINIO_BUCKET="${MINIO_BUCKET:-zb-attachments}"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"

# ── Logging helpers ────────────────────────────────────────
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

# ── Validate requirements ──────────────────────────────────
log "=== Zahir and Batin — BigCapital Backup Starting ==="
log "Backup target: ${BACKUP_TARGET_PATH}"
log "Retain days:   ${BACKUP_RETAIN_DAYS}"

if [[ -z "${DB_ROOT_PASSWORD}" ]]; then
  error "DB_ROOT_PASSWORD is not set. Check your .env file."
  exit 1
fi

if [[ -z "${MINIO_ROOT_PASSWORD}" ]]; then
  error "MINIO_ROOT_PASSWORD is not set. Check your .env file."
  exit 1
fi

# ── Create backup directories ──────────────────────────────
DB_BACKUP_DIR="${BACKUP_TARGET_PATH}/database"
MINIO_BACKUP_DIR="${BACKUP_TARGET_PATH}/attachments"

mkdir -p "${DB_BACKUP_DIR}"
mkdir -p "${MINIO_BACKUP_DIR}"

log "Backup directories ready."

# ── Step 1: Database backup ────────────────────────────────
log "--- Step 1: Backing up MariaDB database ---"

DB_BACKUP_FILE="${DB_BACKUP_DIR}/zb-database-${TIMESTAMP}.sql.gz"

# Check that the MySQL container is running
if ! docker ps --format '{{.Names}}' | grep -q '^zb-mysql$'; then
  error "zb-mysql container is not running. Cannot back up database."
  exit 1
fi

# Dump all databases and compress immediately.
# Using 'if command; then' pattern so set -e does not exit before we can handle the error.
# 2>&1 is piped through grep to suppress only the password warning, not real errors.
if docker exec zb-mysql mysqldump \
    --user=root \
    --password="${DB_ROOT_PASSWORD}" \
    --all-databases \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    2>&1 \
  | grep -v "Warning: Using a password on the command line" \
  | gzip > "${DB_BACKUP_FILE}"; then

  # Verify the backup file is not empty
  if [[ ! -s "${DB_BACKUP_FILE}" ]]; then
    error "Backup file is empty — mysqldump may have failed silently."
    rm -f "${DB_BACKUP_FILE}"
    exit 1
  fi

  DB_SIZE="$(du -sh "${DB_BACKUP_FILE}" | cut -f1)"
  log "Database backup complete: ${DB_BACKUP_FILE} (${DB_SIZE})"
else
  error "Database backup FAILED. Check that zb-mysql is running and the password is correct."
  rm -f "${DB_BACKUP_FILE}"
  exit 1
fi

# ── Step 2: MinIO attachments backup ──────────────────────
log "--- Step 2: Backing up MinIO attachments ---"

# Check that the MinIO container is running
if ! docker ps --format '{{.Names}}' | grep -q '^zb-minio$'; then
  log "WARNING: zb-minio container is not running. Skipping attachments backup."
else
  # Use the MinIO client (mc) in a temporary container to mirror files to local disk.
  # 'if command; then' prevents set -e from exiting on failure so we can log the error.
  if docker run --rm \
      --network zb_network \
      -v "${MINIO_BACKUP_DIR}:/backup" \
      --entrypoint /bin/sh \
      minio/mc:latest \
      -c "
        mc alias set zb http://minio:9000 '${MINIO_ROOT_USER}' '${MINIO_ROOT_PASSWORD}' --quiet &&
        mc mirror zb/${MINIO_BUCKET} /backup/${MINIO_BUCKET}/ --overwrite --quiet
      "; then

    MINIO_COUNT="$(find "${MINIO_BACKUP_DIR}" -type f | wc -l)"
    log "Attachments backup complete: ${MINIO_COUNT} files in ${MINIO_BACKUP_DIR}"
  else
    error "MinIO backup FAILED. Check MinIO is running and credentials are correct."
    error "Database backup already succeeded — financial data is safe."
    # Do not exit — database backup completed. Log the failure and continue to cleanup.
  fi
fi

# ── Step 3: Remove old backups ─────────────────────────────
log "--- Step 3: Removing backups older than ${BACKUP_RETAIN_DAYS} days ---"

# Validate BACKUP_RETAIN_DAYS is a positive integer before passing to find
if ! [[ "${BACKUP_RETAIN_DAYS}" =~ ^[0-9]+$ ]]; then
  error "BACKUP_RETAIN_DAYS is not a valid number: '${BACKUP_RETAIN_DAYS}'. Skipping cleanup."
else
  OLD_DB_COUNT="$(find "${DB_BACKUP_DIR}" -name "*.sql.gz" -mtime +"${BACKUP_RETAIN_DAYS}" | wc -l)"

  if [[ "${OLD_DB_COUNT}" -gt 0 ]]; then
    find "${DB_BACKUP_DIR}" -name "*.sql.gz" -mtime +"${BACKUP_RETAIN_DAYS}" -delete
    log "Removed ${OLD_DB_COUNT} old database backup(s)."
  else
    log "No old backups to remove."
  fi
fi

# ── Summary ────────────────────────────────────────────────
REMAINING_BACKUPS="$(find "${DB_BACKUP_DIR}" -name "*.sql.gz" | wc -l)"
log "=== Backup Complete ==="
log "Database file:  ${DB_BACKUP_FILE}"
log "Attachments:    ${MINIO_BACKUP_DIR}"
log "Backups kept:   ${REMAINING_BACKUPS} file(s) in ${DB_BACKUP_DIR}"
log ""
