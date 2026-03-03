import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../../api/axios';
import { Hospital, MapPin, AlertTriangle, Calendar, Phone, User, Droplet, Send } from 'lucide-react';

const CreateRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const donor = location.state?.donor;

  const [formData, setFormData] = useState({
    donorId: donor?._id || '',
    hospital: '',
    bloodGroup: donor?.bloodGroup || '',
    urgency: 'medium',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  useEffect(() => {
    if (!donor) {
      navigate('/seeker/search');
    }
  }, [donor, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospital.trim()) newErrors.hospital = 'Hospital name is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.donorId) newErrors.donor = 'Please select a donor first';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await axios.post('/requests', formData);
      alert('Blood request sent successfully!');
      navigate('/seeker/requests');
    } catch (error) {
      alert(error.response?.data?.msg || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  if (!donor) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Donor Selected</h3>
          <p className="text-gray-600 mb-6">Please select a donor from the search page first.</p>
          <button
            onClick={() => navigate('/seeker/search')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Search Donors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Blood Request</h1>
        <p className="text-gray-600 mt-2">Request blood from {donor.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donor Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Donor Information</h3>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {donor.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{donor.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {donor.bloodGroup}
                  </span>
                  <span className="text-sm text-gray-600">
                    {donor.distance} km away
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{donor.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Droplet className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{donor.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Donation</p>
                  <p className="font-medium">
                    {new Date(donor.lastDonation).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Important</span>
              </div>
              <p className="text-sm text-blue-600">
                This donor will receive your request and can choose to accept or reject it.
                Please provide accurate information about your need.
              </p>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Request Details</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hospital className="w-4 h-4 inline-block mr-1" />
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    placeholder="Enter hospital name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${errors.hospital ? 'border-red-300' : 'border-gray-300'
                      }`}
                  />
                  {errors.hospital && (
                    <p className="mt-1 text-sm text-red-600">{errors.hospital}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Droplet className="w-4 h-4 inline-block mr-1" />
                    Blood Group Required *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${errors.bloodGroup ? 'border-red-300' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && (
                    <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  Hospital Address
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter hospital address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline-block mr-1" />
                  Urgency Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['low', 'medium', 'high'].map((level) => (
                    <label
                      key={level}
                      className={`flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${formData.urgency === level
                          ? level === 'high'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : level === 'medium'
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={formData.urgency === level}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Provide any additional details about the request..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/seeker/search')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;