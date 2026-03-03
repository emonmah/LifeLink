// src/components/layouts/UserLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;