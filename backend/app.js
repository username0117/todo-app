const express = require('express');
const cors = require('cors'); // CORS 추가
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { protect } = require('./middleware/authMiddleware');

const app = express();

// CORS 설정 - 프론트엔드와의 통신을 위해 가장 먼저 설정
app.use(cors({
  origin: 'http://100.89.136.112:3000', // Vite 개발 서버 주소
  credentials: true, // 인증 관련 헤더 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 요청 제한
app.use('/api', apiLimiter);

// 라우트
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/todos', protect, require('./routes/todoRoutes')); // 인증 필요

// 404 처리
app.use(notFound);

// 에러 처리
app.use(errorHandler);

module.exports = app;
