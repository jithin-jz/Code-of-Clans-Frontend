import React from "react";
import { motion } from "framer-motion";
import { Star, Lock, Trophy } from "lucide-react";

// 3D Level Button
const LevelButton = ({ level, isCurrentLevel, onClick }) => {
  const baseStyle = level.unlocked
    ? {
        background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)", // Zinc 900 -> 950
        border: "1.5px solid #fbbf24", // Gold Border
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.6), 0 0 15px rgba(251, 191, 36, 0.05)",
      }
    : {
        background: "#09090b", // Zinc 950
        border: "1px solid #27272a", // Zinc 800
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
      };

  const isCertificate = level.order === 54;

  const renderIcon = (icon, isUnlocked) => {
    if (!icon) return null;
    const size = isCertificate ? 24 : 20;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        size,
        strokeWidth: 1.5,
        className: `transition-all duration-300 ${isUnlocked ? "text-white" : "text-zinc-600"}`,
      });
    }
    return icon;
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={!level.unlocked}
      className={`relative flex flex-col items-center ${level.unlocked ? "cursor-pointer" : "cursor-not-allowed"} group`}
      whileHover={level.unlocked ? { scale: 1.05, y: -2 } : {}}
      whileTap={level.unlocked ? { scale: 0.95, y: 1 } : {}}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all duration-300
                ${isCurrentLevel ? "ring-2 ring-yellow-400 ring-offset-4 ring-offset-[#09090b] shadow-[0_0_20px_rgba(250,204,21,0.2)]" : ""}
                ${isCertificate ? "bg-linear-to-br from-yellow-600 to-yellow-900 border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)]" : ""}
                ${!level.unlocked ? "opacity-60 grayscale" : ""}
            `}
        style={!isCertificate ? baseStyle : {}}
      >
        {/* Glass Gloss */}
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent rounded-[10px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center">
          {level.unlocked ? (
            <div className="drop-shadow-lg">
              {isCertificate ? (
                <Trophy
                  size={18}
                  className="text-yellow-100"
                  fill="currentColor"
                />
              ) : (
                renderIcon(level.icon, true)
              )}
            </div>
          ) : (
            <div className="opacity-40">
              {isCertificate ? (
                <Trophy size={16} className="text-zinc-500" />
              ) : (
                <Lock size={14} className="text-zinc-500" />
              )}
            </div>
          )}
        </div>

        {/* Stars (Small Overlay) */}
        {level.unlocked && !isCertificate && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 bg-zinc-900/90 rounded-full px-1.5 py-0.5 backdrop-blur-md border border-white/10 shadow-lg transform scale-90 z-20">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={10}
                strokeWidth={2.5}
                className={`${star <= (level.stars || 0) ? "text-yellow-400 fill-yellow-400" : "text-zinc-800 fill-zinc-900"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="mt-2 transition-transform duration-300 group-hover:scale-110">
        <p
          className={`text-[11px] font-bold tracking-wider ${
            isCertificate
              ? "text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
              : level.unlocked
                ? "text-zinc-100 shadow-sm"
                : "text-zinc-500/80"
          }`}
        >
          {isCertificate ? "BADGE" : `L${level.order || level.id}`}
        </p>
      </div>
    </motion.button>
  );
};

export default LevelButton;
