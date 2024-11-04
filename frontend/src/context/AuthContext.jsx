import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

/* AuthContext 생성:
 * - 인증 관련 상태와 함수들을 전역적으로 관리하기 위한 Context
 * - null로 초기화하여 나중에 Provider에서 실제 값을 제공
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /* 상태 관리:
   * - user: 현재 로그인한 사용자 정보
   * - isAuthenticated: 로그인 여부
   * - loading: 인증 상태 확인 중 여부
   */
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /* 초기 인증 상태 확인:
   * - 페이지 로드 시 로컬 스토리지의 토큰을 확인
   * - 유효한 토큰이 있다면 사용자 정보를 가져옴
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /* 로그인 함수:
   * - 이메일과 비밀번호로 로그인 시도
   * - 성공 시 토큰 저장 및 사용자 정보 설정
   */
  const login = async (email, password) => {
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('로그인 되었습니다.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || '로그인에 실패했습니다.');
      return false;
    }
  };

  /* 회원가입 함수:
   * - 새 사용자 등록 처리
   * - 성공 시 자동 로그인 또는 로그인 페이지로 이동
   */
  const register = async (userData) => {
    try {
      await authService.register(userData);
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || '회원가입에 실패했습니다.');
      return false;
    }
  };

  /* 로그아웃 함수:
   * - 토큰 제거 및 인증 상태 초기화
   */
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('로그아웃 되었습니다.');
  };

  /* Context Provider 값 설정:
   * - 인증 관련 상태와 함수들을 하위 컴포넌트에서 사용할 수 있도록 제공
   */
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};