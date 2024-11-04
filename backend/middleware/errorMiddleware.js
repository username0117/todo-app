/**
 * 에러 처리 미들웨어
 */
exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  // mongoose 유효성 검사 에러
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: messages[0]  // 첫 번째 에러 메시지만 전송
    });
  }

  // mongoose 중복 키 에러
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `이미 사용 중인 ${field}입니다.`
    });
  }

  // mongoose 잘못된 ObjectId 에러
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: '잘못된 데이터 형식입니다.'
    });
  }

  // 기본 에러 응답
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.'
  });
};

/**
* 404 Not Found 미들웨어
*/
exports.notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
};