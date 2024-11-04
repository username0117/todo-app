const rateLimit = require('express-rate-limit');

/**
 * API 요청 제한 미들웨어
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  message: {
    success: false,
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
});

/**
 * 로그인 요청 제한 미들웨어
 */
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // IP당 최대 시도 횟수
  message: {
    success: false,
    message: '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
  }
});