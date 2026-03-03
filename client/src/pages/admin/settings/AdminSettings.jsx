import { useState } from 'react';
import { Save, Shield, AlertTriangle, Download, Database } from 'lucide-react';

const AdminSettings = () => {
    const [systemConfig, setSystemConfig] = useState({
        pointsPerDonation: 50,
        minDaysBetweenDonations: 90,
        maintenanceMode: false,
        registrationOpen: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSystemConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        alert('System configuration saved successfully!');
        // API call to save config would go here
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                <p className="text-gray-600 mt-2">Configure global system parameters</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Configuration */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-500" />
                        System Rules
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Points per Donation</label>
                            <input
                                type="number"
                                name="pointsPerDonation"
                                value={systemConfig.pointsPerDonation}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Points awarded to donor after successful donation</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Days Between Donations</label>
                            <input
                                type="number"
                                name="minDaysBetweenDonations"
                                value={systemConfig.minDaysBetweenDonations}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Standard medical requirement</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Control */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Database className="w-5 h-5 text-gray-500" />
                        System Control
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Maintenance Mode</p>
                                <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={systemConfig.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">New Registrations</p>
                                <p className="text-sm text-gray-500">Allow new users to sign up</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="registrationOpen"
                                    checked={systemConfig.registrationOpen}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div className="pt-4">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full justify-center">
                                <Download className="w-4 h-4" />
                                Export System Logs
                            </button>
                        </div>

                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mt-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-700">
                                    Changing system parameters may affect ongoing functionality. Proceed with caution.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
