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
              ? "bg-linear-to-br from-[#FFD700]/30 to-[#FFD700]/10 text-[#FFD700]"
              : "bg-linear-to-br from-blue-500/30 to-purple-500/20 text-blue-400"
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
          <div className="w-20 h-20 bg-linear-to-br from-[#FFD700]/20 to-[#FFD700]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#FFD700]/20">
            <Lock size={28} className="text-[#FFD700]" />
          </div>
          <div className="absolute -inset-4 bg-[#FFD700]/5 rounded-3xl blur-xl -z-10" />
        </div>
        <p className="text-white font-bold text-lg mb-2">
          Join the Conversation
        </p>
        <p className="text-gray-500 text-sm mb-6 max-w-[220px] leading-relaxed">
          Connect with fellow coders and share your journey!
        </p>
        <Link
          to="/login"
          className="px-6 py-3 bg-linear-to-r from-[#FFD700] to-[#FDB931] hover:from-[#FDB931] hover:to-[#FFD700] text-black rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-900/30"
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
                  ? "ring-[#FFD700]/30 hover:ring-[#FFD700]"
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
                    ? "text-[#FFD700]/80 hover:text-[#FFD700]"
                    : "text-blue-400/80 hover:text-blue-400"
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
                                    ? "bg-linear-to-br from-[#FFD700]/15 to-[#FFD700]/5 border border-[#FFD700]/20 text-white rounded-2xl rounded-tr-md"
                                    : "bg-white/3 border border-white/5 text-gray-300 rounded-2xl rounded-tl-md group-hover:bg-white/5 group-hover:border-white/10"
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
                            className="text-[10px] text-[#FFD700] hover:underline font-medium"
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
                      isOwn ? "text-[#FFD700]/50" : "text-gray-600"
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
