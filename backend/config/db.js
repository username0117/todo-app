// MongoDB 데이터베이스 연결을 위한 mongoose 라이브러리를 불러옵니다.
const mongoose = require('mongoose');

/**
 * MongoDB 데이터베이스 연결을 처리하는 비동기 함수입니다.
 * async/await를 사용하여 비동기 작업을 처리합니다.
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // mongoose.connect()를 사용하여 MongoDB에 연결을 시도합니다.
    // process.env.MONGODB_URI는 .env 파일에 정의된 MongoDB 연결 문자열입니다.
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // MongoDB 연결 옵션
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // 연결이 성공적으로 이루어지면 연결된 데이터베이스의 호스트 정보를 콘솔에 출력합니다.
    // conn.connection.host는 연결된 데이터베이스 서버의 호스트 주소를 나타냅니다.
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // 연결 중 오류가 발생하면 에러 메시지를 콘솔에 출력합니다.
    console.error(`Error: ${error.message}`);
    // 심각한 오류이므로 프로세스를 종료합니다. (1은 에러 코드를 나타냅니다)
    process.exit(1);
  }
};

// connectDB 함수를 다른 파일에서 사용할 수 있도록 내보냅니다.
// 이 함수는 server.js에서 서버 시작 시 호출됩니다.
module.exports = connectDB;