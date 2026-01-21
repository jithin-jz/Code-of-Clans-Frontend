import React from 'react';
import { BarChart2, Users, Settings, LogOut, Shield, Layers } from 'lucide-react';
import { Button } from '../components/ui/button';

const AdminSidebar = ({ user, activeTab, setActiveTab, handleLogout }) => {
const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart2 size={18} /> },
        { id: 'users', label: 'Users', icon: <Users size={18} /> },
        { id: 'tasks', label: 'Tasks', icon: <Layers size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ];

    return (
        <aside className="w-64 h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col shrink-0 sticky top-0">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-white/10 text-white">
                <span className="font-bold text-lg tracking-tight">Admin Console</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {sidebarItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                            activeTab === item.id 
                                ? 'bg-[#1a1a1a] text-white' 
                                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]/50'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-white/10 mt-auto">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-sm bg-[#1a1a1a] flex items-center justify-center text-white border border-white/10">
                         {user?.profile?.avatar_url ? (
                            <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover rounded-sm" />
                        ) : (
                            <span className="text-xs font-bold">{user?.username?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{user?.username}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Shield size={10} /> Admin
                        </span>
                    </div>
                </div>

                <Button 
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-start gap-2 h-9 rounded-sm border-white/10 text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                >
                    <LogOut size={16} />
                    <span>Log out</span>
                </Button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
