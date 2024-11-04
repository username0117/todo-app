# Node.js 베이스 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# npm ci 대신 npm install 사용
RUN npm install --production

# 소스 코드 복사
COPY . .

# 환경변수 설정
ENV PORT=5000

# 5000 포트 노출
EXPOSE 5000

# 애플리케이션 실행
CMD ["npm", "start"]