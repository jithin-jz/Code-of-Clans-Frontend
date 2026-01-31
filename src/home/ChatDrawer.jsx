import React, { useEffect, useRef, useState, useCallback } from 'react';
import useChatStore from '../stores/useChatStore';
import useAuthStore from '../stores/useAuthStore';
import { MessageSquare, ChevronLeft, Users, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';

// Subcomponents
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

const ChatDrawer = ({ isChatOpen, setChatOpen, user }) => {
    // ... refs and state ...
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const pickerRef = useRef(null);
    const emojiButtonRef = useRef(null);
    
    // Use global store
    const { 
        messages, 
        onlineCount, 
        isConnected,
        error,
        connect, 
        sendMessage: sendStoreMessage 
    } = useChatStore();

    const [showPicker, setShowPicker] = useState(false);

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
            // Don't close if clicking on the emoji button itself
            if (emojiButtonRef.current && emojiButtonRef.current.contains(event.target)) {
                return;
            }
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
        if (isChatOpen && user) {
            const token = localStorage.getItem("access_token");
            if (token) {
                // Connect using store
                connect(token);
            }
        } 
        
        return () => {
             // Optional: disconnect on unmount 
        };
    }, [isChatOpen, user, connect]);

    // Handle Auth Error (Token Expiry)
    const { connect: reconnect } = useChatStore();
    useEffect(() => {
        if (error === "Authentication failed" && isChatOpen && user) {
            // Attempt to refresh token by triggering an auth check
            // which uses the interceptor to refresh if needed
            useAuthStore.getState().checkAuth().then(() => {
                const newToken = localStorage.getItem("access_token");
                if (newToken) {
                    reconnect(newToken);
                }
            });
        }
    }, [error, isChatOpen, user, reconnect]);

    /* ----------------------------- send message ------------------------------ */
    const sendMessage = useCallback((message) => {
        if (!message?.trim() || !isConnected) return;

        sendStoreMessage(message.trim());
        setShowPicker(false);
    }, [isConnected, sendStoreMessage]);


    return (
        <motion.div 
            className="fixed top-0 left-0 h-full z-40 w-[380px]"
            initial={{ x: "-100%" }}
            animate={{ x: isChatOpen ? 0 : "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="w-full h-full bg-gradient-to-b from-[#0d0d0d] via-[#0a0a0a] to-[#080808] backdrop-blur-3xl border-r border-white/5 flex flex-col pointer-events-auto shadow-2xl shadow-black/50 relative">
                
                {/* Decorative gradient orb */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header */}
                <div className="relative h-16 border-b border-white/5 flex items-center justify-between px-5 bg-gradient-to-r from-[#0f0f0f] to-[#141414]">
                    {/* Header glow line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />
                    
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/20 flex items-center justify-center">
                            <MessageSquare size={16} className="text-[#FFD700]" />
                        </div>
                        <div>
                            <span className="text-white font-bold text-base tracking-tight block leading-tight">Global Chat</span>
                            <div className="flex items-center gap-1">
                                <Zap size={10} className="text-[#FFD700]" />
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="relative">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        </div>
                        <Users size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-semibold">{onlineCount}</span>
                    </div>
                </div>

                {/* Connection Status */}
                {!isConnected && !error && (
                    <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-yellow-400 text-xs font-medium">Connecting...</span>
                    </div>
                )}

                {/* Rate Limit / Error Banner */}
                {error && (
                    <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                        <span className="text-red-400 text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Messages Area */}
                <MessageList 
                    user={user}
                    messages={messages}
                    setChatOpen={setChatOpen}
                    messagesEndRef={messagesEndRef}
                />

                {/* Input Area */}
                <ChatInput 
                    user={user}
                    sendMessage={sendMessage}
                    showPicker={showPicker}
                    setShowPicker={setShowPicker}
                    inputRef={inputRef}
                    pickerRef={pickerRef}
                    emojiButtonRef={emojiButtonRef}
                />
            </div>

            {/* Toggle Button - Outside inner container */}
            <Button
                onClick={() => setChatOpen(!isChatOpen)}
                className="absolute top-1/2 -right-10 -mt-7 w-10 h-14 bg-[#0a0a0a] border border-[#FFD700]/30 rounded-r-xl flex items-center justify-center shadow-xl pointer-events-auto hover:bg-[#111] hover:border-[#FFD700]/50 transition-all duration-300 group z-50"
                style={{ 
                    boxShadow: '0 6px 15px -3px rgba(255, 215, 0, 0.3)',
                    borderLeft: 'none'
                }}
            >
                <div className="relative flex items-center justify-center">
                    {isChatOpen ? (
                        <ChevronLeft className="text-[#FFD700] group-hover:scale-110 transition-transform duration-200" size={24} strokeWidth={2.5} />
                    ) : (
                        <>
                            <MessageSquare className="text-[#FFD700] group-hover:scale-110 transition-transform duration-200" size={20} strokeWidth={2.5} />
                            {messages.length > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
                            )}
                        </>
                    )}
                </div>
            </Button>
        </motion.div>
    );
};

export default ChatDrawer;
