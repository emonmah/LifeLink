import { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DonationHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/requests/donor');
            // Filter for completed donations primarily, but user might want to see all history
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const filteredHistory = history.filter(item => {
        if (filter === 'all') return true;
        return item.status === filter;
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/donor/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        {['all', 'completed', 'pending', 'accepted'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg capitalize transition-colors ${filter === status
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">Loading history...</p>
                    ) : filteredHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No donation history found</p>
                        </div>
                    ) : (
                        filteredHistory.map((item) => (
                            <div key={item._id} className="border border-gray-200 rounded-xl p-4 hover:border-red-200 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(item.requestDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-900 mb-1">
                                            {item.hospital || 'Hospital Name'}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {item.location || item.address}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {item.urgency} Priority
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {item.status === 'completed' && item.verified && (
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">+100 Points</p>
                                                <p className="text-xs text-gray-500">Verified</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonationHistory;
