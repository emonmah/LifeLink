// src/components/layouts/AuthLayout.jsx
import { Outlet, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AuthLayout = () => {
  const { user } = useContext(AuthContext);

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'donor':
        return <Navigate to="/donor/dashboard" replace />;
      case 'seeker':
        return <Navigate to="/seeker/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;