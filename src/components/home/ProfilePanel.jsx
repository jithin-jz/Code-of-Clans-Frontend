import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Button3D } from '../common';

const ProfilePanel = ({ user }) => {
    return (
        <motion.div 
            className="fixed left-4 top-4 z-30 flex flex-col gap-2"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            <Link to={user ? "/profile" : "/login"}>
                <Button3D className="flex items-center gap-3 px-3 py-2 w-full">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-3 border-yellow-500"
                            style={{ boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.4)' }}>
                            {user?.profile?.avatar_url ? (
                                <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white">
                                    <User size={32} />
                                </div>
                            )}
                        </div>
                        {user && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-white"
                                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>5</div>
                        )}
                    </div>
                    <div>
                        <p className="text-yellow-400 font-bold text-sm drop-shadow">{user ? "Level 5" : "Guest"}</p>
                        <p className="text-white font-bold text-sm drop-shadow">{user?.username || 'Tap to Login'}</p>
                        {user && <p className="text-white/60 text-xs">Next: 6</p>}
                    </div>
                </Button3D>
            </Link>
        </motion.div>
    );
};

export default ProfilePanel;
