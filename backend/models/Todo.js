const mongoose = require('mongoose');

/**
 * 반복 주기 enum 정의
 */
const REPEAT_TYPES = {
  NONE: 'none',      // 반복 없음
  MINUTE: 'minute',  // 분 단위 반복
  HOURLY: 'hourly',  // 시간 단위 반복
  DAILY: 'daily',    // 일 단위 반복
  WEEKLY: 'weekly',  // 주 단위 반복
  MONTHLY: 'monthly',// 월 단위 반복
  YEARLY: 'yearly'   // 년 단위 반복
};

/**
 * 요일 enum 정의 (0: 일요일 ~ 6: 토요일)
 */
const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
};

/**
 * Todo 스키마 정의
 */
const todoSchema = new mongoose.Schema({
  // 할일 제목 (필수)
  title: {
    type: String,
    required: [true, '할일 제목은 필수입니다.'],
    trim: true,
    minlength: [2, '제목은 최소 2자 이상이어야 합니다.'],
    maxlength: [50, '제목은 최대 50자까지 가능합니다.']
  },
  // 완료 여부 (필수)
  completed: {
    type: Boolean,
    default: false,
    required: true
  },
  // 작성자 정보 (필수)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 할일 상세 내용 (선택)
  content: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, '내용은 최대 500자까지 가능합니다.']
  },
  // 마감 일정 관련
  dueDate: {
    type: Date,
    required: false
  },
  // 반복 설정
  repeat: {
    // 반복 타입
    type: {
      type: String,
      enum: Object.values(REPEAT_TYPES),
      default: REPEAT_TYPES.NONE,
      required: true
    },
    // 반복 간격
    interval: {
      type: Number,
      min: 1,
      default: 1,
      required: function () {
        return this.repeat && this.repeat.type && this.repeat.type !== REPEAT_TYPES.NONE;
      }
    },
    // 요일별 반복 설정 (선택)
    weekdays: [{
      type: Number,
      enum: Object.values(WEEKDAYS)
    }],
    // 반복 종료일 (선택)
    endDate: {
      type: Date,
      required: false
    }
  },
  // 참조 URL (선택)
  referenceUrl: {
    type: String,
    required: false,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'URL 형식이 올바르지 않습니다.'
    ]
  },
  // 체크리스트 (선택)
  checkList: [{
    item: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, '체크리스트 항목은 최대 100자까지 가능합니다.']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * 작성자 닉네임 가상 필드
 */
todoSchema.virtual('userNickname', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  get: function (user) {
    return user ? user.nickname : null;
  }
});

/**
 * D-day 계산을 위한 가상 필드
 */
todoSchema.virtual('dDay').get(function () {
  if (!this.dueDate) return null;

  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
});

/**
 * 다음 반복 일정 생성 메서드
 */
todoSchema.methods.createNextRepeat = function () {
  if (this.repeat.type === REPEAT_TYPES.NONE) return null;

  const nextDueDate = new Date(this.dueDate);
  const interval = this.repeat.interval;

  // 기본 반복 처리
  switch (this.repeat.type) {
    case REPEAT_TYPES.MINUTE:
      nextDueDate.setMinutes(nextDueDate.getMinutes() + interval);
      break;
    case REPEAT_TYPES.HOURLY:
      nextDueDate.setHours(nextDueDate.getHours() + interval);
      break;
    case REPEAT_TYPES.DAILY:
      nextDueDate.setDate(nextDueDate.getDate() + interval);
      break;
    case REPEAT_TYPES.WEEKLY:
      nextDueDate.setDate(nextDueDate.getDate() + (interval * 7));
      break;
    case REPEAT_TYPES.MONTHLY:
      nextDueDate.setMonth(nextDueDate.getMonth() + interval);
      break;
    case REPEAT_TYPES.YEARLY:
      nextDueDate.setFullYear(nextDueDate.getFullYear() + interval);
      break;
  }

  // 요일 반복 설정이 있는 경우 추가 처리
  if (this.repeat.weekdays && this.repeat.weekdays.length > 0) {
    const currentDay = nextDueDate.getDay();
    const selectedDays = this.repeat.weekdays.sort();

    // 다음 반복 요일 찾기
    let nextDay = selectedDays.find(day => day > currentDay);
    if (!nextDay) {
      // 이번 주에 남은 요일이 없으면 다음 주 첫 요일
      nextDay = selectedDays[0];
      nextDueDate.setDate(nextDueDate.getDate() + (7 - currentDay + nextDay));
    } else {
      // 이번 주 다음 요일로 이동
      nextDueDate.setDate(nextDueDate.getDate() + (nextDay - currentDay));
    }
  }

  // 반복 종료일 체크
  if (this.repeat.endDate && nextDueDate > this.repeat.endDate) {
    return null;
  }

  return nextDueDate;
};

/**
 * Todo 조회 시 자동으로 user 정보를 가져오는 미들웨어
 */
todoSchema.pre(/^find/, function (next) {
  this.populate('user', 'nickname');
  next();
});

const Todo = mongoose.model('Todo', todoSchema);
module.exports = { Todo, REPEAT_TYPES, WEEKDAYS };