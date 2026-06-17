#!/usr/bin/env bash
# 우분투내 환경변수 설정구문

set -e

IMAGE_NAME="my-diary-frontend"
CONTAINER_NAME="my-diary-frontend"

#프라이빗 서버의 사설IP
BACKEND_HOST="${BACKEND_HOST:-10.10.2.6}"
FRONTEND_NAME="$(hostname)"



cd "$(dirname "$0")/.."

# 기존 컨테이너 중지/삭제 구문
# 환경변수 데이터 접근방법 : $환경변수명
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# 프론트엔드 이미지 빌드 구문
# 이미지 빌드시 백엔드 호스트 주소를 주입
docker build -t "$IMAGE_NAME" .

# 컨테이너 실행 구문
docker run -d \
  --name "$CONTAINER_NAME" \
  -p 80:80 \
  -e BACKEND_HOST="$BACKEND_HOST" \
  -e FRONTEND_NAME="$FRONTEND_NAME" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "Frontend container is running."
echo "BACKEND_HOST=$BACKEND_HOST" 
echo "FRONTEND_NAME=$FRONTEND_NAME"