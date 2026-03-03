import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Bell, Clock, CheckCircle, XCircle, MapPin, Hospital, Phone, Upload } from 'lucide-react';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/requests/donor');
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

  const handleAccept = async (requestId) => {
    try {
      await axios.put(`/requests/${requestId}/status`, { status: 'accepted' });
      alert(`Request ${requestId} accepted!`);
      fetchRequests();
    } catch (error) {
      alert('Error accepting request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(`/requests/${requestId}/status`, { status: 'rejected' });
      alert(`Request ${requestId} rejected.`);
      fetchRequests();
    } catch (error) {
      alert('Error rejecting request');
    }
  };

  const handleComplete = (request) => {
    setSelectedRequest(request._id);
  };

  const submitCompletion = async () => {
    if (!proofFile) {
      alert("Please upload a proof document");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('status', 'completed');
    formData.append('proofDocument', proofFile);

    try {
      await axios.put(`/requests/${selectedRequest}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Donation marked as completed!`);
      setSelectedRequest(null);
      setProofFile(null);
      fetchRequests();
    } catch (error) {
      alert('Error marking donation as complete');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blood Requests</h1>
        <p className="text-gray-600 mt-2">
          Manage incoming blood donation requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
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
            <div className="p-3 bg-blue-100 rounded-full">
              <Bell className="w-6 h-6 text-blue-600" />
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
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seeker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {request.seeker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{request.seeker.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {request.seeker.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Hospital className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{request.hospital}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {request.hospitalLocation?.coordinates[0]} {request.hospitalLocation?.coordinates[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {request.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getUrgencyBadge(request.urgency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(request._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => handleComplete(request)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Complete & Upload Proof
                        </button>
                      )}
                      {request.status === 'completed' && (
                        request.verified ? (
                          <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Verified (+100 Points)
                          </span>
                        ) : (
                          <span className="text-yellow-600 text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Awaiting Verification
                          </span>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {requests.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No requests yet</h3>
          <p className="text-gray-600">When someone requests your blood type, it will appear here.</p>
        </div>
      )}
      {/* Completion Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Complete Donation</h3>
            <p className="text-gray-600 mb-4">Please upload a document (Image/PDF) to prove your donation.</p>

            <div className="mb-4">
              <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files[0])}
                  accept="image/*,application/pdf"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-500">
                  {proofFile ? proofFile.name : "Click to upload proof"}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSelectedRequest(null); setProofFile(null); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;