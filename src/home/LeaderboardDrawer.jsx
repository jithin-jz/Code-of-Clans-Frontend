import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, Medal, Users } from "lucide-react";
import { motion } from "framer-motion";
import { SkeletonBase } from "../common/SkeletonPrimitives";
import api from "../services/api";
import useAuthStore from "../stores/useAuthStore";

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
          <Crown size={14} className="text-yellow-500 fill-yellow-500/30" />
        );
      case 1:
        return <Medal size={14} className="text-gray-400 fill-gray-400/30" />;
      case 2:
        return <Medal size={14} className="text-amber-700 fill-amber-700/30" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="fixed top-0 right-0 h-full z-50 w-[380px]"
      initial={{ x: "100%" }}
      animate={{ x: isLeaderboardOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="w-full h-full bg-linear-to-b from-[#0d0d0d] via-[#0a0a0a] to-[#080808] backdrop-blur-3xl border-l border-white/5 flex flex-col pointer-events-auto shadow-2xl shadow-black/50 relative">
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative h-16 border-b border-white/5 flex items-center justify-between px-5 bg-linear-to-r from-[#141414] to-[#0f0f0f]">
          {/* Header glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#FFD700]/30 to-transparent" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/20 flex items-center justify-center">
              <Trophy size={16} className="text-[#FFD700]" />
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight block leading-tight">
                Leaderboard
              </span>
              <div className="flex items-center gap-1">
                <Users size={10} className="text-[#FFD700]" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
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
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5"
                >
                  <SkeletonBase className="w-8 h-8 rounded-lg" />
                  <SkeletonBase className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-4 w-24" />
                    <SkeletonBase className="h-3 w-16" />
                  </div>
                  <SkeletonBase className="w-10 h-6 rounded-md" />
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
                      ? "bg-[#FFD700]/10 border border-[#FFD700]/20 hover:bg-[#FFD700]/15"
                      : "bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isTopThree
                        ? "bg-linear-to-br from-[#FFD700]/20 to-[#FFD700]/5"
                        : "bg-white/5"
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
                    className={`w-9 h-9 rounded-full overflow-hidden ring-2 ${
                      isMe ? "ring-[#FFD700]/40" : "ring-white/10"
                    }`}
                  >
                    {rankUser.avatar ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL.replace("/api", "")}${rankUser.avatar}`}
                        alt={rankUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-500/30 to-purple-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                        {rankUser.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold truncate ${
                          isMe ? "text-[#FFD700]" : "text-white"
                        }`}
                      >
                        {isMe ? "You" : rankUser.username}
                      </span>
                      {isTopThree && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            index === 0
                              ? "bg-yellow-500/20 text-yellow-500"
                              : index === 1
                                ? "bg-gray-400/20 text-gray-400"
                                : "bg-amber-700/20 text-amber-600"
                          }`}
                        >
                          {index === 0 ? "1ST" : index === 1 ? "2ND" : "3RD"}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {rankUser.completed_levels} levels •{" "}
                      {rankUser.xp?.toLocaleString() || 0} XP
                    </p>
                  </div>

                  {/* XP Badge */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-500">
                      {rankUser.xp?.toLocaleString() || 0}
                    </span>
                    <p className="text-[9px] text-gray-600">XP</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer with shortcut hint */}
        <div className="p-3 border-t border-white/5 bg-linear-to-t from-[#0a0a0a] to-transparent">
          <p className="text-center text-[9px] text-gray-600">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-white/5 rounded text-gray-500 font-mono">
              Ctrl+L
            </kbd>{" "}
            to toggle
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardDrawer;
