import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Search, Filter, MoreVertical, Eye, CheckCircle, XCircle, UserCheck, UserX, RefreshCw, Ban, Mail, Phone, Calendar, Shield, Droplet } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nidFilter, setNidFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // First, get ALL users without filters
      const response = await axios.get('/admin/users', {
        params: {
          page: 1,
          search: '',
          role: '',
          verified: ''
        }
      });
      
      if (response.data.success) {
        const allUsersData = response.data.users || [];
        setAllUsers(allUsersData);
        
        // Calculate stats from all users
        const calculatedStats = {
          totalUsers: allUsersData.length,
          verifiedUsers: allUsersData.filter(u => u.nidVerified).length,
          pendingNID: allUsersData.filter(u => !u.nidVerified && u.nidNumber).length,
          blockedUsers: allUsersData.filter(u => u.status === 'blocked').length,
          adminUsers: allUsersData.filter(u => u.role === 'admin').length,
          donorUsers: allUsersData.filter(u => u.role === 'donor').length,
          seekerUsers: allUsersData.filter(u => u.role === 'seeker').length
        };
        
        setStats(calculatedStats);
        applyFilters(allUsersData, searchTerm, roleFilter, statusFilter, nidFilter);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error.response?.data?.message || error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (userList, search, role, status, nidStatus) => {
    const filtered = userList.filter(user => {
      // Search filter
      const matchesSearch = 
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.includes(search) ||
        user.nidNumber?.includes(search);
      
      // Role filter
      const matchesRole = role === 'all' || user.role === role;
      
      // Status filter
      const matchesStatus = status === 'all' || user.status === status;
      
      // NID Status filter
      const matchesNID = nidStatus === 'all' || 
        (nidStatus === 'verified' && user.nidVerified) ||
        (nidStatus === 'pending' && !user.nidVerified && user.nidNumber) ||
        (nidStatus === 'no-nid' && (!user.nidNumber || user.nidNumber === ''));
      
      return matchesSearch && matchesRole && matchesStatus && matchesNID;
    });
    
    setUsers(filtered);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    applyFilters(allUsers, searchTerm, roleFilter, statusFilter, nidFilter);
  };

  const handleFilterChange = (type, value) => {
    switch(type) {
      case 'role':
        setRoleFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'nid':
        setNidFilter(value);
        break;
    }
    setTimeout(() => {
      applyFilters(allUsers, searchTerm, 
        type === 'role' ? value : roleFilter,
        type === 'status' ? value : statusFilter,
        type === 'nid' ? value : nidFilter
      );
    }, 100);
  };

  const handleApproveNID = async (userId) => {
    try {
      const response = await axios.post('/admin/users/nid-approve', { 
        userId, 
        approve: true 
      });
      
      if (response.data.success) {
        alert('NID approved successfully!');
        setAllUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, nidVerified: true, nidStatus: 'approved', status: 'active' }
            : user
        ));
        
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, nidVerified: true, nidStatus: 'approved', status: 'active' }
            : user
        ));
        
        if (selectedUser?._id === userId) {
          setSelectedUser(prev => ({ ...prev, nidVerified: true, nidStatus: 'approved', status: 'active' }));
        }
      }
    } catch (error) {
      console.error('Error approving NID:', error);
      alert(error.response?.data?.message || 'Failed to approve NID');
    }
  };

  const handleRejectNID = async (userId) => {
    try {
      const response = await axios.post('/admin/users/nid-approve', { 
        userId, 
        approve: false 
      });
      
      if (response.data.success) {
        alert('NID rejected!');
        
        // Update the user in the list
        setAllUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, nidVerified: false, nidStatus: 'rejected', status: 'rejected' }
            : user
        ));
        
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, nidVerified: false, nidStatus: 'rejected', status: 'rejected' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error rejecting NID:', error);
      alert(error.response?.data?.message || 'Failed to reject NID');
    }
  };

  const handleBlockUser = async (userId, block = true) => {
    if (!window.confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this user?`)) return;

    try {
      // Create block/unblock endpoint or use existing
      const response = await axios.put(`/admin/users/${userId}/status`, { 
        status: block ? 'blocked' : 'active' 
      });
      
      if (response.data.success) {
        alert(`User ${block ? 'blocked' : 'unblocked'} successfully!`);
        
        // Update the user in the list
        setAllUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, status: block ? 'blocked' : 'active' }
            : user
        ));
        
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, status: block ? 'blocked' : 'active' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(error.response?.data?.message || `Failed to ${block ? 'block' : 'unblock'} user`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const getNIDBadge = (nidVerified, nidNumber) => {
    if (!nidNumber || nidNumber === '') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No NID</span>;
    }
    
    return nidVerified ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Showing {users.length} of {allUsers.length} users
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              Grid
            </button>
          </div>
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Users</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Verified</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.donorUsers || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Donors</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.seekerUsers || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Seekers</div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-2xl font-bold text-indigo-600">{stats.adminUsers || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Admins</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, phone, or NID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === '') {
                  applyFilters(allUsers, '', roleFilter, statusFilter, nidFilter);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={roleFilter}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="donor">Donors</option>
              <option value="seeker">Seekers</option>
              <option value="admin">Admins</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={nidFilter}
              onChange={(e) => handleFilterChange('nid', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="all">All NID Status</option>
              <option value="verified">NID Verified</option>
              <option value="pending">NID Pending</option>
              <option value="no-nid">No NID</option>
            </select>
            
            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setNidFilter('all');
                  applyFilters(allUsers, '', 'all', 'all', 'all');
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Clear all filters"
              >
                <Filter className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'donor' ? 'bg-red-100 text-red-800' :
                          user.role === 'seeker' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Points: {user.totalPoints || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'seeker'?<span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>:getNIDBadge(user.nidVerified, user.nidNumber)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        
                          
                          {user.status !== 'blocked' ? (
                            <button 
                              onClick={() => handleBlockUser(user._id, true)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Block User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleBlockUser(user._id, false)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                              title="Unblock User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="mt-1">Try adjusting your search filters</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setRoleFilter('all');
                            setStatusFilter('all');
                            setNidFilter('all');
                            applyFilters(allUsers, '', 'all', 'all', 'all');
                          }}
                          className="mt-4 text-red-600 hover:text-red-800 font-medium"
                        >
                          Reset all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{user.name || 'No Name'}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getNIDBadge(user.nidVerified, user.nidNumber)}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'donor' ? 'bg-red-100 text-red-800' :
                    user.role === 'seeker' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {/* <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div> */}
                  {user.nidNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span>NID: {user.nidNumber}</span>
                    </div>
                  )}
                  {user.bloodGroup && (
                    <div className="flex items-center gap-2 text-sm">
                      <Droplet className="w-4 h-4 text-gray-400" />
                      <span>Blood Group: {user.bloodGroup}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined: {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Points:</span>
                    <span>{user.totalPoints || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <div className="flex gap-2">
                    {user.nidNumber && !user.nidVerified && (
                      <>
                        <button 
                          onClick={() => handleApproveNID(user._id)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Approve NID"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRejectNID(user._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Reject NID"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {user.isBlocked ? (
                      <button onClick={() => handleBlockUser(user._id, false)}>
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </button>
                    ) : (
                      <button onClick={() => handleBlockUser(user._id, true)}>
                        <Ban className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white rounded-xl shadow-md p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search filters</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setNidFilter('all');
                  applyFilters(allUsers, '', 'all', 'all', 'all');
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name}</h4>
                  <p className="text-gray-600 mb-4">{selectedUser.email}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">NID Status</p>
                      <div className="mt-1">{getNIDBadge(selectedUser.nidVerified, selectedUser.nidNumber)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Additional Information</h5>
                  <div className="space-y-2">
                    {selectedUser.nidNumber && (
                      <div>
                        <span className="text-sm text-gray-500">NID Number:</span>
                        <p className="font-medium">{selectedUser.nidNumber}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-sm text-gray-500">Total Points:</span>
                      <p className="font-medium">{selectedUser.totalPoints || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Joined Date:</span>
                      <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Account Information</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Email Verified:</span>
                      <p className="font-medium">{selectedUser.isVerified ? 'Yes' : 'Yes'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Account Type:</span>
                      <p className="font-medium capitalize">{selectedUser.role}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;