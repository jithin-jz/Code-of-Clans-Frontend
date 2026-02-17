import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, MapPin, Crown, Star, Sparkles } from "lucide-react";

const StatsGrid = ({ profileUser, isOwnProfile, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {[1, 2, 3, 4].map((i) => (
             <div key={i} className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-col gap-2 animate-pulse h-[88px]">
                <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                <div>
                   <div className="h-6 w-16 bg-white/5 rounded-md mb-1"></div>
                   <div className="h-3 w-10 bg-white/5 rounded-md"></div>
                </div>
             </div>
         ))}
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        {
          label: "Level",
          value: Math.floor((profileUser.profile?.xp || 0) / 1000) + 1,
          icon: Crown,
          color: "text-[#ffb84d]",
        },
        {
          label: "Total XP",
          value: profileUser.profile?.xp?.toLocaleString() || 0,
          icon: Star,
          color: "text-[#ffa116]",
        },
        {
          label: "Followers",
          value: profileUser.followers_count || 0,
          icon: Users,
          color: "text-[#00af9b]",
        },
        {
          label: "Following",
          value: profileUser.following_count || 0,
          icon: MapPin,
          color: "text-green-400",
        },
      ].map((stat, i) => (
        <div
          key={i}
          className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-col gap-2 hover:bg-white/5 transition-colors"
        >
          <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color}`}>
            <stat.icon size={16} />
          </div>
          <div>
            <div className="text-xl font-black text-white">{stat.value}</div>
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
              {stat.label}
            </div>
          </div>
          {stat.label === "Total XP" && isOwnProfile && (
            <button
              onClick={() => navigate("/shop")}
              className="ml-auto p-1.5 bg-[#ffa116]/10 hover:bg-[#ffa116]/20 rounded-lg text-[#ffa116] transition-colors"
              title="Buy XP"
            >
              <Sparkles size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(StatsGrid);
