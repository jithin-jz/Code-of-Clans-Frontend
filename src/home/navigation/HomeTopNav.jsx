import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, User, LogOut, Calendar, Trophy, Bell, Play, ShoppingBag, MessageSquare } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import useNotificationStore from "../../stores/useNotificationStore";

const NavAction = ({
  onClick,
  title,
  icon,
  label,
  className = "",
  badge = null,
  showLabel = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`group relative h-10 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/10 hover:border-white/40 transition-all duration-200 inline-flex items-center text-slate-200 shrink-0 ${showLabel ? "px-3 gap-2" : "w-10 justify-center"} ${className}`}
  >
    <span className="inline-flex items-center justify-center">{icon}</span>
    {showLabel ? <span className="text-xs font-semibold tracking-wide">{label}</span> : null}
    {badge}
  </button>
);

const HomeTopNav = ({
  user,
  levels,
  handleLogout,
  setChatOpen,
  isChatOpen,
  setCheckInOpen,
  setLeaderboardOpen,
  setNotificationOpen,
  hasUnclaimedReward,
}) => {
  const navigate = useNavigate();
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadCountRef = useRef(0);

  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (
      unreadCount > prevUnreadCountRef.current &&
      prevUnreadCountRef.current > 0
    ) {
      const triggerTimeout = setTimeout(() => setHasNewNotification(true), 10);
      const resetTimeout = setTimeout(() => setHasNewNotification(false), 3000);
      return () => {
        clearTimeout(triggerTimeout);
        clearTimeout(resetTimeout);
      };
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const activeLevel = levels?.find(
    (l) =>
      l.unlocked &&
      !l.completed &&
      l.slug !== "certificate" &&
      l.type !== "CERTIFICATE",
  );
  const latestLevel = levels
    ?.filter((l) => l.unlocked && l.slug !== "certificate" && l.type !== "CERTIFICATE")
    .pop();
  const currentLevel = activeLevel || latestLevel || levels?.[0];
  const xp = user?.profile?.xp || 0;
  const challengeLevels = useMemo(
    () =>
      (levels || []).filter(
        (l) => l.slug !== "certificate" && l.type !== "CERTIFICATE",
      ),
    [levels],
  );
  const solvedCount = challengeLevels.filter((l) => l.completed).length;
  const completionPercent = challengeLevels.length
    ? Math.round((solvedCount / challengeLevels.length) * 100)
    : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <Motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto h-16 w-full border-b border-white/10 bg-[#0a1220]/82 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] px-3 sm:px-6 lg:px-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
      >
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar justify-self-start">
          <NavAction
            onClick={() => navigate(user ? "/profile" : "/login")}
            title={user ? "Profile" : "Login"}
            label={user ? "Profile" : "Login"}
            icon={
              user?.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt="profile"
                  className="w-6 h-6 rounded-full object-cover border border-white/30"
                />
              ) : (
                <User size={15} className="text-sky-300" />
              )
            }
            className={user ? "border-[#7ea3d9]/50" : ""}
          />

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="h-10 w-10 rounded-full border border-rose-400/35 text-rose-200 hover:text-white hover:bg-rose-500/20 transition-colors inline-flex items-center justify-center shrink-0"
            >
              <LogOut size={13} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => navigate("/shop")}
            title="XP"
            className="h-10 px-2.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            <span className="h-7 w-7 rounded-full border border-white/15 bg-white/[0.04] inline-flex items-center justify-center">
              <Star size={14} className="text-[#f59e0b]" fill="currentColor" />
            </span>
            <p className="text-white font-extrabold text-sm leading-none min-w-[44px] text-right">
              {xp.toLocaleString()}
            </p>
          </button>

          {user && challengeLevels.length > 0 ? (
            <div className="h-10 px-3 rounded-full border border-white/20 bg-white/[0.05] inline-flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-slate-400">
                Progress
              </span>
              <span className="text-xs font-bold text-white">
                {solvedCount}/{challengeLevels.length}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/35" />
              <span className="text-xs font-bold text-slate-200">
                {completionPercent}%
              </span>
            </div>
          ) : null}

          {!user ? (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-10 px-3 rounded-full border border-sky-400/35 text-sky-200 hover:text-white hover:bg-sky-500/20 transition-colors text-xs font-semibold shrink-0"
            >
              Login
            </button>
          ) : null}
        </div>

        <div className="px-2 sm:px-4">
          <h1 className="text-sm sm:text-base font-bold tracking-[0.18em] text-slate-100 whitespace-nowrap">
            CLASH OF CODE
          </h1>
        </div>

        <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar justify-self-end">
          <NavAction
            onClick={() => navigate("/store")}
            title="Store"
            label="Store"
            icon={<ShoppingBag size={15} className="text-[#f43f5e]" />}
          />

          <NavAction
            onClick={() => setChatOpen((prev) => !prev)}
            title="Chat"
            label="Chat"
            icon={<MessageSquare size={15} className="text-[#00af9b]" />}
            className={isChatOpen ? "border-[#00af9b]/60 bg-[#00af9b]/15" : ""}
          />

          <NavAction
            onClick={() => setLeaderboardOpen((prev) => !prev)}
            title="Ranks"
            label="Ranks"
            icon={<Trophy size={15} className="text-[#f59e0b]" />}
          />

          <NavAction
            onClick={() => {
              if (Notification.permission === "default") {
                useNotificationStore.getState().requestPermission();
              }
              setNotificationOpen((prev) => !prev);
            }}
            title="Alerts"
            label="Alerts"
            icon={
              <Motion.div
                animate={
                  hasNewNotification
                    ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <Bell
                  size={15}
                  className={unreadCount > 0 ? "text-[#f59e0b]" : "text-slate-300"}
                />
              </Motion.div>
            }
            className={unreadCount > 0 ? "border-[#f59e0b]/50" : ""}
            badge={
              unreadCount > 0 ? (
                <AnimatePresence>
                  <Motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="pointer-events-none absolute top-1 right-1 z-10 h-2.5 w-2.5 rounded-full bg-[#f59e0b] ring-2 ring-[#0a1220]"
                  />
                </AnimatePresence>
              ) : null
            }
          />

          <NavAction
            onClick={() => setCheckInOpen(true)}
            title="Check-in"
            label="Check-in"
            icon={<Calendar size={15} className="text-emerald-300" />}
            badge={
              hasUnclaimedReward ? (
                <span className="pointer-events-none absolute top-1 right-1 z-10 h-2.5 w-2.5 rounded-full bg-[#f59e0b] ring-2 ring-[#0a1220] animate-pulse" />
              ) : null
            }
          />

          <NavAction
            onClick={() => {
              if (!user) {
                navigate("/login");
                return;
              }
              if (currentLevel?.slug) {
                navigate(`/level/${currentLevel.slug}`);
              }
            }}
            title="Play"
            label="Play"
            icon={<Play size={15} fill="currentColor" className="text-white ml-0.5" />}
            showLabel
            className="border-[#ef4444]/70 bg-[#ef4444] hover:bg-[#dc2626] hover:border-[#ef4444]"
          />
        </div>
      </Motion.nav>
    </div>
  );
};

export default HomeTopNav;
