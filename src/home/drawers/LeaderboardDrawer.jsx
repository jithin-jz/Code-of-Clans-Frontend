import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, Medal, Users, X, Zap } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { SkeletonBase } from "../../common/SkeletonPrimitives";
import api from "../../services/api";
import useAuthStore from "../../stores/useAuthStore";

const LeaderboardDrawer = ({ isLeaderboardOpen, setLeaderboardOpen }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuthStore();

  // Fetch leaderboard data when drawer opens
  useEffect(() => {
    if (isLeaderboardOpen) {
      const fetchLeaderboard = async () => {
        setLoading(true);
        try {
          const response = await api.get("/challenges/leaderboard/");
          setUsers(response.data.slice(0, 20)); // Top 20
        } catch (error) {
          console.error("Failed to fetch leaderboard:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLeaderboard();
    }
  }, [isLeaderboardOpen]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return (
          <Crown size={14} className="text-[#ffa116] fill-[#ffa116]/30" />
        );
      case 1:
        return <Medal size={14} className="text-gray-400 fill-gray-400/30" />;
      case 2:
        return <Medal size={14} className="text-[#996200] fill-[#996200]/30" />;
      default:
        return null;
    }
  };

  return (
    <Motion.div
      className="fixed top-16 right-0 h-[calc(100vh-64px)] z-50 w-full sm:w-[390px]"
      initial={{ x: "100%" }}
      animate={{ x: isLeaderboardOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-full h-full bg-linear-to-b from-[#111d30]/95 via-[#0f1b2e]/95 to-[#0c1627]/95 backdrop-blur-3xl border-l border-white/15 flex flex-col pointer-events-auto shadow-2xl shadow-black/50 relative">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#3b82f6]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-10 w-32 h-32 bg-[#00af9b]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative h-16 border-b border-white/10 flex items-center justify-between px-5 bg-[#111d30]/90">
          {/* Header glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#7ea3d9]/30 to-transparent" />

          <div className="flex items-center gap-3">
            {/* Close Button */}
            <button
              onClick={() => setLeaderboardOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Leaderboard"
            >
              <X size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#ffa116]/20 to-[#ffa116]/5 border border-[#ffa116]/20 flex items-center justify-center">
              <Trophy size={16} className="text-[#ffa116]" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight block leading-tight font-sans">
                Leaderboard
              </span>
              <div className="flex items-center gap-1">
                <Users size={10} className="text-[#ffa116]" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">
                  Top Players
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10"
                >
                  <SkeletonBase className="w-8 h-8 rounded-none" />
                  <SkeletonBase className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-4 w-24" />
                    <SkeletonBase className="h-3 w-16" />
                  </div>
                  <SkeletonBase className="w-10 h-6 rounded-none" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <Trophy size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                No rankings yet
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Complete challenges to rank!
              </p>
            </div>
          ) : (
            users.map((rankUser, index) => {
              const isMe = currentUser?.username === rankUser.username;
              const isTopThree = index < 3;

              return (
                <Link
                  key={rankUser.username}
                  to={`/profile/${rankUser.username}`}
                  onClick={() => setLeaderboardOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                    isMe
                      ? "bg-[#ffa116]/10 border border-[#ffa116]/25 hover:bg-[#ffa116]/15"
                      : "bg-white/[0.03] border border-white/10 hover:bg-white/[0.07] hover:border-white/20"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isTopThree
                        ? "bg-linear-to-br from-[#ffa116]/20 to-[#ffa116]/5"
                        : "bg-white/10"
                    }`}
                  >
                    {getRankIcon(index) || (
                      <span className="text-xs font-bold text-gray-500">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full overflow-hidden ring-2 shrink-0 ${
                      isMe ? "ring-[#ffa116]/40" : "ring-white/10"
                    }`}
                  >
                    {rankUser.avatar ? (
                      <img
                        src={
                          rankUser.avatar.startsWith("http")
                            ? rankUser.avatar
                            : `${import.meta.env.VITE_API_URL.replace("/api", "")}${rankUser.avatar}`
                        }
                        alt={rankUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#00af9b]/30 to-[#ffa116]/20 flex items-center justify-center text-xs font-bold text-[#00af9b]">
                        {rankUser.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isMe ? "text-[#ffa116]" : "text-white"
                        }`}
                      >
                        {isMe ? "You" : rankUser.username}
                      </span>
                      {isTopThree && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            index === 0
                              ? "bg-[#ffa116]/20 text-[#ffa116]"
                              : index === 1
                                ? "bg-gray-400/20 text-gray-400"
                                : "bg-[#996200]/20 text-[#cc8400]"
                          }`}
                        >
                          {index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} className="text-[#ffa116]" />
                      <span className="text-xs font-bold text-[#ffa116]">
                        {rankUser.xp?.toLocaleString() || 0} XP
                      </span>
                      <span className="text-[10px] text-gray-600">•</span>
                      <span className="text-[10px] text-gray-500">
                        {rankUser.completed_levels} levels
                      </span>
                    </div>
                  </div>

                  {/* Rank Status Indicator (Optional/Visual) */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-[10px] font-bold ${isTopThree ? "text-[#ffa116]" : "text-gray-500"}`}
                    >
                      #{index + 1}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </Motion.div>
  );
};

export default LeaderboardDrawer;
