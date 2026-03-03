import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { CheckCircle, Clock, XCircle, AlertCircle, Filter, Search, Calendar } from 'lucide-react';

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get('/admin/requests');
      setDonations(res.data.requests);

      // setDonations(mockDonations); // Removed mock data set
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const getStatusBadge = (status, verified) => {
    if (status === 'completed' && verified) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
    }
    if (status === 'completed' && !verified) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending Verification</span>;
    }
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  /* const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'accepted': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  }; */

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch =
      donation.donor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.seeker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'pending-verification' ? donation.status === 'completed' && !donation.verified :
        statusFilter === donation.status);

    return matchesSearch && matchesStatus;
  });

  const handleVerify = async (donationId) => {
    try {
      await axios.post(`/admin/requests/${donationId}/verify`);
      alert(`Donation verified and points awarded!`);
      fetchDonations();
    } catch (error) {
      alert(error.response?.data?.msg || 'Error verifying donation');
    }
  };

  const getProofUrl = (path) => {
    if (!path) return null;

    // Handle absolute Windows paths
    let cleanPath = path;
    const uploadIndex = path.indexOf('uploads');
    if (uploadIndex !== -1) {
      cleanPath = path.substring(uploadIndex);
    }

    // Replace backslashes
    cleanPath = cleanPath.replace(/\\/g, '/');

    return `http://localhost:8080/${cleanPath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donation Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and verify blood donation requests
          </p>
        </div>
        <a
          href="/admin/donations/verify"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Verify Proofs
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by donor, seeker, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="pending-verification">Pending Verification</option>
              <option value="verified">Verified</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </button>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDonations.map((donation) => (
          <div key={donation._id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Donation Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {donation.bloodGroup} Donation
                    </h3>
                    <p className="text-gray-600">{donation.hospital}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(donation.status, donation.verified)}
                    {donation.status === 'completed' && !donation.verified && (
                      <button
                        onClick={() => handleVerify(donation._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Donor</p>
                    <p className="font-medium">{donation.donor?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{donation.donor?.email}</p>
                    <p className="text-sm text-gray-600">{donation.donor?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Seeker</p>
                    <p className="font-medium">{donation.seeker?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{donation.seeker?.email}</p>
                    <p className="text-sm text-gray-600">{donation.seeker?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Needed</p>
                    <p className="font-medium text-red-600">{donation.bloodGroup || 'Unknown'}</p>
                    <p className="font-medium ">{donation.urgency || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Request Date</p>
                    <p className="font-medium">{formatDate(donation.requestDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Donation Date</p>
                    <p className="font-medium">{formatDate(donation.donationDate)}</p>
                  </div>
                </div>
                {donation.proofDocumentUrl && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Proof of Donation</p>
                    <a
                      href={getProofUrl(donation.proofDocumentUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      View Document
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                {donation.status === 'completed' && donation.verified && (
                  <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm flex items-center gap-1 justify-center">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No donations found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

export default DonationList;