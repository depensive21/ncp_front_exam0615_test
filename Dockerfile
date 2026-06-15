
# 노드 이미지 빌드
FROM node:24-slim AS build

# 작업 디렉토리 생성/설정
WORKDIR /app

# 현위치 p.js 을 /app으로 이동하고.
# 디펜던시에 있는 라이브러리 설치
COPY package*.json ./
RUN npm install

# 현 위치 파일을 app으로 복사
# build 명령어로 리액트 정적 웹 파일 생성
COPY . .
RUN npm run build

# nginx 이미지 빌드
FROM nginx:alpine

# nginx 실행시 백엔드 호스트에 환경변수주입
WORKDIR BACKEND_HOST = ${BACKEND_HOST}

# nginx 설정 템플릿 파일을 conf.d 폴더로 속사
# default.conf.template -> default.conf 로 자동치환
COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

# 노드 이미지 빌드과정에서 생성된 리액트 정적 폴더 /dist를 
# nginx의 html 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html 

# 컨테이너의 포트를 80으로 지정
EXPOSE 80


