// src/pages/admin/reports/AdminReports.jsx
import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, Droplet, Activity, TrendingUp } from 'lucide-react';

const AdminReports = () => {
    // Mock Data for Reports
    const bloodGroupData = [
        { name: 'A+', value: 35 },
        { name: 'B+', value: 30 },
        { name: 'O+', value: 45 },
        { name: 'AB+', value: 15 },
        { name: 'A-', value: 10 },
        { name: 'B-', value: 12 },
        { name: 'O-', value: 20 },
        { name: 'AB-', value: 5 },
    ];

    const monthlyDonations = [
        { name: 'Jan', donations: 65, requests: 80 },
        { name: 'Feb', donations: 59, requests: 75 },
        { name: 'Mar', donations: 80, requests: 90 },
        { name: 'Apr', donations: 81, requests: 85 },
        { name: 'May', donations: 56, requests: 70 },
        { name: 'Jun', donations: 95, requests: 110 },
        { name: 'Jul', donations: 100, requests: 125 },
    ];

    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#E7E9ED'];

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
                <p className="text-gray-600 mt-2">Analytics and donation statistics</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Donations</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">1,245</h3>
                            <p className="text-xs text-green-600 mt-2 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12% this month
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Droplet className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">New Donors</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">85</h3>
                            <p className="text-xs text-green-600 mt-2 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +5% this month
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Requests Fulfilled</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">92%</h3>
                            <p className="text-xs text-gray-500 mt-2">
                                8% pending/cancelled
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">1.5h</h3>
                            <p className="text-xs text-green-600 mt-2 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Improved by 10%
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Activity className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Donation Trends */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Donation & Request Trends</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyDonations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="donations" stroke="#ef4444" strokeWidth={2} name="Donations" />
                                <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Blood Group Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Donor Distribution by Blood Group</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bloodGroupData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {bloodGroupData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
