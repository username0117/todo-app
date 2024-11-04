const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

/**
 * Passport 설정 함수
 * 다양한 인증 전략을 설정합니다.
 */
module.exports = (passport) => {
  // Local Strategy 설정 (이메일/비밀번호 로그인)
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, User.authenticate()));

  // JWT Strategy 설정 (토큰 기반 인증)
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // 세션 직렬화/역직렬화 설정
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};