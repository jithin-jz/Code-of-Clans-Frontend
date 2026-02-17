import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  X,
  MessageSquare,
  Plus,
  UserPlus,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { SkeletonBase } from "../common/SkeletonPrimitives";
import useNotificationStore from "../stores/useNotificationStore";
import useAuthStore from "../stores/useAuthStore";

const NotificationDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  // Poll only while drawer is open and user is authenticated
  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(), 60000);
    return () => clearInterval(interval);
  }, [isOpen, user, fetchNotifications]);

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      handleMarkRead(notification.id);
    }

    onClose(); // Close drawer on navigation

    if (notification.actor?.username) {
      navigate(`/profile/${notification.actor.username}`);
    }
  };

  const getNotificationIcon = (verb) => {
    switch (verb) {
      case "started following you":
        return <UserPlus size={14} className="text-[#00af9b]" />;
      case "liked your post":
        return <Check size={14} className="text-[#ffb84d]" />; // Heart icon requires lucide-react Heart import if we want to be exact, Check/Bell is placeholder
      case "commented on your post":
        return <MessageSquare size={14} className="text-green-400" />;
      case "sent you a gift":
        return <Gift size={14} className="text-[#ffa116]" />;
      default:
        return <Bell size={14} className="text-gray-400" />;
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${baseUrl}${url}`;
  };

  return (
    <motion.div
      className="fixed top-0 right-0 h-full z-50 w-[380px]"
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-full h-full bg-linear-to-b from-[#0d0d0d] via-[#0a0a0a] to-[#080808] backdrop-blur-3xl border-l border-white/5 flex flex-col pointer-events-auto shadow-2xl shadow-black/50 relative">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00af9b]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-10 w-32 h-32 bg-[#ffa116]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative h-16 border-b border-white/5 flex items-center justify-between px-5 bg-linear-to-r from-[#141414] to-[#0f0f0f]">
          {/* Header glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#00af9b]/30 to-transparent" />

          <div className="flex items-center gap-3">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Notifications"
            >
              <X size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#00af9b]/20 to-[#00af9b]/5 border border-[#00af9b]/20 flex items-center justify-center">
              <Bell size={16} className="text-[#00af9b]" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight block leading-tight">
                Notifications
              </span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <span className="text-[10px] text-[#00af9b] font-medium uppercase tracking-wider">
                    {unreadCount} New
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    All set
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 rounded-lg text-gray-400 hover:text-[#00af9b] hover:bg-[#00af9b]/10 transition-colors"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {isLoading && notifications.length === 0 ? (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/2 border border-white/5"
                >
                  <SkeletonBase className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-4 w-3/4" />
                    <SkeletonBase className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <Bell size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                No notifications
              </p>
              <p className="text-gray-600 text-xs mt-1">
                We'll let you know when something happens!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                    group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer border
                    ${
                      !notification.is_read
                        ? "bg-[#00af9b]/5 border-[#00af9b]/20 hover:bg-[#00af9b]/10"
                        : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                    }
                `}
              >
                {/* Unread Indicator Dot */}
                {!notification.is_read && (
                  <div className="absolute top-3 right-3 w-2 h-2 bg-[#00af9b] rounded-full shadow-lg shadow-[#00af9b]/50" />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10 bg-zinc-800">
                    {getImageUrl(notification.actor?.avatar_url) ? (
                      <img
                        src={getImageUrl(notification.actor.avatar_url)}
                        alt={notification.actor.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-zinc-800">
                        {notification.actor?.username?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                  </div>
                  {/* Action Icon Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#121212] flex items-center justify-center border border-white/10">
                    {getNotificationIcon(notification.verb)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm text-gray-300 leading-snug">
                    <span
                      className={`font-semibold ${!notification.is_read ? "text-white" : "text-gray-200"}`}
                    >
                      {notification.actor?.username}
                    </span>{" "}
                    <span className="text-gray-400">{notification.verb}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Target Preview */}
                {notification.target_preview && (
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-white/5">
                    <img
                      src={getImageUrl(notification.target_preview)}
                      alt=""
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationDrawer;
