import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { ShieldCheck, XCircle, Eye, CheckCircle, AlertCircle, RefreshCw, MapPin } from 'lucide-react';

const NIDVerification = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/admin/users/pending-nid', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', res.data);
      
      if (res) {
        setPendingUsers(res.data.users || []);
      } else {
        throw new Error(res.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      alert(error.response?.data?.message || error.message || 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await axios.post('/admin/users/nid-approve', 
        { userId, approve: true },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        alert(`User ${response.users?.name || userId} approved successfully!`);
        
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        
        // Clear selected user if it was the approved one
        if (selectedUser?._id === userId) {
          setSelectedUser(null);
          setSelectedImage(null);
        }
      } else {
        throw new Error(response.data.message || 'Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert(error.response?.data?.message || error.message || 'Error approving user');
    }
  };

  const handleReject = async (userId) => {
    try {
      const response = await axios.delete('/admin/users/nid-reject',{ 
        data: { userId },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          } 
    });
      
      if (response.data.success) {
        alert(`User ${response.data.user?.name || userId} rejected!`);
        
        // Update the list - remove the rejected user
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
        
        // Clear selected user if it was the rejected one
        if (selectedUser?._id === userId) {
          setSelectedUser(null);
          setSelectedImage(null);
        }
      } else {
        throw new Error(response.data.message || 'Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert(error.response?.data?.message || error.message || 'Error rejecting user');
    }
  };

  const handleViewNID = (user) => {
  console.log('Selected user:', user);
  
  if (user.nidImageBase64) {
    setSelectedImage(user.nidImageBase64);
  } else if (user.nidImageUrl) {
    const filename = user.nidImageUrl.split('/').pop();
    const imageUrl = `http://localhost:8080/api/admin/nid-image/${filename}`;
    setSelectedImage(imageUrl);
  } else {
    setSelectedImage('https://via.placeholder.com/400x300.png?text=NID+Image+Not+Available');
  }
  
  setSelectedUser(user);
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NID Verification</h1>
          <p className="text-gray-600 mt-1">
            {pendingUsers.length} pending verification(s)
          </p>
        </div>
        <button
          onClick={fetchPendingUsers}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No pending NID verifications at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User List */}
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{user.name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">NID Number</p>
                        <p className="font-medium">{user.nidNumber}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Registered: {formatDate(user.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewNID(user)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View NID"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleApprove(user._id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NID Image Preview Sidebar */}
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedUser ? `${selectedUser.name}'s NID` : 'NID Preview'}
            </h3>
            
            {selectedUser ? (
              <div className="space-y-4">
                {/* User Info */}
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">NID:</span>
                      <p className="font-medium">{selectedUser.nidNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  </div>
                </div>
                
                {/* Image Preview */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="NID Preview"
                    className="w-full h-auto max-h-96 object-contain bg-gray-100"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300.png?text=Image+Not+Found';
                    }}
                  />
                </div>
                
                {/* Action Buttons for Current User */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleApprove(selectedUser._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve NID
                  </button>
                  <button
                    onClick={() => handleReject(selectedUser._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject NID
                  </button>
                </div>
                
                {/* Verification Guidelines */}
                <div className="text-sm text-gray-600 mt-4 pt-4 border-t">
                  <p className="mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 inline-block" />
                    <span className="font-medium">Verification Guidelines</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Verify name matches the registration</li>
                    <li>Check NID number is clear and valid</li>
                    <li>Ensure photo is clear and matches the user</li>
                    <li>Verify document authenticity</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a user to view their NID</p>
                <p className="text-sm text-gray-400 mt-2">Click the eye icon next to any user</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NIDVerification;