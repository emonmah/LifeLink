import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Clock, CheckCircle, XCircle, AlertTriangle, Hospital, MapPin, Phone, Droplet } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/requests/seeker');
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[urgency]}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Urgency
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;

    try {
      await axios.put(`/requests/${requestId}/status`, { status: 'cancelled' });
      alert(`Request ${requestId} cancelled.`);
      fetchRequests();
    } catch (error) {
      alert('Error cancelling request');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Blood Requests</h1>
        <p className="text-gray-600 mt-2">Track and manage your blood donation requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {requests.filter(r => r.status === 'accepted').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-6">
        {requests.map((request) => (
          <div key={request._id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-600" />
                  {request.bloodGroup} Blood Request
                </h3>
                <p className="text-gray-600 mt-1">{request.hospital}</p>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(request.status)}
                {getUrgencyBadge(request.urgency)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Donor</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {request.donor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.donor.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {request.donor.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Hospital</p>
                <div className="flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{request.hospital}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {request.location}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-600" />
                  <span className="text-lg font-bold">{request.bloodGroup}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Requested On</p>
                <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                {getStatusIcon(request.status)}
                <span className="text-sm">
                  {request.status === 'pending' ? 'Waiting for donor response' :
                    request.status === 'accepted' ? 'Donor has accepted your request' :
                      request.status === 'completed' ? 'Donation completed' :
                        request.status === 'rejected' ? 'Request was rejected' :
                          request.status === 'cancelled' ? 'Request was cancelled' :
                            'Request was cancelled'}
                </span>
              </div>

              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(request._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-600">You haven't made any blood requests yet.</p>
          <a
            href="/seeker/search"
            className="inline-block mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Search for Donors
          </a>
        </div>
      )}
    </div>
  );
};

export default MyRequests;