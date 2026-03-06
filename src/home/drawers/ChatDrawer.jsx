import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { X, MessageSquare, Users, Sparkles, Send } from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import useChatStore from "../../stores/useChatStore";
import ChatInput from "../components/ChatInput";
import MessageList from "../components/MessageList";

const ChatDrawer = ({ isOpen, setOpen, user }) => {
  const { messages, sendMessage, onlineCount, connect } = useChatStore();
  const [showPicker, setShowPicker] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const pickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const inputRef = useRef(null);
  const drawerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        showPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  // Visual Viewport API for flexible mobile heights (prevents keyboard hiding input)
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const vh = window.visualViewport.height;
      setViewportHeight(vh);
      const isVisible = vh < window.innerHeight * 0.85;
      setIsKeyboardVisible(isVisible);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
      window.visualViewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  // Connect to websocket when drawer is open
  useEffect(() => {
    if (isOpen) {
      connect();
    }
    // We don't disconnect immediately on close to keep history/messages
    // and because users might toggle it frequently.
  }, [isOpen, connect]);

  const handleSendMessage = useCallback((content) => {
    sendMessage(content);
    setShowPicker(false);
  }, [sendMessage]);

  // Removed unread/markRead logic as it's not in the store yet
  // If needed, it should be implemented in useChatStore first.

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Glass) */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              setShowPicker(false);
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Wrapper (Flexible Height Control) */}
          <Motion.div
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              height: isKeyboardVisible ? `${viewportHeight}px` : "100dvh",
              bottom: 0,
            }}
            className="fixed left-0 z-[60] w-full md:max-w-[360px] bg-[#050505] shadow-2xl flex flex-col md:border-r border-[#1a1a1a]"
          >
            {/* Glossy Header */}
            <header className="shrink-0 h-12 flex items-center justify-between px-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#444] uppercase font-mono">
                    Live Chat
                  </span>
                  <div className="flex items-center gap-1 leading-none">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-tighter">
                      {onlineCount || 0} online
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-6 w-6 rounded-md flex items-center justify-center text-neutral-600 hover:text-white hover:bg-[#1a1a1a] transition-all"
              >
                <X size={14} />
              </button>
            </header>

            {/* Messages Area - Constrained for scrolling */}
            <main className="flex-1 min-h-0 relative flex flex-col bg-[#050505]">

              <div className="relative z-10 flex-1 min-h-0 h-full">
                <MessageList user={user} messages={messages} viewportHeight={viewportHeight} />
              </div>
            </main>

            {/* Input Hook */}
            <div className="shrink-0 relative z-20">
              <ChatInput
                user={user}
                sendMessage={handleSendMessage}
                showPicker={showPicker}
                setShowPicker={setShowPicker}
                inputRef={inputRef}
                pickerRef={pickerRef}
                emojiButtonRef={emojiButtonRef}
              />
            </div>

            {/* Safety padding for non-keyboard mobile states */}
            {!isKeyboardVisible && <div className="h-safe sm:h-0 bg-[#050505]" />}
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default memo(ChatDrawer);
