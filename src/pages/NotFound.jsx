import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Search } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#FFD700] selection:text-black flex items-center justify-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
                    backgroundSize: '40px 40px' 
                }} 
            />
            
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 text-center p-8 max-w-2xl">
                <div className="mb-8 relative inline-block">
                    <h1 className="text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-[#FFD700] to-[#b8860b] drop-shadow-2xl">
                        404
                    </h1>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full h-1 bg-linear-to-r from-transparent via-[#FFD700] to-transparent opacity-50"></div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    This Realm Does Not Exist
                </h2>
                
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                    You seem to have ventured into the Void. The coordinates you are looking for have not been mapped yet, or perhaps they were destroyed in the last war.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        to="/home"
                        className="px-8 py-4 bg-linear-to-r from-[#FFD700] to-[#b8860b] hover:from-[#ffe033] hover:to-[#daa520] text-black font-black uppercase tracking-wider rounded-xl transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center gap-3"
                    >
                        <Home size={20} />
                        Return to Base
                    </Link>
                    
                    <button 
                        onClick={() => window.history.back()}
                        className="px-8 py-4 bg-[#1a1a1a] hover:bg-[#252525] text-white font-bold uppercase tracking-wider rounded-xl border border-[#333] hover:border-[#FFD700]/30 transition-all flex items-center gap-3 group"
                    >
                        <MapPin size={20} className="text-gray-500 group-hover:text-[#FFD700] transition-colors" />
                        Go Back
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 opacity-20">
                <Search size={100} className="text-[#FFD700]" />
            </div>
            <div className="absolute bottom-10 right-10 opacity-10">
                <h1 className="text-9xl font-black text-gray-800">?</h1>
            </div>
        </div>
    );
};

export default NotFound;
