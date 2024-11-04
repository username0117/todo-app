import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/* useAuth 커스텀 훅:
 * - AuthContext의 값을 쉽게 사용하기 위한 커스텀 훅
 * - 컴포넌트에서 인증 관련 기능을 간편하게 사용 가능
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};