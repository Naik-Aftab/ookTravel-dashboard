import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setCredentials } from '@/store/authSlice';
import { authApi } from '@/api/auth.api';

export function useAuth() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, token } = useSelector(s => s.auth);

  const loginAdmin = async (email, password) => {
    const { data } = await authApi.adminLogin({ email, password });
    dispatch(setCredentials({ user: { ...data.data.user, role: 'admin' }, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken }));
    navigate('/admin');
  };

  const loginRm = async (email, password) => {
    const { data } = await authApi.rmLogin({ email, password });
    dispatch(setCredentials({ user: { ...data.data.user, role: 'rm' }, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken }));
    navigate('/rm');
  };

  const signOut = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logout());
    navigate('/login');
  };

  return { user, token, isAdmin: user?.role === 'admin', isRM: user?.role === 'rm', loginAdmin, loginRm, signOut };
}
