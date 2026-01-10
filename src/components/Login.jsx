import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

// SVG Icons for providers
const GithubIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#5865F2">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { user, loading, openOAuthPopup, checkAuth, isAuthenticated } = useAuthStore();


    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.origin !== window.location.origin) return;
            const { type, provider, error } = event.data;
            if (type === 'oauth-success') {
                await checkAuth();
                // Get fresh user data and redirect based on role
                const currentUser = useAuthStore.getState().user;
                if (currentUser?.is_staff || currentUser?.is_superuser) {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/home', { replace: true });
                }
            } else if (type === 'oauth-error') {
                console.error(`OAuth error from ${provider}:`, error);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [checkAuth, navigate]);


    useEffect(() => {
        if (isAuthenticated) {
            // Redirect admins to command center
            if (user?.is_staff || user?.is_superuser) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleOAuthClick = async (provider) => {
        await openOAuthPopup(provider);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans"
            style={{ background: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 50%, #0a0a0a 100%)' }}>
            
            {/* Animated grass/ground effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2d5a27] to-transparent opacity-50"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">⚔️</div>
            <div className="absolute top-20 right-16 text-5xl opacity-20 animate-pulse delay-500">🛡️</div>
            <div className="absolute bottom-32 left-20 text-4xl opacity-20">🏰</div>
            <div className="absolute bottom-40 right-24 text-4xl opacity-20">⛏️</div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-sm mx-4">
                {/* Wood frame outer border */}
                <div className="rounded-2xl p-1" style={{ background: 'linear-gradient(180deg, #8B6914 0%, #5C4A0F 100%)' }}>
                    {/* Inner wood texture */}
                    <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(180deg, #4a3810 0%, #2e2208 100%)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                        
                        {/* Header Banner */}
                        <div className="relative py-6 px-4 text-center" style={{ background: 'linear-gradient(180deg, #3d6cb3 0%, #2a4d80 100%)', borderBottom: '4px solid #1a3050' }}>
                            {/* Ribbon ends */}
                            <div className="absolute left-0 top-0 bottom-0 w-4" style={{ background: 'linear-gradient(90deg, #2a4d80 0%, transparent 100%)' }}></div>
                            <div className="absolute right-0 top-0 bottom-0 w-4" style={{ background: 'linear-gradient(-90deg, #2a4d80 0%, transparent 100%)' }}></div>
                            
                            <div className="text-5xl mb-2">⚔️</div>
                            <h1 className="text-[#ffd700] text-2xl font-black uppercase tracking-wider" 
                                style={{ textShadow: '2px 2px 0 #8B6914, -1px -1px 0 #8B6914, 1px -1px 0 #8B6914, -1px 1px 0 #8B6914' }}>
                                Code of Clans
                            </h1>
                            <p className="text-white/70 text-sm mt-1">Battle with Code!</p>
                        </div>

                        {/* Content Area - Stone texture */}
                        <div className="p-6 relative" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)' }}>
                            {/* Stone texture overlay */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #666 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                            
                            <div className="relative z-10">
                                <p className="text-center text-[#c0b090] font-semibold text-sm mb-6">
                                    Choose your alliance to enter the battlefield!
                                </p>

                                {/* OAuth Buttons */}
                                <div className="space-y-3">
                                    {/* GitHub */}
                                    <button
                                        onClick={() => handleOAuthClick('github')}
                                        disabled={loading}
                                        className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-bold uppercase tracking-wide transition-all active:translate-y-1"
                                        style={{ 
                                            background: 'linear-gradient(180deg, #333 0%, #1a1a1a 100%)',
                                            boxShadow: '0 4px 0 #000, 0 6px 10px rgba(0,0,0,0.4)',
                                            border: '2px solid #444'
                                        }}
                                    >
                                        <GithubIcon />
                                        <span>GitHub Warriors</span>
                                    </button>

                                    {/* Google */}
                                    <button
                                        onClick={() => handleOAuthClick('google')}
                                        disabled={loading}
                                        className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-gray-800 font-bold uppercase tracking-wide transition-all active:translate-y-1"
                                        style={{ 
                                            background: 'linear-gradient(180deg, #fff 0%, #e8e8e8 100%)',
                                            boxShadow: '0 4px 0 #bbb, 0 6px 10px rgba(0,0,0,0.4)',
                                            border: '2px solid #ddd'
                                        }}
                                    >
                                        <GoogleIcon />
                                        <span>Google Legion</span>
                                    </button>

                                    {/* Discord */}
                                    <button
                                        onClick={() => handleOAuthClick('discord')}
                                        disabled={loading}
                                        className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-bold uppercase tracking-wide transition-all active:translate-y-1"
                                        style={{ 
                                            background: 'linear-gradient(180deg, #5865F2 0%, #4752c4 100%)',
                                            boxShadow: '0 4px 0 #3d48a8, 0 6px 10px rgba(0,0,0,0.4)',
                                            border: '2px solid #6b74f5'
                                        }}
                                    >
                                        <DiscordIcon />
                                        <span>Discord Clan</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="py-3 px-4 text-center" style={{ background: 'linear-gradient(180deg, #2e2208 0%, #1a1308 100%)', borderTop: '2px solid #5C4A0F' }}>
                            <p className="text-[#8B6914] text-[10px] font-bold uppercase tracking-widest">
                                🔒 Secured by Magic
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Corner decorations */}
                <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F] shadow-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F] shadow-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F] shadow-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-[#ffd700] to-[#8B6914] border-2 border-[#5C4A0F] shadow-lg"></div>
            </div>

            {/* TOS */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/30 text-xs">
                    By playing, you agree to our <a href="#" className="text-[#ffd700]/50 hover:text-[#ffd700]">Terms</a> & <a href="#" className="text-[#ffd700]/50 hover:text-[#ffd700]">Privacy</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
