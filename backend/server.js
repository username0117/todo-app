require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors'); // CORS 추가
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// CORS 설정 추가
app.use(cors({
  origin: 'http://100.89.136.112:3000', // Vite 개발 서버 주소
  credentials: true, // 인증 관련 헤더 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 허용할 HTTP 메서드
  allowedHeaders: ['Content-Type', 'Authorization'] // 허용할 헤더
}));

// 데이터베이스 연결
connectDB();

// 세션 미들웨어 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // CORS 관련 쿠키 설정
  }
}));

// Passport 미들웨어 초기화
app.use(passport.initialize());
app.use(passport.session());

// Passport 설정 불러오기
require('./config/passport')(passport);

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`
    🚀 서버가 실행되었습니다!
    📡 포트: ${PORT}
    🌍 모드: ${process.env.NODE_ENV || 'development'}
    `);
});

// 예기치 않은 에러 처리
process.on('unhandledRejection', (err) => {
  console.error('처리되지 않은 에러:', err);
  server.close(() => process.exit(1));
});
