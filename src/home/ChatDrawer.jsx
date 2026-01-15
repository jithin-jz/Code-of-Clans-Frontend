import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MessageSquare, ChevronLeft, Send, Smile, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const ChatDrawer = ({ isChatOpen, setChatOpen, user }) => {
    const inputRef = useRef(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const pickerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);

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
    useEffect(() => {
        if (!user || !isChatOpen) return;

        const token = localStorage.getItem("access_token");
        if (!token) return;

        const ws = new WebSocket(
            `ws://127.0.0.1:8000/ws/chat/?token=${token}`
        );

        socketRef.current = ws;

        ws.onopen = () => console.log("Chat connected");

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'user_count') {
                    setOnlineCount(data.count);
                    return;
                }

                if (!data?.message) return;
                setMessages((prev) => [...prev, data]);
            } catch (err) {
                console.error("Invalid WS payload", err);
            }
        };

        ws.onclose = () => {
            console.log("Chat disconnected");
            socketRef.current = null;
        };

        return () => ws.close();
    }, [user, isChatOpen]);

    /* ----------------------------- send message ------------------------------ */
    const sendMessage = useCallback((content = null) => {
        const ws = socketRef.current;
        const messageToSend = content || inputMessage.trim();

        if (!ws || ws.readyState !== WebSocket.OPEN || !messageToSend) return;

        ws.send(JSON.stringify({ message: messageToSend }));
        if (!content) setInputMessage(""); // Clear input only if sending text
        setShowPicker(false);
    }, [inputMessage]);

    const handleEmojiClick = (emojiData) => {
        setInputMessage((prev) => prev + emojiData.emoji);
    };

    return (
        <motion.div 
            className="fixed top-0 left-0 h-full z-40 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: isChatOpen ? 0 : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            style={{ width: '360px' }} 
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
                                    <div className="flex items-center gap-2">
                                        <span className={`${msg.username === user?.username ? 'text-[#FFD700]' : 'text-blue-400'} font-bold text-xs tracking-wide`}>
                                            {msg.username}
                                        </span>
                                    </div>
                                    <div className={`
                                        rounded-2xl text-sm leading-relaxed shadow-sm transition-colors
                                        ${msg.username === user?.username 
                                            ? 'bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] rounded-tr-sm p-3 max-w-[85%]' 
                                            : 'bg-[#1a1a1a] border border-white/5 text-gray-300 rounded-tl-sm group-hover:bg-[#222] p-3 max-w-[85%]'
                                        }
                                    `}>
                                        {msg.message}
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
                    <AnimatePresence>
                        {showPicker && (
                            <motion.div 
                                ref={pickerRef}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                className="absolute bottom-full left-0 w-full p-4 mb-2 z-50"
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowPicker(!showPicker)}
                            disabled={!user}
                            className={`p-3 rounded-xl transition-all ${showPicker ? 'bg-[#FFD700] text-black' : 'bg-black/40 text-gray-400 hover:text-[#FFD700] hover:bg-black/60'} disabled:opacity-50 border border-white/10`}
                        >
                            {showPicker ? <X size={20} /> : <Smile size={20} />}
                        </button>
                        
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder={user ? "Type a message..." : "Login to chat..."} 
                            disabled={!user}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#FFD700]/50 focus:bg-black/60 transition-all disabled:opacity-50 placeholder-gray-600" 
                        />
                        <button 
                            disabled={!user} 
                            onClick={() => sendMessage()}
                            className="bg-[#FFD700] hover:bg-[#FDB931] text-black p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-yellow-900/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                {/* Toggle Button */}
                <motion.button
                    onClick={() => setChatOpen(!isChatOpen)}
                    className="absolute top-1/2 -right-12 -mt-10 w-12 h-20 bg-[#0a0a0a] border-y border-r border-[#FFD700]/30 rounded-r-2xl flex items-center justify-center shadow-2xl pointer-events-auto hover:bg-[#151515] hover:border-[#FFD700] transition-all group z-50"
                    whileHover={{ x: 4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ x: 0 }}
                    style={{ filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.2))" }}
                >
                    {isChatOpen ? (
                        <ChevronLeft className="text-[#FFD700] drop-shadow-md" size={24} strokeWidth={3} />
                    ) : (
                        <MessageSquare className="text-[#FFD700] drop-shadow-md" size={24} strokeWidth={3} />
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ChatDrawer;
