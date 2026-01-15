import React from 'react';
import { BarChart2, Users, Settings, LogOut } from 'lucide-react';

const AdminSidebar = ({ user, activeTab, setActiveTab, handleLogout }) => {
    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} /> },
        { id: 'users', label: 'Users', icon: <Users size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="w-72 bg-[#1a1a1a]/90 backdrop-blur-xl border-r border-[#444] pt-8 fixed h-full z-20 flex flex-col shadow-2xl">
            <div className="px-6 pb-6 border-b border-[#333]">
                <div className="flex items-center gap-4 p-3 bg-linear-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl border border-[#333] shadow-inner">
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-[#ffd700] to-[#b8860b] flex items-center justify-center text-black font-black text-xl shadow-lg ring-1 ring-[#ffd700]/50">
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
                                ? 'bg-linear-to-r from-[#ffd700]/10 to-transparent text-[#ffd700] border-l-4 border-[#ffd700]' 
                                : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200 border-l-4 border-transparent'
                        }`}
                    >
                        <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
                        <span className="font-bold tracking-wide">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-[#333] space-y-2 bg-[#1a1a1a]/50">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-semibold text-sm mt-2"
                >
                    <LogOut size={18} />
                    <span>Leave Realm</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
