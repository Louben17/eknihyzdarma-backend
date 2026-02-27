#!/bin/bash
# Weekly sync nových knih z Project Gutenberg
# Spouštěno cronetem každou neděli ve 3:00

SCRIPT_DIR="/var/www/eknihyzdarma-backend"
LOG_FILE="$SCRIPT_DIR/logs/gutenberg-sync.log"
STRAPI_TOKEN="a42fb37575e3fcbaf7ae24b46a953aebd5072fadb18016944bb1088f0a9c5971bf2b66e314cf03828b7e330c0dc0cf625f594780316529c9150aaea63578e55bc94bd94a1d69323e245995776dec67242ef3a986557d2476505651a3e66734f95c77de43d7e81cb9d9374cd51ac1ec578ebf87828f7fd3396695fdfda2e3cb4f"

mkdir -p "$SCRIPT_DIR/logs"

echo "======================================" >> "$LOG_FILE"
echo "$(date '+%Y-%m-%d %H:%M:%S') – Spouštím weekly sync" >> "$LOG_FILE"

cd "$SCRIPT_DIR"
STRAPI_URL=http://localhost:1337 STRAPI_TOKEN="$STRAPI_TOKEN" \
  node scripts/import-gutenberg.js --limit 200 --sort descending >> "$LOG_FILE" 2>&1

echo "$(date '+%Y-%m-%d %H:%M:%S') – Sync dokončen" >> "$LOG_FILE"
