const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

/**
 * 로그인 시도 제한 미들웨어
 */
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 최대 5번 시도
  message: {
    success: false,
    message: '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
  }
});

/**
 * JWT 토큰 검증 미들웨어
 */
exports.protect = async (req, res, next) => {
  try {
    // 1. 토큰 존재 여부 확인
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요한 서비스입니다.'
      });
    }

    // 2. 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 사용자 조회
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '존재하지 않는 사용자입니다.'
      });
    }

    // 4. 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '만료된 토큰입니다.'
      });
    }
    next(error);
  }
};

/**
 * 회원가입 시도 제한 미들웨어
 */
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 3, // IP당 최대 3번 시도
  message: {
    success: false,
    message: '너무 많은 회원가입 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
  }
});