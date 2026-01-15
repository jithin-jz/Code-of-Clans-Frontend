import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

import { authAPI } from '../services/api';
import Loader from '../common/Loader';
import { notify } from '../services/notification';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // Default to users for now
    
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: '👥', change: 'Calculating...', color: 'bg-blue-500' },
        { label: 'Active Sessions', value: '0', icon: '⚡', change: 'Online now', color: 'bg-green-500' },
        { label: 'OAuth Logins', value: '0', icon: '🔐', change: 'Last 24 hours', color: 'bg-purple-500' },
        { label: 'Total Gems', value: '0', icon: '💎', change: 'In circulation', color: 'bg-pink-500' },
    ]);
    
    const [userList, setUserList] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

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
            } else {
                fetchUsers();
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

    const fetchUsers = async () => {
        setTableLoading(true);
        try {
            const response = await authAPI.getUsers();
            setUserList(response.data);
            
            // Update simple stats
            setStats(prev => prev.map(stat => {
                if (stat.label === 'Total Users') return { ...stat, value: response.data.length, change: 'Updated just now' };
                return stat;
            }));
            
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setTableLoading(false);
        }
    };

    const handleBlockToggle = async (username) => {
        if (!window.confirm(`Are you sure you want to toggle block status for ${username}?`)) return;
        
        try {
            await authAPI.toggleBlockUser(username);
            notify.success(`User status updated for ${username}`);
            // Refresh list
            fetchUsers();
        } catch (error) {
            notify.error(error.response?.data?.error || "Failed to toggle block status");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) {
        return <Loader isLoading={true} />;
    }

    if (!user?.is_staff && !user?.is_superuser) {
        return null;
    }

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 pt-20 fixed h-full z-20">
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-8 p-3 bg-gray-700/50 rounded-xl">
                        {user?.profile?.avatar_url ? (
                            <img src={user.profile.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
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
                            href={import.meta.env.VITE_ADMIN_URL} 
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
                {activeTab === 'overview' && (
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
                )}

                {/* Users Table */}
                {(activeTab === 'users' || activeTab === 'overview') && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white">All Users</h2>
                                <button onClick={fetchUsers} className="text-blue-400 text-sm hover:text-blue-300">Refresh</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700/50">
                                        <tr>
                                            <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">User</th>
                                            <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Roles</th>
                                            <th className="text-left text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Status</th>
                                            <th className="text-right text-gray-400 text-xs font-medium uppercase tracking-wider px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {tableLoading ? (
                                            <tr><td colSpan="4" className="text-center py-8 text-gray-500"><Loader isLoading={true}/></td></tr>
                                        ) : userList.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">No users found.</td></tr>
                                        ) : (
                                            userList.map((usr, i) => (
                                                <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                                                {usr.profile?.avatar_url ? <img src={usr.profile.avatar_url} className="w-full h-full object-cover"/> : usr.username[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium text-sm">{usr.username}</p>
                                                                <p className="text-gray-500 text-xs">{usr.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            {usr.is_superuser && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 uppercase">Superuser</span>}
                                                            {usr.is_staff && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 uppercase">Staff</span>}
                                                            {!usr.is_staff && !usr.is_superuser && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 uppercase">User</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            usr.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {usr.is_active ? 'Active' : 'Blocked'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleBlockToggle(usr.username)}
                                                            disabled={user.username === usr.username} // Cannot block self
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                                                user.username === usr.username 
                                                                    ? 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-500'
                                                                    : usr.is_active 
                                                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                            }`}
                                                        >
                                                            {usr.is_active ? 'Block' : 'Unblock'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
