// src/components/layouts/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../common/AdminNavbar';
import AdminSidebar from '../common/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;