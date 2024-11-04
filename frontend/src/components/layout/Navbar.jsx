import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import './styles/Navbar.css';

/* Navbar 컴포넌트:
 * - 인증된 사용자에게만 표시
 * - 할일 목록 링크, 사용자 정보, 로그아웃 버튼 포함
 */
const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 비인증 상태면 navbar를 표시하지 않음
  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="nav-link">
            TodoList
          </Link>
        </div>
        <div className="navbar-right">
          <span className="user-name">
            {user?.nickname || '사용자'}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-logout"
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;