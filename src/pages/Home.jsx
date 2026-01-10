import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Home = () => {
    const { user, isAuthenticated } = useAuthStore();

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans pt-20 pb-8"
            style={{ background: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 50%, #0a0a0a 100%)' }}>
            
            {/* Grass effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2d5a27] to-transparent opacity-50"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-24 left-10 text-5xl opacity-20">🏰</div>
            <div className="absolute top-32 right-12 text-4xl opacity-20">⚔️</div>
            <div className="absolute bottom-40 left-16 text-4xl opacity-15">💎</div>
            <div className="absolute bottom-48 right-20 text-5xl opacity-15">🛡️</div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {isAuthenticated ? (
                    /* Authenticated View */
                    <div className="rounded-2xl p-1" style={{ background: 'linear-gradient(180deg, #8B6914 0%, #5C4A0F 100%)' }}>
                        <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                            
                            {/* Header */}
                            <div className="relative py-5 px-4 text-center" style={{ background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)', borderBottom: '4px solid #1a3050' }}>
                                <h1 className="text-[#ffd700] text-xl font-black uppercase tracking-wider" 
                                    style={{ textShadow: '2px 2px 0 #8B6914' }}>
                                    Village Overview
                                </h1>
                            </div>

                            {/* Profile Section */}
                            <div className="p-6 relative" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #666 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                                
                                <div className="relative z-10">
                                    {/* Avatar with level badge */}
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#ffd700] shadow-lg">
                                            {user?.profile?.avatar_url ? (
                                                <img src={user.profile.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#ffd700]"
                                                    style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)' }}>
                                                    {user?.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        {/* Level badge */}
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-[#2d5a27]"
                                            style={{ background: 'linear-gradient(180deg, #5dbd3a 0%, #3d8a24 100%)' }}>
                                            1
                                        </div>
                                    </div>

                                    <h2 className="text-[#ffd700] text-xl font-bold text-center mb-1">{user?.username}</h2>
                                    <p className="text-[#c0b090] text-sm text-center mb-4">Village Chief</p>

                                    {/* Resources Bar */}
                                    <div className="flex justify-center gap-4 mb-6">
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                            <span className="text-lg">💰</span>
                                            <span className="text-[#ffd700] font-bold text-sm">5,000</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                            <span className="text-lg">💎</span>
                                            <span className="text-purple-300 font-bold text-sm">500</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                            <span className="text-lg">🏆</span>
                                            <span className="text-yellow-300 font-bold text-sm">0</span>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="p-4 rounded-xl text-center" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                            <div className="text-3xl mb-1">🏠</div>
                                            <div className="text-[#ffd700] font-bold">Town Hall</div>
                                            <div className="text-[#c0b090] text-sm">Level 1</div>
                                        </div>
                                        <div className="p-4 rounded-xl text-center" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                            <div className="text-3xl mb-1">⚔️</div>
                                            <div className="text-[#ffd700] font-bold">Battles</div>
                                            <div className="text-[#c0b090] text-sm">0 Won</div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link 
                                        to="/profile" 
                                        className="block w-full py-4 rounded-xl text-center text-white font-bold uppercase tracking-wide transition-all active:translate-y-1"
                                        style={{ 
                                            background: 'linear-gradient(180deg, #5dbd3a 0%, #3d8a24 100%)',
                                            boxShadow: '0 4px 0 #2d6a18, 0 6px 10px rgba(0,0,0,0.4)',
                                            border: '2px solid #6fd04a'
                                        }}
                                    >
                                        👤 View Profile
                                    </Link>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="py-3 px-4 text-center" style={{ background: 'linear-gradient(180deg, #2e2208 0%, #1a1308 100%)', borderTop: '2px solid #5C4A0F' }}>
                                <p className="text-[#8B6914] text-[10px] font-bold uppercase tracking-widest">
                                    ⚔️ Ready for Battle
                                </p>
                            </div>
                        </div>
                        
                        {/* Corner decorations */}
                        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                        <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                        <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                    </div>
                ) : (
                    /* Guest View */
                    <div className="rounded-2xl p-1 relative" style={{ background: 'linear-gradient(180deg, #8B6914 0%, #5C4A0F 100%)' }}>
                        <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                            
                            {/* Header */}
                            <div className="relative py-6 px-4 text-center" style={{ background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)', borderBottom: '4px solid #1a3050' }}>
                                <div className="text-6xl mb-2">⚔️</div>
                                <h1 className="text-[#ffd700] text-2xl font-black uppercase tracking-wider" 
                                    style={{ textShadow: '2px 2px 0 #8B6914' }}>
                                    Code of Clans
                                </h1>
                                <p className="text-white/70 text-sm mt-1">Build • Battle • Conquer</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 relative" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #666 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                                
                                <div className="relative z-10 text-center">
                                    <p className="text-[#c0b090] font-semibold mb-6">
                                        Join the ultimate coding battlefield!
                                    </p>

                                    {/* Feature icons */}
                                    <div className="flex justify-center gap-6 mb-6">
                                        <div className="text-center">
                                            <div className="w-14 h-14 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                                🏰
                                            </div>
                                            <span className="text-[#c0b090] text-xs">Build</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-14 h-14 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                                ⚔️
                                            </div>
                                            <span className="text-[#c0b090] text-xs">Battle</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-14 h-14 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', border: '2px solid #5C4A0F' }}>
                                                🏆
                                            </div>
                                            <span className="text-[#c0b090] text-xs">Conquer</span>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <Link 
                                        to="/login" 
                                        className="block w-full py-4 rounded-xl text-center text-white font-bold uppercase tracking-wide text-lg transition-all active:translate-y-1"
                                        style={{ 
                                            background: 'linear-gradient(180deg, #5dbd3a 0%, #3d8a24 100%)',
                                            boxShadow: '0 4px 0 #2d6a18, 0 6px 10px rgba(0,0,0,0.4)',
                                            border: '2px solid #6fd04a'
                                        }}
                                    >
                                        ⚔️ Start Playing
                                    </Link>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="py-3 px-4 text-center" style={{ background: 'linear-gradient(180deg, #2e2208 0%, #1a1308 100%)', borderTop: '2px solid #5C4A0F' }}>
                                <p className="text-[#8B6914] text-[10px] font-bold uppercase tracking-widest">
                                    🎮 Free to Play
                                </p>
                            </div>
                        </div>
                        
                        {/* Corner decorations */}
                        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                        <div className="absolute -bottom-2 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                        <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F]"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
