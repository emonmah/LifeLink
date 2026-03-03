import { useState, useContext, useEffect } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle, 
  Loader2, Shield, Settings 
} from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

    useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && args[0].toString().includes('insecure')) {
        console.log("Insecure operation detected:", args);
        debugger; // Pause here to inspect
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    console.log("Admin login attempt:", { email }); // Debug log
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/admin/login", { email, password });
      console.log("Admin login response:", res.data); // Debug log
      
      // Transform admin data to user format for AuthContext
      const adminData = {
        id: res.data.admin.id,
        name: res.data.admin.name,
        email: res.data.admin.email,
        role: 'admin'
      };
      
      login(res.data.token, adminData);
      navigate("/admin/dashboard");
      
    } catch (err) {
      console.error("Admin login error:", err.response?.data || err.message); // Debug log
      setError(err.response?.data?.msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left side - Admin Info */}
          <div className="md:w-1/2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">LifeLink</h1>
                  <p className="text-gray-300 text-lg mt-1">Administrative Portal</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">System Management</h3>
                    <p className="text-gray-300 mt-1">Full control over user accounts and verifications</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Donation Oversight</h3>
                    <p className="text-gray-300 mt-1">Verify donations and award points to donors</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-bold">Security Notice</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    This portal is restricted to authorized personnel only. 
                    All activities are logged and monitored.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="md:w-1/2">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Login
                </h2>
                <p className="text-gray-600">
                  Enter admin credentials to access the system
                </p>
              </div>

              <form onSubmit={submit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="admin@lifelink.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}

                {/* Two-Factor Authentication */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Enhanced Security</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This portal requires admin-level authentication. 
                    Access is monitored and logged for security purposes.
                  </p>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    submit(e);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Access Admin Dashboard
                    </>
                  )}
                </button>
              </form>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/login"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-center"
                  >
                    User Login
                  </Link>
                  <Link
                    to="/"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-center"
                  >
                    Home Page
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 LifeLink Administrative System. Authorized Use Only.
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}