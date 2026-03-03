import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import { Droplet, Heart, Award, Clock, Bell, TrendingUp, MapPin } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalDonations: 0,
    points: 0,
    livesSaved: 0,
    pendingRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/requests/donor');
        const requests = res.data;

        // Calculate stats
        const completedDonations = requests.filter(r => r.status === 'completed');
        const pending = requests.filter(r => r.status === 'pending');

        const totalDonations = completedDonations.length;
        // Points are usually in user object, but we can also sum from verified donations if we wanted
        // For now, rely on user.totalPoints for points

        setStats({
          totalDonations,
          points: user?.totalPoints || 0,
          livesSaved: totalDonations, // Approximation
          pendingRequests: pending.length
        });

        // Recent Activity
        // Sort by date descending
        const sorted = requests.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRecentActivity(sorted.slice(0, 5)); // Top 5

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const statCards = [
    { label: 'Total Donations', value: stats.totalDonations, icon: Droplet, color: 'red' },
    { label: 'Points Earned', value: stats.points, icon: Award, color: 'yellow' },
    { label: 'Lives Saved', value: stats.totalDonations, icon: Heart, color: 'green' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Bell, color: 'blue' },
  ];

  const quickActions = [
    { label: 'View Requests', icon: Bell, path: '/donor/requests', color: 'blue' },
    { label: 'Donation History', icon: TrendingUp, path: '/donor/history', color: 'green' },
    { label: 'Update Location', icon: MapPin, path: '/donor/profile', color: 'purple' },
  ];

  const getNextAvailableDate = () => {
    if (user?.nextAvailableDate) {
      const date = new Date(user.nextAvailableDate);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Available Now';
  };

  const formatActivityTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getActivityText = (activity) => {
    switch (activity.status) {
      case 'completed':
        return `Donated ${activity.bloodGroup} blood at ${activity.hospital}`;
      case 'accepted':
        return `Accepted request from ${activity.seeker?.name || 'Seeker'}`;
      case 'pending':
        return `Received request from ${activity.seeker?.name || 'Seeker'}`;
      case 'rejected':
        return `Rejected request from ${activity.seeker?.name || 'Seeker'}`;
      case 'cancelled':
        return `Request cancelled by ${activity.seeker?.name || 'Seeker'}`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, Lifesaver! {user?.nextAvailableDate ?
            'You can donate again soon.' :
            'Ready to help someone today?'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Availability Status */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Availability Status</h2>
            <p className="text-red-100">
              {user?.nextAvailableDate ?
                `Next available donation: ${getNextAvailableDate()}` :
                'You are currently available for donation'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-2xl font-bold">
              {user?.nextAvailableDate ? 'Unavailable' : 'Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.path}
              className={`flex flex-col items-center justify-center gap-3 p-6 bg-${action.color}-50 text-${action.color}-700 rounded-xl hover:bg-${action.color}-100 transition-colors`}
            >
              <action.icon className="w-8 h-8" />
              <span className="font-medium text-center">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <a href="/donor/history" className="text-sm text-red-600 hover:text-red-800 font-medium">
            View All
          </a>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center">Loading activity...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center">No recent activity</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={activity._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${activity.status === 'completed' ? 'bg-red-100' :
                    activity.status === 'pending' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                    {activity.status === 'completed' ? <Droplet className="w-4 h-4 text-red-600" /> :
                      activity.status === 'pending' ? <Bell className="w-4 h-4 text-blue-600" /> :
                        <TrendingUp className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getActivityText(activity)}</p>
                    <p className="text-sm text-gray-600">{formatActivityTime(activity.updatedAt)}</p>
                  </div>
                </div>
                {activity.pointsAdded && (
                  <span className="font-bold text-green-600">+100</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;