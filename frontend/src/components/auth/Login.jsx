import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import './styles/Auth.css';

/* Login 컴포넌트:
 * - 사용자 로그인 폼을 제공
 * - 이메일과 비밀번호를 입력받아 인증 처리
 */
const Login = () => {
  /* 상태 관리:
   * - formData: 폼 입력 데이터
   * - error: 에러 메시지
   */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // useAuth 훅으로 로그인 함수 가져오기
  const { login } = useAuth();
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
   * - 로그인 시도 및 결과 처리
   * - 성공 시 메인 페이지로 이동
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError('로그인에 실패했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <h2>로그인</h2>
      {error && <div className="error">{error}</div>}

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

        <button type="submit" className="btn btn-primary">
          로그인
        </button>

        <p className="auth-link">
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;