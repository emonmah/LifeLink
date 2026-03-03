import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'donor':
        return <Navigate to="/donor/dashboard" replace />;
      case 'seeker':
        return <Navigate to="/seeker/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children || <Outlet />;
};

export default ProtectedRoute;