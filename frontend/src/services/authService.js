import axios from 'axios';

/* axios 인스턴스 생성:
 * - 기본 URL과 헤더 설정
 * - 환경변수에서 API URL 가져옴
 */
const api = axios.create({
  baseURL: 'http://100.89.136.112:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/* 요청 인터셉터:
 * - 모든 요청에 인증 토큰을 자동으로 추가
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* 인증 관련 API 호출 함수들 */
const authService = {
  // 로그인
  async login(email, password) {
    try {
      console.log('Login attempt with:', { email });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },

  // 회원가입
  async register(userData) {
    try {
      console.log('Registering user with:', userData);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      if (error.response?.data) {
        throw error.response.data; // 백엔드에서 보낸 에러 메시지를 그대로 전달
      }
      throw new Error('서버 연결에 실패했습니다.');
    }
  },

  // 현재 사용자 정보 조회
  async getCurrentUser() {
    try {
      console.log('Fetching current user');
      const response = await api.get('/auth/me');
      console.log('Current user response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error.response?.data || error);
      throw error;
    }
  }
};

export default authService;
