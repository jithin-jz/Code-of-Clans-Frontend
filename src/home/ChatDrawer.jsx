import React, { useEffect, useRef, useState, useCallback } from "react";
import useChatStore from "../stores/useChatStore";
import useAuthStore from "../stores/useAuthStore";
import { MessageSquare, Users } from "lucide-react";
import { motion } from "framer-motion";

// Subcomponents
import ChatInput from "./components/ChatInput";
import MessageList from "./components/MessageList";

const ChatDrawer = ({ isChatOpen, setChatOpen, user }) => {
  // ... refs and state ...
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Use global store
  const {
    messages,
    onlineCount,
    isConnected,
    error,
    connect,
    sendMessage: sendStoreMessage,
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
      if (
        emojiButtonRef.current &&
        emojiButtonRef.current.contains(event.target)
      ) {
        return;
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  /* --------------------------- websocket connect --------------------------- */

  /* --------------------------- websocket connect --------------------------- */
  useEffect(() => {
    let timeoutId;

    if (isChatOpen && user) {
      // Slight delay to ensure state is settled
      timeoutId = setTimeout(() => {
        connect();
      }, 100);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isChatOpen, user, connect]);

  // Handle Auth Error (Token Expiry)
  useEffect(() => {
    if (error === "Authentication failed" && isChatOpen && user) {
      useAuthStore
        .getState()
        .checkAuth()
        .then(() => {
          connect();
        });
    }
  }, [error, isChatOpen, user, connect]);

  /* ----------------------------- send message ------------------------------ */
  const sendMessage = useCallback(
    (message) => {
      if (!message?.trim() || !isConnected) return;

      sendStoreMessage(message.trim());
      setShowPicker(false);
    },
    [isConnected, sendStoreMessage],
  );

  return (
    <motion.div
      className="fixed top-0 left-0 h-full z-40 w-[390px]"
      initial={{ x: "-100%" }}
      animate={{ x: isChatOpen ? 0 : "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-full h-full bg-linear-to-b from-[#1f1f1f] via-[#1a1a1a] to-[#171717] backdrop-blur-3xl border-r border-[#3a3a3a] flex flex-col pointer-events-auto shadow-2xl shadow-black/50 relative">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#ffa116]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-12 w-36 h-36 bg-[#00af9b]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative h-14 border-b border-[#3a3a3a] flex items-center justify-between px-5 bg-linear-to-r from-[#262626] to-[#1f1f1f]">
          {/* Header glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#444444] to-transparent" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#2d2d2d] border border-[#444444] flex items-center justify-center">
              <MessageSquare size={15} className="text-[#00af9b]" />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">
              Chat
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2d2d2d] border border-[#444444] rounded-lg">
            <div className="relative">
              <div className="w-1.5 h-1.5 bg-[#00af9b] rounded-full" />
              <div className="absolute inset-0 w-1.5 h-1.5 bg-[#00af9b] rounded-full animate-ping" />
            </div>
            <Users size={12} className="text-slate-200" />
            <span className="text-slate-200 text-xs font-semibold">
              {onlineCount}
            </span>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && !error && (
          <div className="px-4 py-2 bg-[#ffa116]/10 border-b border-[#ffa116]/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#ffa116] rounded-full animate-pulse" />
            <span className="text-[#ffa116] text-xs font-medium">
              Connecting...
            </span>
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

    </motion.div>
  );
};

export default ChatDrawer;
