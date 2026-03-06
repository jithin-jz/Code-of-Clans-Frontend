import React, { memo, useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, MessageCircle, User } from "lucide-react";
import { motion as Motion } from "framer-motion";

const ChatAvatar = ({ isOwn, avatarUrl, username }) => {
  const [hasError, setHasError] = useState(false);
  const showPlaceholder = !avatarUrl || hasError;

  return (
    <div className="w-full h-full relative group">
      {avatarUrl && !hasError && (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setHasError(true)}
        />
      )}
      {showPlaceholder && (
        <div
          className={`w-full h-full flex items-center justify-center text-[10px] font-black tracking-tighter ${isOwn
            ? "bg-primary/20 text-primary"
            : "bg-accent/20 text-accent"
            }`}
        >
          {username?.charAt(0).toUpperCase() || <User size={12} />}
        </div>
      )}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full" />
    </div>
  );
};

const MessageList = ({ user, messages, viewportHeight }) => {
  const scrollRef = React.useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom, viewportHeight]);

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timer);
  }, [user]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isAtBottom);
  };

  const userMetadata = useMemo(() => {
    const map = {};
    messages.forEach((msg) => {
      if (msg.user_id) {
        map[msg.user_id] = {
          username: msg.username,
          avatar_url: msg.avatar_url,
        };
      }
    });
    return map;
  }, [messages]);

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#03070c]">
        <Motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(0,175,155,0.15)] relative z-10">
            <Lock size={32} className="text-primary" />
          </div>
          <div className="absolute -inset-6 bg-primary/10 rounded-full blur-[40px] opacity-50" />
        </Motion.div>

        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">
          Secure Forge
        </h3>
        <p className="text-neutral-500 text-sm mb-8 max-w-[240px] leading-relaxed font-medium">
          The inner circle is restricted. Authenticate to join the real-time transmission.
        </p>

        <Link
          to="/login"
          className="px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 shadow-[0_10px_30px_rgba(0,175,155,0.3)]"
        >
          Initiate Access
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar bg-transparent scroll-smooth"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-5 border border-white/[0.06] shadow-inner">
            <MessageCircle size={28} className="text-neutral-700" />
          </div>
          <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Quiet in the forge</p>
          <p className="text-neutral-600 text-[10px] mt-2 font-mono uppercase tracking-tighter">
            Waiting for transmission...
          </p>
        </div>
      )}

      {messages.map((msg, idx) => {
        const isOwn = msg.user_id === user?.id;
        const metadata = userMetadata[msg.user_id] || {
          username: msg.username,
          avatar_url: msg.avatar_url,
        };

        const apiURL = import.meta.env.VITE_API_URL || "http://localhost/api";
        const baseUrl = apiURL.replace("/api", "");
        const formattedAvatar = (() => {
          const rawUrl = isOwn ? user?.profile?.avatar_url : metadata.avatar_url;
          if (!rawUrl) return null;
          if (rawUrl.startsWith("http")) return rawUrl;
          return `${baseUrl}${rawUrl}`;
        })();

        return (
          <Motion.div
            key={idx}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex gap-3.5 ${isOwn ? "flex-row-reverse" : "flex-row"} group`}
          >
            {/* Avatar */}
            <Link
              to={`/profile/${metadata.username}`}
              className={`relative shrink-0 w-7 h-7 rounded-full overflow-hidden border transition-all duration-300 shadow-sm ${isOwn ? "border-emerald-500/20 hover:border-emerald-500" : "border-white/5 hover:border-white/20"
                }`}
            >
              <ChatAvatar isOwn={isOwn} avatarUrl={formattedAvatar} username={metadata.username} />
            </Link>

            {/* Message Content */}
            <div className={`flex flex-col gap-1.5 max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
              {/* Username & Time */}
              <div className={`flex items-center gap-1.5 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                <Link
                  to={`/profile/${metadata.username}`}
                  className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isOwn ? "text-emerald-500/70 hover:text-emerald-500" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                >
                  {isOwn ? "You" : metadata.username}
                </Link>
                <span className="text-[8px] font-mono text-neutral-700 tracking-tighter">
                  {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                  })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`
                  relative px-2.5 py-1.5 text-[11px] leading-normal transition-all duration-300 rounded-lg
                  ${isOwn
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 rounded-tr-sm"
                    : "bg-[#161616] border border-[#222] text-neutral-300 rounded-tl-sm hover:bg-[#1a1a1a]"
                  }
                  ${msg.message?.startsWith("IMAGE:") ? "p-1" : ""}
                `}
              >
                {msg.message?.startsWith("IMAGE:") ? (
                  (() => {
                    const [imageUrl, ownerUsername] = msg.message.replace("IMAGE:", "").split("|");
                    return (
                      <div className="space-y-2">
                        <Link to={`/profile/${ownerUsername}`} className="block overflow-hidden rounded-lg border border-white/5 shadow-lg">
                          <img src={imageUrl} alt="" className="w-full h-auto" />
                        </Link>
                        <div className="flex items-center justify-between px-1 py-0.5">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-600">Transmission</p>
                          <Link to={`/profile/${ownerUsername}`} className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 hover:underline">Verify</Link>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="break-words font-medium">{msg.message}</p>
                )}
              </div>
            </div>
          </Motion.div>
        );
      })}
      <div className="h-4 w-full shrink-0" />
    </div>
  );
};

export default memo(MessageList);
