#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== KanVibe 시작 ==="

# PostgreSQL Docker 컨테이너 시작
echo "[1/4] PostgreSQL 시작..."
docker compose up -d db

# DB 준비 대기
echo "[2/4] DB 준비 대기..."
until docker compose exec db pg_isready -U kanvibe -q 2>/dev/null; do
  sleep 1
done
echo "       DB 준비 완료"

# Next.js 빌드
echo "[3/4] Next.js 빌드..."
export NODE_ENV=production
npm run build

# 앱 시작 (production 모드로 실행하여 auto reload 비활성화)
echo "[4/4] KanVibe 서버 시작..."
exec npm run start
