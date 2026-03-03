// src/components/common/Navbar.jsx
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, User, LogOut, Droplet, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'donor' ? [
    { label: 'Dashboard', path: '/donor/dashboard', icon: Droplet },
    { label: 'Requests', path: '/donor/requests', icon: Bell },
    { label: 'Profile', path: '/donor/profile', icon: User },
  ] : [
    { label: 'Dashboard', path: '/seeker/dashboard', icon: Droplet },
    { label: 'Search Donors', path: '/seeker/search', icon: Search },
    { label: 'My Requests', path: '/seeker/requests', icon: Bell },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={`/${user?.role}/dashboard`} className="flex items-center gap-2">
              <Droplet className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">LifeLink</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;