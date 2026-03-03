import { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { User, Mail, Phone, MapPin, Droplet, Calendar, Award, Save, Edit2 } from 'lucide-react';

const DonorProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || { area: '', lat: '', lon: '' },
    bloodGroup: user?.bloodGroup || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In real app: await axios.put('/users/profile', formData);
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

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

  const getLastDonationDate = () => {
    if (user?.lastDonationDate) {
      const date = new Date(user.lastDonationDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Never donated';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isEditing ? 'bg-gray-100 text-gray-700' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isEditing ? (
            <>
              <Edit2 className="w-4 h-4" />
              Cancel Edit
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline-block mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline-block mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline-block mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Droplet className="w-4 h-4 inline-block mr-1" />
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  Location
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="area"
                    placeholder="Area/City"
                    value={formData.location.area}
                    onChange={handleLocationChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                  <input
                    type="number"
                    name="lat"
                    placeholder="Latitude"
                    value={formData.location.lat}
                    onChange={handleLocationChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                  <input
                    type="number"
                    name="lon"
                    placeholder="Longitude"
                    value={formData.location.lon}
                    onChange={handleLocationChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold">{user?.name}</h3>
              <p className="text-red-100 mt-1">{user?.email}</p>
              <div className="mt-4 px-4 py-2 bg-white/20 rounded-full">
                <span className="font-bold">{user?.bloodGroup || 'Not Set'}</span>
              </div>
            </div>
          </div>

          {/* Donation Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Donation Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Award className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Points</p>
                    <p className="font-bold text-gray-900">{user?.totalPoints || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Donation</p>
                    <p className="font-bold text-gray-900">{getLastDonationDate()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Available</p>
                    <p className="font-bold text-gray-900">{getNextAvailableDate()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email Verified</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">NID Verified</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.nidStatus === 'approved' ? 'bg-green-100 text-green-800' :
                  user?.nidStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {user?.nidStatus?.charAt(0).toUpperCase() + user?.nidStatus?.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;