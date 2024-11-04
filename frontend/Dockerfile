# Node.js 베이스 이미지 사용
FROM node:18-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 환경변수 설정 (예시)
ENV VITE_API_URL=http://api:5000

# 빌드
RUN npm run build

# nginx 베이스 이미지로 전환
FROM nginx:alpine

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일을 nginx의 서비스 디렉토리로 복사
COPY --from=0 /app/dist /usr/share/nginx/html

# 80 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]