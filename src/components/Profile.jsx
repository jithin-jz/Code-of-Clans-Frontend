import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getProviderInfo = () => {
        const provider = user?.profile?.provider;
        const providers = {
            github: { name: 'GitHub', icon: '🐙' },
            google: { name: 'Google', icon: '🔵' },
            discord: { name: 'Discord', icon: '💬' },
        };
        return providers[provider] || { name: 'Unknown', icon: '👤' };
    };

    const providerInfo = getProviderInfo();

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans pt-20 pb-8"
            style={{ background: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 50%, #0a0a0a 100%)' }}>
            
            {/* Grass effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2d5a27] to-transparent opacity-50"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-24 left-8 text-4xl opacity-20">🏰</div>
            <div className="absolute top-40 right-12 text-3xl opacity-20">⚔️</div>
            <div className="absolute bottom-36 left-16 text-3xl opacity-15">💎</div>

            {/* Profile Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="rounded-2xl p-1" style={{ background: 'linear-gradient(180deg, #8B6914 0%, #5C4A0F 100%)' }}>
                    <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                        
                        {/* Header */}
                        <div className="relative py-5 px-4 text-center" style={{ background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)', borderBottom: '4px solid #1a3050' }}>
                            <h1 className="text-[#ffd700] text-xl font-black uppercase tracking-wider" 
                                style={{ textShadow: '2px 2px 0 #8B6914' }}>
                                Chief Profile
                            </h1>
                        </div>

                        {/* Content */}
                        <div className="p-6 relative" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #666 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                            
                            <div className="relative z-10">
                                {/* Avatar with decorative frame */}
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    {/* Outer ring */}
                                    <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, #ffd700 0%, #8B6914 100%)' }}></div>
                                    {/* Inner frame */}
                                    <div className="absolute inset-1 rounded-full" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)' }}></div>
                                    {/* Avatar */}
                                    <div className="absolute inset-2 rounded-full overflow-hidden">
                                        {user?.profile?.avatar_url ? (
                                            <img 
                                                src={user.profile.avatar_url} 
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#ffd700]"
                                                style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
                                                {user?.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    {/* Level badge */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white font-black text-sm border-2 border-[#2d5a27]"
                                        style={{ background: 'linear-gradient(180deg, #5dbd3a 0%, #3d8a24 100%)' }}>
                                        LVL 1
                                    </div>
                                </div>

                                {/* Name */}
                                <h2 className="text-[#ffd700] text-2xl font-black text-center mt-6 mb-1"
                                    style={{ textShadow: '1px 1px 0 #8B6914' }}>
                                    {user?.username}
                                </h2>
                                
                                {/* Provider Badge */}
                                <div className="flex justify-center mb-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                                        style={{ background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)', border: '2px solid #5080c0' }}>
                                        <span>{providerInfo.icon}</span>
                                        <span className="text-white font-bold text-sm">{providerInfo.name} Warrior</span>
                                    </div>
                                </div>

                                {/* Info Cards */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📧</span>
                                            <span className="text-[#c0b090] font-medium">Email</span>
                                        </div>
                                        <span className="text-[#ffd700] font-bold text-sm truncate max-w-[140px]">
                                            {user?.email || 'Hidden'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🆔</span>
                                            <span className="text-[#c0b090] font-medium">Chief ID</span>
                                        </div>
                                        <span className="text-[#ffd700] font-bold">#{user?.id}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">📅</span>
                                            <span className="text-[#c0b090] font-medium">Joined</span>
                                        </div>
                                        <span className="text-[#ffd700] font-bold text-sm">
                                            {user?.profile?.created_at 
                                                ? new Date(user.profile.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })
                                                : 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-6">
                                    <div className="p-3 rounded-xl text-center"
                                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #5C4A0F' }}>
                                        <div className="text-2xl">🏆</div>
                                        <div className="text-[#ffd700] font-bold">0</div>
                                        <div className="text-[#c0b090] text-xs">Trophies</div>
                                    </div>
                                    <div className="p-3 rounded-xl text-center"
                                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #5C4A0F' }}>
                                        <div className="text-2xl">⚔️</div>
                                        <div className="text-[#ffd700] font-bold">0</div>
                                        <div className="text-[#c0b090] text-xs">Battles</div>
                                    </div>
                                    <div className="p-3 rounded-xl text-center"
                                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #5C4A0F' }}>
                                        <div className="text-2xl">⭐</div>
                                        <div className="text-[#ffd700] font-bold">0</div>
                                        <div className="text-[#c0b090] text-xs">Stars</div>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button 
                                    onClick={handleLogout}
                                    className="w-full py-3 rounded-xl text-white font-bold uppercase tracking-wide transition-all active:translate-y-1"
                                    style={{ 
                                        background: 'linear-gradient(180deg, #dc3545 0%, #a71d2a 100%)',
                                        boxShadow: '0 4px 0 #7a1520, 0 6px 10px rgba(0,0,0,0.4)',
                                        border: '2px solid #e35d6a'
                                    }}
                                >
                                    🚪 Leave Village
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="py-3 px-4 text-center" style={{ background: 'linear-gradient(180deg, #2e2208 0%, #1a1308 100%)', borderTop: '2px solid #5C4A0F' }}>
                            <p className="text-[#8B6914] text-[10px] font-bold uppercase tracking-widest">
                                👑 Village Chief
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Corner decorations */}
                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
            </div>
        </div>
    );
};

export default Profile;
