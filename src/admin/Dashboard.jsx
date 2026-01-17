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
        
        notify.warning("Confirm Action", {
            description: `Are you sure you want to ${action} the inhabitant ${username}?`,
            action: {
                label: 'Confirm',
                onClick: () => confirmBlockToggle(username),
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {},
            },
        });
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
        <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-white selection:text-black flex">
            
            <AdminSidebar 
                user={user} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                handleLogout={handleLogout} 
            />

            <main className="flex-1 overflow-y-auto h-screen bg-black">
                <div className="container mx-auto p-6 max-w-[1600px]">
                    <div className="flex items-center justify-between mb-8 pt-2">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                            <p className="text-gray-400 mt-1">Manage users and view system statistics.</p>
                        </div>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <StatsGrid stats={stats} />
                            {/* You could add a chart here in the future */}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="flex-1">
                             <UserTable 
                                userList={userList} 
                                tableLoading={tableLoading} 
                                currentUser={user}
                                handleBlockToggle={handleBlockToggle}
                                fetchUsers={fetchUsers}
                            />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                         <div className="text-white">Settings panel coming soon.</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
