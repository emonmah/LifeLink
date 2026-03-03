import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import { Search, Clock, CheckCircle, AlertTriangle, Droplet, MapPin, Bell } from 'lucide-react';

const SeekerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    availableDonors: 0,
    activeRequests: 0,
    completedRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch My Requests
        const reqRes = await axios.get('/requests/seeker');
        const requests = reqRes.data;

        // Calculate stats from requests
        const active = requests.filter(r => ['pending', 'accepted'].includes(r.status));
        const completed = requests.filter(r => r.status === 'completed');

        // Recent Activity (Top 3)
        const activity = requests
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 3)
          .map(r => ({
            type: 'request',
            text: `Request for ${r.bloodGroup} to ${r.hospital}`,
            time: new Date(r.updatedAt).toLocaleDateString(),
            status: r.status
          }));
        let donorCount = 0;
        try {
          const donorRes = await axios.get('/donor/search');
          donorCount = donorRes.data.length;
        } catch (err) {
          console.error("Error fetching donor count:", err);
        }

        setStats({
          availableDonors: donorCount,
          activeRequests: active.length,
          completedRequests: completed.length
        });
        setRecentActivity(activity);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const donorStats = [
    { label: 'Active Requests', value: stats.activeRequests, color: 'blue' },
    { label: 'Completed Requests', value: stats.completedRequests, color: 'green' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seeker Dashboard</h1>
        <p className="text-gray-600 mt-2">Find the blood you need, when you need it</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {donorStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                {stat.label.includes('Donors') ? <Droplet className={`w-6 h-6 text-${stat.color}-600`} /> :
                  stat.label.includes('Active') ? <Bell className={`w-6 h-6 text-${stat.color}-600`} /> :
                    <CheckCircle className={`w-6 h-6 text-${stat.color}-600`} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Card */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Need Blood Urgently?</h2>
            <p className="text-red-100 mb-4">Search for available donors near you instantly</p>
            <div className="flex items-center gap-2 text-red-100">
              <MapPin className="w-4 h-4" />
              <span>Real-time location-based search</span>
            </div>
          </div>
          <Link
            to="/seeker/search"
            className="flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <Search className="w-5 h-5" />
            <span>Search Donors Now</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/seeker/search"
            className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Search className="w-8 h-8" />
            <span className="font-medium text-center">Search Donors</span>
          </Link>
          
          <Link
            to="/seeker/requests"
            className="flex flex-col items-center justify-center gap-3 p-6 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
          >
            <Clock className="w-8 h-8" />
            <span className="font-medium text-center">My Requests</span>
          </Link>
          <Link
            to="/seeker/emergency"
            className="flex flex-col items-center justify-center gap-3 p-6 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <AlertTriangle className="w-8 h-8" />
            <span className="font-medium text-center">Emergency</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <Link to="/seeker/requests" className="text-sm text-red-600 hover:text-red-800 font-medium">
            View All
          </Link>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No recent activity</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${activity.status === 'completed' ? 'bg-green-100' :
                      activity.status === 'pending' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                    {activity.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                      activity.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                        <Bell className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.text}</p>
                    <p className="text-sm text-gray-600">Status: {activity.status}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;