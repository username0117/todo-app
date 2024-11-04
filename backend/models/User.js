const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * 사용자 스키마 정의
 * email을 주요 식별자(로그인 용도)로 사용하고,
 * nickname을 표시용 고유 식별자로 사용합니다.
 */
const userSchema = new mongoose.Schema({
  // 이메일 (로그인 식별자)
  email: {
    type: String,
    required: [true, '이메일은 필수입니다.'],
    unique: true,
    lowercase: true, // 항상 소문자로 저장
    trim: true,     // 앞뒤 공백 제거
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '유효한 이메일 주소를 입력해주세요.'
    ]
  },
  // 닉네임 (표시용 식별자)
  nickname: {
    type: String,
    required: [true, '닉네임은 필수입니다.'],
    unique: true,
    trim: true,
    minlength: [2, '닉네임은 최소 2자 이상이어야 합니다.'],
    maxlength: [8, '닉네임은 최대 8자까지 가능합니다.'],
    match: [
      /^[가-힣a-zA-Z0-9]+$/,
      '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Passport-Local-Mongoose 설정
 * 이메일을 username으로 사용합니다.
 */
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameLowerCase: true,
  errorMessages: {
    UserExistsError: '이미 등록된 이메일 주소입니다.',
    IncorrectPasswordError: '로그인에 실패했습니다.',
    IncorrectUsernameError: '로그인에 실패했습니다.'
  }
});

/**
 * 회원가입 시 모든 검증을 처리하는 단일 미들웨어
 */
userSchema.pre('save', async function (next) {
  try {
    // 닉네임 중복 검사 (자기 자신 제외)
    const nicknameExists = await this.constructor.findOne({
      nickname: this.nickname,
      _id: { $ne: this._id }
    });
    if (nicknameExists) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // 닉네임 금지어 검사
    const forbiddenNicknames = ['관리자', 'admin', 'system'];
    if (forbiddenNicknames.includes(this.nickname.toLowerCase())) {
      throw new Error('사용할 수 없는 닉네임입니다.');
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;