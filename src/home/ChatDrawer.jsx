import React, { useEffect, useRef, useState, useCallback } from 'react';
import useChatStore from '../stores/useChatStore';
import { Link } from 'react-router-dom';
import { Lock, MessageSquare, ChevronLeft, Send, Smile, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { notify } from '../services/notification';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const ChatDrawer = ({ isChatOpen, setChatOpen, user }) => {
    // ... refs and state ...
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const pickerRef = useRef(null);
    
    // Use global store
    const { 
        messages, 
        onlineCount, 
        isConnected, 
        connect, 
        disconnect, 
        sendMessage: sendStoreMessage 
    } = useChatStore();

    const [inputMessage, setInputMessage] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    // ... (rest of the hooks remain the same) ...

    // Auto-focus input when chat opens
    useEffect(() => {
        if (isChatOpen && user && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [isChatOpen, user]);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

    /* ----------------------------- scroll logic ----------------------------- */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* --------------------------- websocket connect --------------------------- */
    /* --------------------------- websocket connect --------------------------- */
    useEffect(() => {
        if (isChatOpen && user) {
            const token = localStorage.getItem("access_token");
            if (token) {
                // Connect using store
                connect(token);
            }
        } 
        // We generally don't disconnect on drawer close if we want to keep receiving messages,
        // but for now, let's keep it simple or follow previous behavior.
        // Previous behavior: close on unmount or deps change.
        // Let's rely on store's idempotency and maybe disconnect on unmount?
        // Actually, if we want background chat, we shouldn't disconnect when drawer closes.
        // But the previous code closed it. Let's stick to previous behavior for now
        // to save resources, or maybe keep it open.
        // Let's disconnect ONLY on component unmount, but the dependency array 
        // [user, isChatOpen] implies it reconnects every time drawer opens.
        
        return () => {
             // Optional: disconnect on unmount or when drawer closes if undesired
             // disconnect(); 
        };
    }, [isChatOpen, user, connect]);

    /* ----------------------------- send message ------------------------------ */
    /* ----------------------------- send message ------------------------------ */
    const sendMessage = useCallback((content = null) => {
        const messageToSend = content || inputMessage.trim();
        if (!messageToSend || !isConnected) return;

        sendStoreMessage(messageToSend);
        
        if (!content) setInputMessage(""); // Clear input only if sending text
        setShowPicker(false);
    }, [inputMessage, isConnected, sendStoreMessage]);

    const handleEmojiClick = (emojiData) => {
        setInputMessage((prev) => prev + emojiData.emoji);
    };

    return (
        <motion.div 
            className="fixed top-0 left-0 h-full z-40 w-[360px]"
            initial={{ x: "-100%" }}
            animate={{ x: isChatOpen ? 0 : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="w-full h-full bg-[#0a0a0a]/95 backdrop-blur-3xl border-r border-white/10 flex flex-col pointer-events-auto shadow-2xl relative">
                
                {/* Header */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#121212]/50">
                    <div>
                        <span className="text-white font-black text-xl tracking-tight block">Global Chat</span>
                        <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest opacity-80">Live Feed</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        <span className="text-green-400 text-xs font-bold">{onlineCount} Online</span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-linear-to-b from-transparent to-black/30 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!user ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                            <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-6">
                                <Lock size={24} className="text-[#FFD700]" />
                            </div>
                            <p className="text-white font-bold text-lg mb-2">Chat Locked</p>
                            <p className="text-gray-400 text-sm mb-6 max-w-[200px]">Join the community to chat with other players!</p>
                            <Link to="/login" className="px-6 py-3 bg-[#FFD700] hover:bg-[#FDB931] text-black rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-900/20">
                                Login Access
                            </Link>
                        </div>
                    ) : (
                        <>
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 mt-10 text-sm">
                                    No messages yet. Be the first!
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col gap-2 group ${msg.username === user?.username ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 ${msg.username === user?.username ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <Link 
                                            to={`/profile/${msg.username}`}
                                            onClick={() => setChatOpen(false)}
                                            className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-[#FFD700] transition-colors"
                                        >
                                            {msg.username === user?.username ? (
                                                user?.profile?.avatar_url ? (
                                                    <img src={user.profile.avatar_url} alt={msg.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 font-bold">
                                                        {msg.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )
                                            ) : (
                                                msg.avatar_url ? (
                                                    <img src={msg.avatar_url} alt={msg.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 font-bold">
                                                        {msg.username?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )
                                            )}
                                        </Link>
                                        <div className={`flex flex-col gap-1 max-w-[85%] ${msg.username === user?.username ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    to={`/profile/${msg.username}`}
                                                    onClick={() => setChatOpen(false)}
                                                    className={`${msg.username === user?.username ? 'text-[#FFD700]' : 'text-blue-400'} font-bold text-xs tracking-wide hover:underline cursor-pointer`}
                                                >
                                                    {msg.username}
                                                </Link>
                                                {msg.timestamp && (
                                                    <span className="text-[10px] text-zinc-500 font-mono">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`
                                                rounded-2xl text-sm leading-relaxed shadow-sm transition-colors
                                                ${msg.username === user?.username 
                                                    ? 'bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] rounded-tr-sm p-3' 
                                                    : 'bg-[#1a1a1a] border border-white/5 text-gray-300 rounded-tl-sm group-hover:bg-[#222] p-3'
                                                }
                                            `}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#121212]/50 border-t border-white/5 backdrop-blur-md relative">
                    {/* Emoji Picker */}
                    {showPicker && (
                        <div 
                            ref={pickerRef}
                            className="absolute bottom-full left-0 w-full p-4 mb-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                        >
                            <div className="bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden h-[400px] flex">
                                <EmojiPicker 
                                    onEmojiClick={handleEmojiClick}
                                    theme="dark"
                                    width="100%"
                                    height="100%"
                                    lazyLoadEmojis={true}
                                    previewConfig={{ showPreview: false }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button 
                            variant="ghost"
                            onClick={() => setShowPicker(!showPicker)}
                            disabled={!user}
                            className={`p-3 rounded-xl transition-all ${showPicker ? 'bg-[#FFD700] text-black' : 'bg-black/40 text-gray-400 hover:text-[#FFD700] hover:bg-black/60'} disabled:opacity-50 border border-white/10 h-auto w-auto`}
                        >
                            {showPicker ? <X size={20} /> : <Smile size={20} />}
                        </Button>
                        
                        <Input 
                            ref={inputRef}
                            type="text" 
                            placeholder={user ? "Type a message..." : "Login to chat..."} 
                            disabled={!user}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 bg-black/40 border-white/10 rounded-xl px-4 py-6 text-white text-sm focus-visible:ring-[#FFD700]/50 focus-visible:bg-black/60 transition-all disabled:opacity-50 placeholder-gray-600" 
                        />
                        <Button 
                            disabled={!user} 
                            onClick={() => sendMessage()}
                            className="bg-[#FFD700] hover:bg-[#FDB931] text-black p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-yellow-900/20 h-auto w-auto"
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>

                {/* Toggle Button */}
                <Button
                    onClick={() => setChatOpen(!isChatOpen)}
                    className="absolute top-1/2 -right-12 -mt-10 w-12 h-20 bg-[#0a0a0a] border-y border-r border-[#FFD700]/30 rounded-r-2xl flex items-center justify-center shadow-2xl pointer-events-auto hover:bg-[#151515] hover:border-[#FFD700] transition-all group z-50 rounded-l-none"
                    style={{ filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.2))" }}
                >
                    {isChatOpen ? (
                        <ChevronLeft className="text-[#FFD700] drop-shadow-md" size={24} strokeWidth={3} />
                    ) : (
                        <MessageSquare className="text-[#FFD700] drop-shadow-md" size={24} strokeWidth={3} />
                    )}
                </Button>
            </div>
        </motion.div>
    );
};

export default ChatDrawer;
