import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/* PrivateRoute 컴포넌트:
 * - 인증된 사용자만 접근할 수 있는 라우트를 위한 컴포넌트
 * - 비인증 사용자는 로그인 페이지로 리다이렉트
 */
const PrivateRoute = ({ children }) => {
  // useAuth 훅을 사용하여 인증 상태 확인
  const { isAuthenticated, loading } = useAuth();

  // 인증 상태 확인 중일 때 로딩 표시
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 사용자는 자식 컴포넌트 렌더링
  return children;
};

export default PrivateRoute;