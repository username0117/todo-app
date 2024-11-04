import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import './styles/Auth.css';

/* Register 컴포넌트:
 * - 회원가입 폼을 제공
 * - 사용자 정보를 입력받아 계정 생성
 */
const Register = () => {
  /* 상태 관리:
   * - formData: 폼 입력 데이터
   * - error: 에러 메시지
   */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });
  const [error, setError] = useState('');

  // useAuth 훅으로 회원가입 함수 가져오기
  const { register } = useAuth();
  // 페이지 이동을 위한 navigate 함수
  const navigate = useNavigate();

  /* 입력 필드 변경 핸들러:
   * - 입력값 변경 시 formData 상태 업데이트
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* 폼 제출 핸들러:
   * - 입력값 검증 후 회원가입 시도
   * - 성공 시 로그인 페이지로 이동
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 프론트엔드 측 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 회원가입 요청 시 confirmPassword 제외
      const { confirmPassword, ...registerData } = formData;
      const success = await register(registerData);
      if (success) {
        navigate('/login');
      }
    } catch (err) {
      // 백엔드에서 전달된 에러 메시지 처리
      const errorMessage = err.response?.data?.message || '회원가입에 실패했습니다.';
      setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-control">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div className="form-control">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
            className="input"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div className="form-control">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <div className="form-control">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="input"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          회원가입
        </button>

        <p className="auth-link">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;