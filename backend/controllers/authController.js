const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 회원가입 컨트롤러
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    // 이메일, 닉네임 중복 검사는 User 모델의 미들웨어에서 처리됨
    const user = new User({ 
      email,
      nickname,
      username: email
  });

    // passport-local-mongoose의 register 메소드 사용
    await User.register(user, password);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 로그인 컨트롤러
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    // passport 인증 실행
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return next(err);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '로그인에 실패했습니다.'
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname
        }
      });
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * 현재 사용자 정보 조회
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname
      }
    });
  } catch (error) {
    next(error);
  }
};