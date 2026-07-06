import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center mt-10">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};