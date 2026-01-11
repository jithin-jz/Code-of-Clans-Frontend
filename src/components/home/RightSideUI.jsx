import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Star, Settings, Volume2, VolumeX, Music, User, LogOut, Calendar, Trophy } from 'lucide-react';
import { Button3D } from '../common';

const RightSideUI = ({ user, handleLogout, settingsOpen, setSettingsOpen, isBgmMuted, isSfxMuted, toggleBgm, toggleSfx }) => {
    return (
        <div className="fixed right-4 top-4 z-30 flex flex-col gap-4 items-end">
            {/* XP Bar */}
            <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20 }}>
                <Button3D className="flex items-center gap-3 px-4 py-3">
                    <span className="text-yellow-400"><Star fill="currentColor" size={24} /></span>
                    <div>
                        <p className="text-white/70 text-xs mb-1">Total XP</p>
                        <div className="w-24 h-3 bg-black/40 rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
                            <motion.div className="h-full bg-linear-to-r from-purple-400 to-purple-600 rounded-full" initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1, delay: 0.5 }} style={{ boxShadow: '0 0 8px #a855f7' }} />
                        </div>
                    </div>
                    <span className="text-white text-xs font-bold">1,500</span>
                </Button3D>
            </motion.div>

            {/* Settings */}
            <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.1 }} className="relative">
                <Button3D onClick={() => setSettingsOpen(!settingsOpen)} className="p-4">
                    <motion.span className="text-white block" animate={{ rotate: settingsOpen ? 90 : 0 }}><Settings size={28} /></motion.span>
                </Button3D>
                <AnimatePresence>
                    {settingsOpen && (
                        <motion.div className="absolute right-full top-0 mr-2 w-40 rounded-2xl overflow-hidden z-40"
                            style={{ background: 'linear-gradient(180deg, #5c4a3a 0%, #3d3228 100%)', border: '3px solid #8B7355', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                            initial={{ opacity: 0, scale: 0.9, x: 10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: 10 }}
                        >
                            {/* Audio Controls Grid */}
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleSfx(); }}
                                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all border ${
                                        isSfxMuted 
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                                            : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                    }`}
                                >
                                    {isSfxMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">SFX</span>
                                </button>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleBgm(); }}
                                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all border ${
                                        isBgmMuted 
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' 
                                            : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                    }`}
                                >
                                    {isBgmMuted ? <VolumeX size={20} /> : <Music size={20} />}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Music</span>
                                </button>
                            </div>
                            {user ? (
                                <>
                                    <Link to="/profile" className="w-full px-4 py-3 text-white text-sm hover:bg-white/10 flex items-center gap-3"><User size={18} /> Profile</Link>
                                    <button onClick={handleLogout} className="w-full px-4 py-3 text-red-400 text-sm hover:bg-red-500/20 flex items-center gap-3"><LogOut size={18} /> Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="w-full px-4 py-3 text-green-400 text-sm hover:bg-green-500/20 flex items-center gap-3"><User size={18} /> Login</Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Calendar */}
            <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.2 }}>
                <Button3D className="p-4 relative">
                    <span className="text-white"><Calendar size={28} /></span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #ef4444' }}></div>
                </Button3D>
            </motion.div>

            {/* Trophy */}
            <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.25 }}>
                <Button3D className="p-4"><span className="text-yellow-400"><Trophy size={28} /></span></Button3D>
            </motion.div>
        </div>
    );
};

export default RightSideUI;
