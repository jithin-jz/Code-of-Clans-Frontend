import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, MessageSquare, ChevronLeft } from 'lucide-react';

const ChatDrawer = ({ isChatOpen, setChatOpen, user }) => {
    return (
        <motion.div 
            className="fixed top-0 left-0 h-full z-50 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: isChatOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            style={{ width: '320px' }} 
        >
            <div className="w-full h-full bg-[#333] border-r-4 border-[#1a1a1a] flex flex-col pointer-events-auto relative shadow-2xl">
                <div className="h-16 bg-[#2a2a2a] border-b border-[#444] flex items-center justify-between px-4">
                    <span className="text-white font-bold text-lg drop-shadow-md">Global Chat</span>
                    <div className="text-green-400 text-xs font-bold bg-green-900/50 px-2 py-1 rounded">Online: 1,240</div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#222]">
                    {!user ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
                            <Lock size={48} className="text-yellow-500 mb-4" />
                            <p className="text-white font-bold mb-2">Chat Locked</p>
                            <p className="text-white/60 text-sm mb-4">Login to join the conversation!</p>
                            <Link to="/login" className="bg-green-600 px-4 py-2 rounded font-bold text-white">Login</Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1">
                                <span className="text-yellow-500 font-bold text-xs">SuperCell_Fan</span>
                                <div className="bg-[#444] text-white p-2 rounded-r-lg rounded-bl-lg text-sm border-l-4 border-yellow-500">
                                    Anyone want to join my clan? We war 24/7! ⚔️
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-3 bg-[#2a2a2a] border-t border-[#444]">
                    <div className="flex gap-2">
                        <input type="text" placeholder={user ? "Type a message..." : "Login to chat..."} disabled={!user}
                            className="flex-1 bg-[#1a1a1a] border border-[#444] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50" />
                        <button disabled={!user} className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded font-bold border-b-4 border-green-800 active:border-b-0 active:translate-y-1 disabled:opacity-50">Send</button>
                    </div>
                </div>
                <motion.button
                    onClick={() => setChatOpen(!isChatOpen)}
                    className="absolute top-1/2 -right-12 -mt-8 w-12 h-16 bg-orange-500 border-y-2 border-r-2 border-black rounded-r-xl flex items-center justify-center shadow-lg pointer-events-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ background: 'linear-gradient(180deg, #f97316 0%, #c2410c 100%)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 4px 0 8px rgba(0,0,0,0.4)' }}
                >
                    {isChatOpen ? <ChevronLeft className="text-white" size={32} strokeWidth={3} /> : <MessageSquare className="text-white" size={28} strokeWidth={3} />}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ChatDrawer;
