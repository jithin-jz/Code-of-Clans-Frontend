import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getProviderInfo = () => {
        const provider = user?.profile?.provider;
        const providers = {
            github: { icon: '🐙', label: 'GitHub' },
            google: { icon: '🔵', label: 'Google' },
            discord: { icon: '💬', label: 'Discord' },
        };
        return providers[provider] || { icon: '👤', label: 'Unknown' };
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50" 
            style={{ 
                background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)',
                borderBottom: '3px solid #8B6914',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="text-2xl group-hover:scale-110 transition-transform">⚔️</div>
                    <span className="text-[#ffd700] font-black text-lg uppercase tracking-wide hidden sm:inline"
                        style={{ textShadow: '1px 1px 0 #8B6914' }}>
                        Code of Clans
                    </span>
                </Link>

                {/* Resources (only when authenticated) */}
                {isAuthenticated && (
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <span>💰</span>
                            <span className="text-[#ffd700] font-bold text-sm">5,000</span>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <span>💎</span>
                            <span className="text-purple-300 font-bold text-sm">500</span>
                        </div>
                    </div>
                )}

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
                                style={{ 
                                    background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)',
                                    border: '2px solid #5080c0'
                                }}
                            >
                                {user?.profile?.avatar_url ? (
                                    <img 
                                        src={user.profile.avatar_url} 
                                        alt={user.username}
                                        className="w-8 h-8 rounded-lg object-cover border-2 border-[#ffd700]"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#ffd700] font-bold text-sm"
                                        style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)' }}>
                                        {user?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <span className="text-white text-sm font-bold hidden sm:inline max-w-[80px] truncate">
                                    {user?.username}
                                </span>
                                <svg className={`w-4 h-4 text-white/70 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
                                    style={{ 
                                        background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)',
                                        border: '2px solid #8B6914'
                                    }}>
                                    {/* User Info Header */}
                                    <div className="p-4" style={{ background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)', borderBottom: '2px solid #8B6914' }}>
                                        <div className="flex items-center gap-3">
                                            {user?.profile?.avatar_url ? (
                                                <img src={user.profile.avatar_url} alt="" className="w-12 h-12 rounded-xl border-2 border-[#ffd700]" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#ffd700] font-bold text-lg"
                                                    style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)' }}>
                                                    {user?.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold truncate">{user?.username}</p>
                                                <p className="text-white/60 text-xs truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 inline-flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded text-xs text-white/80 font-medium">
                                            {getProviderInfo().icon} {getProviderInfo().label}
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-2">
                                        <Link 
                                            to="/profile" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-[#c0b090] hover:text-[#ffd700] hover:bg-black/20 rounded-lg transition-colors"
                                        >
                                            <span className="text-lg">👤</span>
                                            <span className="font-medium">Profile</span>
                                        </Link>
                                        <Link 
                                            to="/home" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 text-[#c0b090] hover:text-[#ffd700] hover:bg-black/20 rounded-lg transition-colors"
                                        >
                                            <span className="text-lg">🏠</span>
                                            <span className="font-medium">Village</span>
                                        </Link>
                                        {(user?.is_staff || user?.is_superuser) && (
                                            <Link 
                                                to="/admin/dashboard" 
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <span className="text-lg">👑</span>
                                                <span className="font-medium">Command Center</span>
                                            </Link>
                                        )}
                                        <div className="h-px bg-[#8B6914]/50 my-2"></div>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <span className="text-lg">🚪</span>
                                            <span className="font-medium">Leave Village</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link 
                            to="/login" 
                            className="px-5 py-2 rounded-xl text-white font-bold uppercase text-sm tracking-wide transition-all active:translate-y-1"
                            style={{ 
                                background: 'linear-gradient(180deg, #5dbd3a 0%, #3d8a24 100%)',
                                boxShadow: '0 3px 0 #2d6a18',
                                border: '2px solid #6fd04a'
                            }}
                        >
                            ⚔️ Play Now
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
