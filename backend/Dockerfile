# Node.js 베이스 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치 (npm install 대신 npm ci 사용)
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 5000 포트 노출
EXPOSE 5000

# 애플리케이션 실행
CMD ["npm", "start"]