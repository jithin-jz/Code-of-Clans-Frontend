import React, { memo, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Lock, MessageCircle } from "lucide-react";

const ChatAvatar = ({ isOwn, avatarUrl, username }) => {
  const [hasError, setHasError] = useState(false);
  const showPlaceholder = !avatarUrl || hasError;

  return (
    <div className="w-full h-full relative">
      {avatarUrl && !hasError && (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
      {showPlaceholder && (
        <div
          className={`w-full h-full flex items-center justify-center text-xs font-bold ${
            isOwn
              ? "bg-linear-to-br from-[#00af9b]/30 to-[#00af9b]/10 text-[#00af9b]"
              : "bg-linear-to-br from-[#ffa116]/30 to-[#ffa116]/10 text-[#ffa116]"
          }`}
        >
          {username?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
};

const MessageList = ({ user, messages, setChatOpen }) => {
  const scrollRef = React.useRef(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
    }
  }, [messages, shouldScrollToBottom]);

  // Initial scroll when component mounts or user changes
  React.useEffect(() => {
    scrollToBottom();
    // Second attempt to catch any layout shifts
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [user]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // If user is within 100px of bottom, auto-scroll remains active
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isAtBottom);
  };
  // Create a map of user_id -> latest metadata (username, avatar_url)
  const userMetadata = useMemo(() => {
    const map = {};
    messages.forEach((msg) => {
      if (msg.user_id) {
        // Since messages are in chronological order, later messages from the same user
        // will overwrite earlier ones with more recent profile data.
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
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="relative">
          <div className="w-20 h-20 bg-linear-to-br from-[#00af9b]/20 to-[#00af9b]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#00af9b]/20">
            <Lock size={28} className="text-[#00af9b]" />
          </div>
          <div className="absolute -inset-4 bg-[#00af9b]/10 rounded-3xl blur-xl -z-10" />
        </div>
        <p className="text-white font-bold text-lg mb-2">
          Join the Conversation
        </p>
        <p className="text-gray-500 text-sm mb-6 max-w-[220px] leading-relaxed">
          Connect with fellow coders and share your journey!
        </p>
        <Link
          to="/login"
          className="px-6 py-3 bg-linear-to-r from-[#00af9b] to-[#008f7a] hover:from-[#008f7a] hover:to-[#00af9b] text-white rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#008f7a]/30"
        >
          Sign In to Chat
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
            <MessageCircle size={24} className="text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm font-medium">No messages yet</p>
          <p className="text-gray-600 text-xs mt-1">
            Be the first to say hello!
          </p>
        </div>
      )}

      {messages.map((msg, idx) => {
        const isOwn = msg.user_id === user?.id;
        // Use the latest known metadata for this user
        const metadata = userMetadata[msg.user_id] || {
          username: msg.username,
          avatar_url: msg.avatar_url,
        };

        return (
          <div
            key={idx}
            className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"} group animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {/* Avatar */}
            <Link
              to={`/profile/${metadata.username}`}
              onClick={() => setChatOpen(false)}
              className={`relative shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 transition-all duration-200 cursor-pointer hover:scale-110 ${
                isOwn
                  ? "ring-[#00af9b]/30 hover:ring-[#00af9b]"
                  : "ring-white/10 hover:ring-white/30"
              }`}
            >
              <ChatAvatar
                isOwn={isOwn}
                avatarUrl={(() => {
                  const rawUrl = isOwn
                    ? user?.profile?.avatar_url
                    : metadata.avatar_url;
                  if (!rawUrl) return null;
                  if (rawUrl.startsWith("http")) return rawUrl;

                  const apiURL =
                    import.meta.env.VITE_API_URL || "http://localhost/api";
                  const baseUrl = apiURL.replace("/api", "");
                  return `${baseUrl}${rawUrl}`;
                })()}
                username={metadata.username}
              />
            </Link>

            {/* Message Content */}
            <div
              className={`flex flex-col gap-0.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}
            >
              {/* Username */}
              <Link
                to={`/profile/${metadata.username}`}
                onClick={() => setChatOpen(false)}
                className={`text-[11px] font-semibold tracking-wide hover:underline cursor-pointer transition-colors px-1 ${
                  isOwn
                    ? "text-[#00af9b]/80 hover:text-[#00af9b]"
                    : "text-[#ffa116]/80 hover:text-[#ffa116]"
                }`}
              >
                {isOwn ? "You" : metadata.username}
              </Link>

              {/* Message Bubble */}
              <div
                className={`
                                px-3.5 py-2.5 text-[13px] leading-relaxed transition-all duration-200
                                ${
                                  isOwn
                                    ? "bg-linear-to-br from-[#00af9b]/20 to-[#00af9b]/5 border border-[#00af9b]/25 text-white rounded-2xl rounded-tr-md"
                                    : "bg-[#2b2b2b]/70 border border-[#3a3a3a] text-slate-200 rounded-2xl rounded-tl-md group-hover:bg-[#313131] group-hover:border-[#444444]"
                                }
                                ${msg.message?.startsWith("IMAGE:") ? "p-1.5" : ""}
                            `}
              >
                {msg.message?.startsWith("IMAGE:") ? (
                  (() => {
                    const [imageUrl, ownerUsername] = msg.message
                      .replace("IMAGE:", "")
                      .split("|");
                    return (
                      <div className="space-y-2">
                        <Link
                          to={`/profile/${ownerUsername}`}
                          onClick={() => setChatOpen(false)}
                          className="block overflow-hidden rounded-lg group/img"
                        >
                          <img
                            src={imageUrl}
                            alt="Shared post"
                            className="w-full h-auto border border-white/10 group-hover/img:scale-[1.05] transition-transform duration-500 rounded-lg shadow-2xl"
                          />
                        </Link>
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-gray-500 italic">
                            Shared a post
                          </p>
                          <Link
                            to={`/profile/${ownerUsername}`}
                            onClick={() => setChatOpen(false)}
                            className="text-[10px] text-[#00af9b] hover:underline font-medium"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="wrap-break-word">{msg.message}</p>
                )}

                {/* Timestamp */}
                {msg.timestamp && (
                  <div
                    className={`text-[9px] font-medium mt-1.5 ${
                      isOwn ? "text-[#00af9b]/60" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                      timeZone: "Asia/Kolkata",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="h-2 w-full shrink-0" />
    </div>
  );
};

export default memo(MessageList);
