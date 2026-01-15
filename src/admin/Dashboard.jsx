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
        { label: 'Total Users', value: '0', icon: '👥' },
        { label: 'Active Sessions', value: '0', icon: '⚡' },
        { label: 'OAuth Logins', value: '0', icon: '🔐' },
        { label: 'Total Gems', value: '0', icon: '💎' },
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
                if (stat.label === 'Total Users') return { ...stat, value: response.data.length };
                return stat;
            }));
            
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setTableLoading(false);
        }
    };

    const handleBlockToggle = (username) => {
        const currentUser = userList.find(u => u.username === username);
        const action = currentUser?.is_active ? 'ban' : 'unban';
        
        notify.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-[#1a1a1a] border border-[#FFD700]/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-auto backdrop-blur-xl relative overflow-hidden`}
                style={{
                    boxShadow: '0 0 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1)'
                }}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-20"></div>
                
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <span className="text-[#FFD700]">⚠️</span> Confirm Command
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                    Are you sure you want to <span className={action === 'ban' ? "text-red-400 font-bold uppercase" : "text-emerald-400 font-bold uppercase"}>{action}</span> the inhabitant <span className="text-white font-bold">{username}</span>?
                </p>
                
                <div className="flex gap-3 justify-end">
                    <button 
                        onClick={() => notify.dismiss(t.id)}
                        className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            notify.dismiss(t.id);
                            confirmBlockToggle(username);
                        }}
                        className={`px-6 py-2 rounded-xl font-bold transition-all shadow-lg text-xs uppercase tracking-wider active:transform active:scale-95 text-white ${
                            action === 'ban' 
                                ? 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/20' 
                                : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20'
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const confirmBlockToggle = async (username) => {
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
        <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#FFD700] selection:text-black overflow-hidden flex">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-20 pointer-events-none z-0" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
                    backgroundSize: '40px 40px' 
                }} 
            />
            
            {/* Sidebar - Command Center Panel style */}
            <aside className="w-72 bg-[#1a1a1a]/90 backdrop-blur-xl border-r border-[#444] pt-8 fixed h-full z-20 flex flex-col shadow-2xl">
                <div className="px-6 pb-6 border-b border-[#333]">
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl border border-[#333] shadow-inner">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center text-black font-black text-xl shadow-lg ring-1 ring-[#ffd700]/50">
                            {user?.profile?.avatar_url ? (
                                <img src={user.profile.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                            ) : (
                                user?.username?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[#e2e2e2] font-bold truncate text-base">{user?.username}</p>
                            <p className="text-[#ffd700] text-xs font-medium tracking-wide uppercase">Grand Warden</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group ${
                                activeTab === item.id 
                                    ? 'bg-gradient-to-r from-[#ffd700]/10 to-transparent text-[#ffd700] border-l-4 border-[#ffd700]' 
                                    : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200 border-l-4 border-transparent'
                            }`}
                        >
                            <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
                            <span className="font-bold tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#333] space-y-2 bg-[#1a1a1a]/50">
                    <a 
                        href={import.meta.env.VITE_ADMIN_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#ffd700] hover:bg-[#2a2a2a] rounded-xl transition-all font-semibold text-sm"
                    >
                        <span className="text-lg">🛠️</span>
                        <span>Django Admin</span>
                    </a>
                    <Link 
                        to="/home"
                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-400 hover:bg-[#2a2a2a] rounded-xl transition-all font-semibold text-sm"
                    >
                        <span className="text-lg">🏠</span>
                        <span>Kingdom Base</span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-semibold text-sm mt-2"
                    >
                        <span className="text-lg">🚪</span>
                        <span>Leave Realm</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 relative z-10 overflow-y-auto h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 bg-gradient-to-r from-[#1a1a1a] to-transparent p-6 rounded-2xl border border-[#333] shadow-xl">
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-[#b8860b] uppercase tracking-wider filter drop-shadow-sm">
                            Command Center
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">Overview of your realm's population and resources.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl p-6 border border-[#333] hover:border-[#ffd700]/30 transition-all duration-300 group shadow-lg hover:shadow-[#ffd700]/5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-white group-hover:text-[#ffd700] transition-colors">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a2a2a] to-[#151515] border border-[#333] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users Table */}
                {(activeTab === 'users' || activeTab === 'overview') && (
                    <div className="bg-[#1a1a1a]/90 backdrop-blur-md rounded-2xl border border-[#333] shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#333] flex items-center justify-between bg-gradient-to-r from-[#202020] to-transparent">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <span className="text-[#ffd700]">👥</span> Realm Inhabitants
                            </h2>
                            <button 
                                onClick={fetchUsers} 
                                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ffd700] text-sm font-bold rounded-lg border border-[#444] hover:border-[#ffd700] transition-all flex items-center gap-2"
                            >
                                <span>🔄</span> Refresh Intel
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#151515]">
                                    <tr>
                                        <th className="text-left text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Warrior</th>
                                        <th className="text-left text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Rank</th>
                                        <th className="text-left text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Status</th>
                                        <th className="text-right text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Command</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#333]">
                                    {tableLoading ? (
                                        <tr><td colSpan="4" className="text-center py-12"><Loader isLoading={true}/></td></tr>
                                    ) : userList.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-12 text-gray-500 font-medium">No inhabitants found in this realm.</td></tr>
                                    ) : (
                                        userList.map((usr, i) => (
                                            <tr key={i} className="hover:bg-[#222] transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#333] to-[#1a1a1a] p-0.5 border border-[#444] group-hover:border-[#ffd700]/50 transition-colors">
                                                            <div className="w-full h-full rounded-[0.4rem] overflow-hidden flex items-center justify-center bg-[#111] text-[#ffd700] font-bold">
                                                                {usr.profile?.avatar_url ? <img src={usr.profile.avatar_url} className="w-full h-full object-cover"/> : usr.username[0].toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-sm group-hover:text-[#ffd700] transition-colors">{usr.username}</p>
                                                            <p className="text-gray-600 text-xs font-mono">{usr.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex gap-2">
                                                        {usr.is_superuser && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wide">Supreme Leader</span>}
                                                        {usr.is_staff && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/20 uppercase tracking-wide">Elder</span>}
                                                        {!usr.is_staff && !usr.is_superuser && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-500/10 text-gray-500 border border-gray-500/20 uppercase tracking-wide">Member</span>}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                                        usr.is_active 
                                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                        {usr.is_active ? 'Active' : 'Banned'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button 
                                                        onClick={() => handleBlockToggle(usr.username)}
                                                        disabled={user.username === usr.username} 
                                                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border ${
                                                            user.username === usr.username 
                                                                ? 'opacity-30 cursor-not-allowed bg-transparent border-gray-700 text-gray-500'
                                                                : usr.is_active 
                                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50' 
                                                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                                                        }`}
                                                    >
                                                        {usr.is_active ? '🔨 Ban' : '🔓 Unban'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
