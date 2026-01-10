import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const verifyAdmin = async () => {
            await checkAuth();
            setLoading(false);
        };
        verifyAdmin();
    }, [checkAuth]);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                navigate('/login');
            } else if (!user?.is_staff && !user?.is_superuser) {
                navigate('/home');
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user?.is_staff && !user?.is_superuser) {
        return null;
    }

    const stats = [
        { label: 'Total Users', value: '6', icon: '👥', change: '+2 this week', color: 'bg-blue-500' },
        { label: 'Active Sessions', value: '3', icon: '⚡', change: 'Online now', color: 'bg-green-500' },
        { label: 'OAuth Logins', value: '12', icon: '🔐', change: 'Last 24 hours', color: 'bg-purple-500' },
        { label: 'Total Gems', value: '3,000', icon: '💎', change: 'In circulation', color: 'bg-pink-500' },
    ];

    const recentUsers = [
        { username: 'exkiraaa', email: 'exkiraaa@gmail.com', provider: 'Google', status: 'Staff', time: 'Just now' },
        { username: 'jithin-jz', email: 'jithin@gmail.com', provider: 'Google', status: 'Active', time: '5 min ago' },
        { username: 'ex_kira', email: 'ex_kira@github.com', provider: 'GitHub', status: 'Active', time: '1 hour ago' },
        { username: 'jzdieheart', email: 'jzdieheart@discord.com', provider: 'Discord', status: 'Active', time: '2 hours ago' },
    ];

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 pt-20 fixed h-full">
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-8 p-3 bg-gray-700/50 rounded-xl">
                        {user?.profile?.avatar_url ? (
                            <img src={user.profile.avatar_url} alt="" className="w-10 h-10 rounded-lg" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate text-sm">{user?.username}</p>
                            <p className="text-gray-400 text-xs">Administrator</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {sidebarItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                    activeTab === item.id 
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-700">
                        <a 
                            href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:8000/admin/'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all"
                        >
                            <span className="text-xl">🛠️</span>
                            <span className="font-medium">Django Admin</span>
                        </a>
                        <Link 
                            to="/home"
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all"
                        >
                            <span className="text-xl">🏠</span>
                            <span className="font-medium">Back to App</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            <span className="text-xl">🚪</span>
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 pt-20 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">Welcome back, {user?.username}. Here's what's happening.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            ● System Online
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                                    <p className="text-gray-500 text-xs mt-2">{stat.change}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Users Table */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Recent Users</h2>
                            <button className="text-blue-400 text-sm hover:text-blue-300">View All →</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">User</th>
                                        <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Provider</th>
                                        <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Status</th>
                                        <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {recentUsers.map((user, i) => (
                                        <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{user.username}</p>
                                                        <p className="text-gray-500 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                                    user.provider === 'Google' ? 'bg-blue-500/20 text-blue-400' :
                                                    user.provider === 'GitHub' ? 'bg-gray-600 text-gray-300' :
                                                    'bg-indigo-500/20 text-indigo-400'
                                                }`}>
                                                    {user.provider === 'Google' && '🔵'}
                                                    {user.provider === 'GitHub' && '🐙'}
                                                    {user.provider === 'Discord' && '💬'}
                                                    {user.provider}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    user.status === 'Staff' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">{user.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            <button className="w-full flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all">
                                <span className="text-xl">➕</span>
                                <span className="font-medium">Add New User</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-all">
                                <span className="text-xl">📧</span>
                                <span className="font-medium">Send Broadcast</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/20 transition-all">
                                <span className="text-xl">📊</span>
                                <span className="font-medium">Export Data</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 hover:bg-orange-500/20 transition-all">
                                <span className="text-xl">🔄</span>
                                <span className="font-medium">Sync Database</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
