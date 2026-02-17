import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield } from 'lucide-react';

const ProfilePanel = ({ user }) => {
    return (
        <motion.div 
            className="fixed left-6 top-6 z-30"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            <Link to={user ? "/profile" : "/login"}>
                <div className="rounded-2xl p-3 flex items-center gap-4 border border-[#3a3a3a] bg-[#262626] hover:border-[#ffa116]/40 transition-all hover:bg-[#313131] shadow-xl group">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#ffa116]/30 to-[#7dd3fc]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#444444] group-hover:border-[#ffa116] transition-colors relative z-10">
                            {user?.profile?.avatar_url ? (
                                <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#373737] flex items-center justify-center text-slate-300">
                                    <User size={20} />
                                </div>
                            )}
                        </div>

                    </div>
                    
                    <div className="pr-2">
                        <div className="flex items-center gap-1.5">
                            <p className="text-white font-bold text-sm tracking-wide group-hover:text-[#ffa116] transition-colors">
                                {user?.username || 'Guest'}
                            </p>
                            {user && <Shield size={12} className="text-[#ffb84d] fill-[#ffb84d]/20" />}
                        </div>
                        {!user && (
                            <p className="text-slate-300 text-xs font-medium">
                                Tap to Login
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProfilePanel;
