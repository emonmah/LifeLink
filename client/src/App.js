import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import AuthLayout from './components/layouts/AuthLayout';
import AdminLayout from './components/layouts/AdminLayout';
import UserLayout from './components/layouts/UserLayout';

// Auth Pages
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import UserList from './pages/admin/users/UserList';
import NIDVerification from './pages/admin/users/NIDVerification';
import DonationList from './pages/admin/donations/DonationList';
import AdminReports from './pages/admin/reports/AdminReports';
import AdminSettings from './pages/admin/settings/AdminSettings';

// Donor Pages
import DonorDashboard from './pages/donor/dashboard/DonorDashboard';
import RequestList from './pages/donor/requests/RequestList';
import DonorProfile from './pages/donor/profile/DonorProfile';
import DonationHistory from './pages/donor/history/DonationHistory';

// Seeker Pages
import SeekerDashboard from './pages/seeker/dashboard/SeekerDashboard';
import SearchDonors from './pages/seeker/search/SearchDonors';
import MyRequests from './pages/seeker/requests/MyRequests';
import CreateRequest from './pages/seeker/requests/CreateRequest';


// Common Components
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users">
                  <Route index element={<UserList />} />
                  <Route path="nid-verification" element={<NIDVerification />} />
                </Route>
                <Route path="donations">
                  <Route index element={<DonationList />} />
                </Route>
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Donor Routes */}
              <Route path="/donor" element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DonorDashboard />} />
                <Route path="requests" element={<RequestList />} />
                <Route path="profile" element={<DonorProfile />} />
                <Route path="history" element={<DonationHistory />} />
              </Route>

              {/* Seeker Routes */}
              <Route path="/seeker" element={
                <ProtectedRoute allowedRoles={['seeker']}>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<SeekerDashboard />} />
                <Route path="search" element={<SearchDonors />} />
                <Route path="requests">
                  <Route index element={<MyRequests />} />
                  <Route path="create" element={<CreateRequest />} />
                </Route>
              </Route>

              {/* Root Redirect */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Page not found</p>
                    <a
                      href="/"
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Go back to Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;