import { NavLink } from 'react-router-dom';
import {
  Home, Users, ShieldCheck, CheckCircle,
  BarChart3, Settings, FileText
} from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'NID Verification', icon: ShieldCheck, path: '/admin/users/nid-verification' },
    { label: 'Donation Verification', icon: CheckCircle, path: '/admin/donations' },
    { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-73px)]">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Admin Menu</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;