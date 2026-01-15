import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { authAPI } from '../services/api';
import { notify } from '../services/notification';
import Loader from '../common/Loader';

import { Users, Zap, Lock, Gem, AlertTriangle } from 'lucide-react';

// Components
import AdminSidebar from './AdminSidebar';
import StatsGrid from './StatsGrid';
import UserTable from './UserTable';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); 
    
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: <Users size={24} /> },
        { label: 'Active Sessions', value: '0', icon: <Zap size={24} /> },
        { label: 'OAuth Logins', value: '0', icon: <Lock size={24} /> },
        { label: 'Total Gems', value: '0', icon: <Gem size={24} /> },
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
        const currentUserData = userList.find(u => u.username === username);
        const action = currentUserData?.is_active ? 'ban' : 'unban';
        
        notify.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-[#1a1a1a] border border-[#FFD700]/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-auto backdrop-blur-xl relative overflow-hidden`}
                style={{
                    boxShadow: '0 0 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1)'
                }}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#FFD700] to-transparent opacity-20"></div>
                
                <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="text-[#FFD700]" size={24} />
                    <span>Confirm Command</span>
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
            fetchUsers();
        } catch (error) {
            notify.error(error.response?.data?.error || "Failed to toggle block status");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (loading) return <Loader isLoading={true} />;
    if (!user?.is_staff && !user?.is_superuser) return null;

    return (
        <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#FFD700] selection:text-black overflow-hidden flex">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-20 pointer-events-none z-0" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
                    backgroundSize: '40px 40px' 
                }} 
            />
            
            <AdminSidebar 
                user={user} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                handleLogout={handleLogout} 
            />

            <main className="flex-1 ml-72 p-8 relative z-10 overflow-y-auto h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-10 bg-linear-to-r from-[#1a1a1a] to-transparent p-6 rounded-2xl border border-[#333] shadow-xl">
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#ffd700] to-[#b8860b] uppercase tracking-wider filter drop-shadow-sm">
                            Command Center
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">Overview of your realm's population and resources.</p>
                    </div>
                </div>

                {activeTab === 'overview' && <StatsGrid stats={stats} />}

                {activeTab === 'users' && (
                    <UserTable 
                        userList={userList} 
                        tableLoading={tableLoading} 
                        currentUser={user}
                        handleBlockToggle={handleBlockToggle}
                        fetchUsers={fetchUsers}
                    />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
