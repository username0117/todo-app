import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Navigate 추가
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TodoList from './components/todos/TodoList';

// 기본 스타일 import
import '../styles/variables.css'
import '../styles/reset.css';
import '../styles/common.css';

/* QueryClient 인스턴스 생성:
 * - React Query를 사용하여 서버 상태 관리
 * - 캐싱, 재시도, 백그라운드 업데이트 등의 기능 제공
 */
const queryClient = new QueryClient();

/* PublicRoute 컴포넌트:
 * - 인증된 사용자는 메인 페이지로 리다이렉트
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    /* QueryClientProvider:
     * - React Query 기능을 애플리케이션 전체에서 사용할 수 있게 함
     */
    <QueryClientProvider client={queryClient}>
      {/* AuthProvider:
       * - 사용자 인증 상태를 전역적으로 관리
       * - 로그인 상태, 사용자 정보 등을 컨텍스트로 제공
       */}
      <AuthProvider>
        {/* Router:
         * - 클라이언트 사이드 라우팅 구현
         * - 페이지 새로고침 없이 화면 전환 가능
         */}
        <Router>
          <div className="app">
            <Navbar />
            <div className="container">
              {/* Routes:
             * - 여러 Route를 그룹화하고 관리
             * - 현재 URL에 맞는 컴포넌트를 렌더링
             */}
              <Routes>
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                {/* PrivateRoute:
               * - 인증된 사용자만 접근 가능한 라우트
               * - 비인증 사용자는 로그인 페이지로 리다이렉트
               */}
                <Route path="/" element={
                  <PrivateRoute>
                    <TodoList />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
            {/* ToastContainer:
           * - 알림 메시지를 표시하는 컴포넌트
           * - 작업 성공/실패 등의 피드백 제공
           */}
          </div>
          <ToastContainer position="bottom-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;