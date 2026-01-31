import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Lock, MessageCircle } from 'lucide-react';

const MessageList = ({ 
    user, 
    messages, 
    setChatOpen, 
    messagesEndRef 
}) => {
    
    if (!user) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#FFD700]/20">
                        <Lock size={28} className="text-[#FFD700]" />
                    </div>
                    <div className="absolute -inset-4 bg-[#FFD700]/5 rounded-3xl blur-xl -z-10" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Join the Conversation</p>
                <p className="text-gray-500 text-sm mb-6 max-w-[220px] leading-relaxed">Connect with fellow coders and share your journey!</p>
                <Link 
                    to="/login" 
                    className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FDB931] hover:from-[#FDB931] hover:to-[#FFD700] text-black rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-900/30"
                >
                    Sign In to Chat
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                        <MessageCircle size={24} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-600 text-xs mt-1">Be the first to say hello!</p>
                </div>
            )}
            
            {messages.map((msg, idx) => {
                const isOwn = msg.username === user?.username;
                
                return (
                    <div 
                        key={idx} 
                        className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group animate-in fade-in slide-in-from-bottom-2 duration-200`}
                    >
                        {/* Avatar */}
                        <Link 
                            to={`/profile/${msg.username}`}
                            onClick={() => setChatOpen(false)}
                            className={`relative shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 transition-all duration-200 cursor-pointer hover:scale-110 ${
                                isOwn 
                                    ? 'ring-[#FFD700]/30 hover:ring-[#FFD700]' 
                                    : 'ring-white/10 hover:ring-white/30'
                            }`}
                        >
                            {isOwn ? (
                                user?.profile?.avatar_url ? (
                                    <img src={user.profile.avatar_url} alt={msg.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFD700]/10 flex items-center justify-center text-xs text-[#FFD700] font-bold">
                                        {msg.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )
                            ) : (
                                msg.avatar_url ? (
                                    <img src={msg.avatar_url} alt={msg.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500/30 to-purple-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">
                                        {msg.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )
                            )}
                        </Link>

                        {/* Message Content */}
                        <div className={`flex flex-col gap-0.5 max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                            {/* Username */}
                            <Link 
                                to={`/profile/${msg.username}`}
                                onClick={() => setChatOpen(false)}
                                className={`text-[11px] font-semibold tracking-wide hover:underline cursor-pointer transition-colors px-1 ${
                                    isOwn ? 'text-[#FFD700]/80 hover:text-[#FFD700]' : 'text-blue-400/80 hover:text-blue-400'
                                }`}
                            >
                                {isOwn ? 'You' : msg.username}
                            </Link>
                            
                            {/* Message Bubble */}
                            <div className={`
                                px-3.5 py-2.5 text-[13px] leading-relaxed transition-all duration-200
                                ${isOwn 
                                    ? 'bg-gradient-to-br from-[#FFD700]/15 to-[#FFD700]/5 border border-[#FFD700]/20 text-white rounded-2xl rounded-tr-md' 
                                    : 'bg-white/[0.03] border border-white/5 text-gray-300 rounded-2xl rounded-tl-md group-hover:bg-white/[0.05] group-hover:border-white/10'
                                }
                            `}>
                                <p className="break-words">{msg.message}</p>
                                
                                {/* Timestamp */}
                                {msg.timestamp && (
                                    <div className={`text-[9px] font-medium mt-1.5 ${
                                        isOwn ? 'text-[#FFD700]/50' : 'text-gray-600'
                                    }`}>
                                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                                            timeZone: 'Asia/Kolkata', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default memo(MessageList);
