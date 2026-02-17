import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Star,
  Settings,
  User,
  LogOut,
  Calendar,
  Trophy,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useNotificationStore from "../stores/useNotificationStore";

const RightSideUI = ({
  user,
  handleLogout,
  settingsOpen,
  setSettingsOpen,
  setCheckInOpen,
  setLeaderboardOpen,
  setNotificationOpen,
  hasUnclaimedReward,
}) => {
  const navigate = useNavigate();
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadCountRef = useRef(0);

  const { unreadCount, fetchNotifications } = useNotificationStore();

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Detect new notifications and trigger animation
  useEffect(() => {
    if (
      unreadCount > prevUnreadCountRef.current &&
      prevUnreadCountRef.current > 0
    ) {
      // Small delay to ensure it doesn't trigger during render cycle
      const triggerTimeout = setTimeout(() => setHasNewNotification(true), 10);

      // Reset intense animation after 3 seconds, but keep dot pulsing subtly
      const resetTimeout = setTimeout(() => setHasNewNotification(false), 3000);

      return () => {
        clearTimeout(triggerTimeout);
        clearTimeout(resetTimeout);
      };
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Glass button style matches the previous design
  const glassButtonClass =
    "h-10 w-10 p-0 bg-[#262626] backdrop-blur-xl border border-[#3a3a3a] rounded-2xl hover:border-[#ffa116]/60 hover:bg-[#313131] transition-all text-white shadow-lg active:scale-95";

  return (
    <div className="fixed right-6 top-6 z-30 flex flex-col gap-4 items-end animate-slide-in-right">
      {/* XP Bar - Link to Shop */}
      <div
        onClick={() => navigate("/shop")}
        className="bg-[#262626] border border-[#3a3a3a] rounded-full pl-4 pr-6 py-2.5 flex items-center gap-4 shadow-lg cursor-pointer hover:border-[#ffa116]/60 transition-all active:scale-95 group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb84d] via-[#ffa116] to-[#d97706] flex items-center justify-center text-black shadow-lg">
          <Star fill="currentColor" size={18} />
        </div>
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">
              XP Progress
            </span>
            <span className="text-white text-xs font-bold font-mono">
              {user?.profile?.xp?.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-32 h-2 bg-[#3a3a3a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff8f00] via-[#ffa116] to-[#ffd166] rounded-full transition-width"
              style={{ width: `${((user?.profile?.xp || 0) % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setSettingsOpen(!settingsOpen);
          }}
          className={glassButtonClass}
        >
          <span
            className={cn(
              "block transition-transform duration-300",
              settingsOpen ? "rotate-90" : "rotate-0",
            )}
          >
            <Settings
              size={18}
              className={settingsOpen ? "text-[#ffa116]" : "text-[#7dd3fc]"}
            />
          </span>
        </Button>

        {settingsOpen && (
          <div className="absolute right-full top-0 mr-4 w-44 rounded-2xl overflow-hidden z-40 bg-[#262626] border border-[#3a3a3a] shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 slide-in-from-right-2 duration-200">
            <div className="p-1">
              {/* Menu Items */}
              <div className="space-y-1">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="w-full px-3 py-2 rounded-xl hover:bg-[#373737] text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User size={14} />{" "}
                        <span className="text-xs font-medium">Profile</span>
                      </div>
                      <ChevronRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 rounded-xl hover:bg-[#373737] text-[#ffa116] hover:text-[#ff8f00] flex items-center gap-2 transition-colors text-xs font-medium text-left"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full px-3 py-2 rounded-xl hover:bg-[#373737] text-[#ffa116] flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User size={14} />{" "}
                      <span className="text-xs font-bold">Login</span>
                    </div>
                    <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Minor Actions */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className={glassButtonClass}
          onClick={() => setLeaderboardOpen((prev) => !prev)}
        >
          <Trophy size={18} className="text-[#ffb84d]" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          className={cn(glassButtonClass, "relative overflow-visible")}
          onClick={() => {
            if (Notification.permission === "default") {
              useNotificationStore.getState().requestPermission();
            }
            setNotificationOpen((prev) => !prev);
          }}
        >
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
            <Bell
              size={18}
              className={cn(
                "transition-colors duration-300",
                unreadCount > 0 ? "text-[#ffa116]" : "text-[#7dd3fc]",
              )}
            />
          </motion.div>

          {/* Glowing Red Dot */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-3.5 right-3.5"
              >
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-[#ffa116] rounded-full shadow-[0_0_8px_rgba(255,95,115,0.8)]" />
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 w-2.5 h-2.5 bg-[#ffa116] rounded-full animate-ping opacity-75" />

                  {/* Secondary intense ripple on NEW notification */}
                  {hasNewNotification && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-black"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.8, repeat: 3 }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setCheckInOpen(true)}
          className={cn(glassButtonClass, "relative")}
        >
          <Calendar size={18} className="text-[#86efac]" />
          {hasUnclaimedReward && (
            <div className="absolute top-3 right-3 w-2 h-2 bg-[#ffa116] rounded-full animate-pulse shadow-lg shadow-[#ffa116]/50"></div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RightSideUI;
