import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Gem, User, LogOut, Calendar, Trophy, Bell, Play, ShoppingBag, MessageSquare } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import useNotificationStore from "../../stores/useNotificationStore";

const NavIcon = ({
  onClick,
  title,
  icon,
  className = "",
  badge = null,
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`group relative h-9 w-9 rounded-lg bg-transparent hover:bg-white/[0.08] transition-all duration-200 inline-flex items-center justify-center text-slate-400 hover:text-slate-100 shrink-0 ${className}`}
  >
    <span className="inline-flex items-center justify-center">{icon}</span>
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
        className="pointer-events-auto h-14 w-full border-b border-white/10 bg-[#0a1220]/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] px-4 sm:px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
      >
        {/* LEFT: Progress + XP */}
        <div className="flex items-center gap-2 justify-self-start">
          {user ? (
            <>
              {/* XP / Purchase */}
              <button
                type="button"
                onClick={() => navigate("/shop")}
                title="Buy XP"
                className="h-8 px-2.5 rounded-lg border border-[#a78bfa]/25 bg-[#a78bfa]/[0.08] hover:bg-[#a78bfa]/15 transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <Gem size={13} className="text-[#a78bfa]" />
                <span className="text-white font-bold text-xs">{xp.toLocaleString()}</span>
              </button>

              {/* Progress */}
              {challengeLevels.length > 0 && (
                <div className="hidden sm:inline-flex h-8 px-2.5 rounded-lg border border-white/10 bg-white/[0.04] items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-slate-500">
                    {solvedCount}/{challengeLevels.length}
                  </span>
                  <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#38bdf8] transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">
                    {completionPercent}%
                  </span>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="h-8 px-3 rounded-lg text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Log in
            </button>
          )}
        </div>

        {/* CENTER: Title */}
        <h1 className="text-sm sm:text-base font-bold tracking-[0.18em] text-slate-100 whitespace-nowrap px-2">
          CLASH OF CODE
        </h1>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1 justify-self-end">
          {user ? (
            <>
              <NavIcon
                onClick={() => setChatOpen((prev) => !prev)}
                title="Chat"
                icon={<MessageSquare size={16} />}
                className={isChatOpen ? "text-[#00af9b] bg-[#00af9b]/10" : ""}
              />

              <NavIcon
                onClick={() => setLeaderboardOpen((prev) => !prev)}
                title="Leaderboard"
                icon={<Trophy size={16} />}
              />

              <NavIcon
                onClick={() => {
                  if (Notification.permission === "default") {
                    useNotificationStore.getState().requestPermission();
                  }
                  setNotificationOpen((prev) => !prev);
                }}
                title="Notifications"
                icon={
                  <Motion.div
                    animate={
                      hasNewNotification
                        ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 0.5 }}
                  >
                    <Bell size={16} className={unreadCount > 0 ? "text-[#f59e0b]" : ""} />
                  </Motion.div>
                }
                className={unreadCount > 0 ? "text-[#f59e0b]" : ""}
                badge={
                  unreadCount > 0 ? (
                    <AnimatePresence>
                      <Motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="pointer-events-none absolute -top-0.5 -right-0.5 z-10 h-2 w-2 rounded-full bg-[#f59e0b] ring-2 ring-[#0a1220]"
                      />
                    </AnimatePresence>
                  ) : null
                }
              />

              <NavIcon
                onClick={() => setCheckInOpen(true)}
                title="Daily Check-in"
                icon={<Calendar size={16} />}
                badge={
                  hasUnclaimedReward ? (
                    <span className="pointer-events-none absolute -top-0.5 -right-0.5 z-10 h-2 w-2 rounded-full bg-[#f59e0b] ring-2 ring-[#0a1220] animate-pulse" />
                  ) : null
                }
              />

              <NavIcon
                onClick={() => navigate("/store")}
                title="Store"
                icon={<ShoppingBag size={16} />}
              />

              <div className="w-px h-5 bg-white/10 mx-1" />

              {/* Profile */}
              <button
                type="button"
                onClick={() => navigate("/profile")}
                title="Profile"
                className="h-8 w-8 rounded-lg overflow-hidden border border-white/15 hover:border-white/40 transition-all shrink-0"
              >
                {user?.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.06] flex items-center justify-center">
                    <User size={14} className="text-slate-400" />
                  </div>
                )}
              </button>

              <NavIcon
                onClick={handleLogout}
                title="Logout"
                icon={<LogOut size={14} />}
                className="text-slate-500 hover:text-rose-400"
              />

              <div className="w-px h-5 bg-white/10 mx-1" />
            </>
          ) : (
            <div className="w-px h-5 bg-white/10 mx-1" />
          )}

          {/* Play CTA */}
          <button
            type="button"
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
            className="h-8 px-4 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold tracking-wide transition-all duration-200 inline-flex items-center gap-1.5 shrink-0"
          >
            <Play size={12} fill="currentColor" />
            Play
          </button>
        </div>
      </Motion.nav>
    </div>
  );
};

export default HomeTopNav;
