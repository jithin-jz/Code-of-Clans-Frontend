import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import useNotificationStore from "../stores/useNotificationStore";
import useAuthStore from "../stores/useAuthStore";

const NotificationDropdown = ({ className }) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadCountRef = useRef(0);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  // Poll only while dropdown is open and user is authenticated
  useEffect(() => {
    if (!isOpen || !user) return;
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(), 60000);
    return () => clearInterval(interval);
  }, [isOpen, user, fetchNotifications]);

  // Detect new notifications and trigger animation
  useEffect(() => {
    if (
      unreadCount > prevUnreadCountRef.current &&
      prevUnreadCountRef.current > 0
    ) {
      setHasNewNotification(true);
      // Reset animation after 3 seconds
      const timeout = setTimeout(() => setHasNewNotification(false), 3000);
      return () => clearTimeout(timeout);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
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
      await markAsRead(notification.id);
    }

    // Navigate to actor's profile
    if (notification.actor?.username) {
      navigate(`/profile/${notification.actor.username}`);
    }
  };

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open && user) fetchNotifications(true);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-white hover:text-white hover:bg-transparent",
            className,
          )}
        >
          {/* Bell Icon with shake animation on new notification */}
          <motion.div
            animate={
              hasNewNotification
                ? {
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <Bell size={24} />
          </motion.div>

          {/* Animated Badge with Count */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                }}
                className={cn(
                  "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg",
                  hasNewNotification
                    ? "bg-gradient-to-r from-red-500 to-[#ff8f00] ring-2 ring-red-400 ring-offset-1 ring-offset-transparent animate-pulse"
                    : "bg-red-500",
                )}
              >
                {unreadCount > 99 ? "99+" : unreadCount}

                {/* Ripple effect for new notifications */}
                {hasNewNotification && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-400"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, repeat: 2 }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#ffb84d]"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1, delay: 0.2, repeat: 2 }}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 bg-[#121212]/95 backdrop-blur-xl border-zinc-800 p-0 text-white max-h-[400px] flex flex-col shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-right-5 duration-200"
      >
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#00af9b] hover:text-[#66d1c3] transition-colors"
              >
                Mark read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-zinc-500 text-sm">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`
                                    flex items-start gap-3 p-3 cursor-pointer focus:bg-zinc-800
                                    ${!notification.is_read ? "bg-zinc-800/50" : ""}
                                `}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Actor Avatar */}
                <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0">
                  {notification.actor?.avatar_url ? (
                    <img
                      src={notification.actor.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/50">
                      {notification.actor?.username?.[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {notification.actor?.username}
                    </span>{" "}
                    <span className="text-zinc-300">{notification.verb}</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Target Preview (e.g., Post Image) */}
                {notification.target_preview && (
                  <div className="w-10 h-10 rounded bg-zinc-800 overflow-hidden shrink-0">
                    <img
                      src={notification.target_preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Unread Indicator */}
                {!notification.is_read && (
                  <div className="self-center">
                    <div className="w-2 h-2 bg-[#00af9b] rounded-full" />
                  </div>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
