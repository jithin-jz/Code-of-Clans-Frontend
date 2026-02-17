import React from "react";
import { motion } from "framer-motion";
import { Star, Lock, Trophy } from "lucide-react";

// 3D Level Button
const LevelButton = ({ level, isCurrentLevel, onClick }) => {
  const baseStyle = level.unlocked
    ? {
        background: "linear-gradient(160deg, #334155, #2b3542)",
        border: "1.5px solid #7c8fa8",
        boxShadow: "0 10px 18px rgba(0, 0, 0, 0.35)",
      }
    : {
        background: "#27303b",
        border: "1px solid #394656",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      };

  const isCertificate = level.order === 54;

  const renderIcon = (icon, isUnlocked) => {
    if (!icon) return null;
    const size = isCertificate ? 24 : 20;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        size,
        strokeWidth: 1.5,
        className: `transition-all duration-300 ${isUnlocked ? "text-[#e2e8f0]" : "text-slate-500"}`,
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
                ${isCurrentLevel ? "ring-2 ring-[#ffa116] ring-offset-4 ring-offset-[#1a1a1a] shadow-[0_0_20px_rgba(255,161,22,0.35)]" : ""}
                ${isCertificate ? "bg-gradient-to-br from-[#ffb84d] via-[#ffa116] to-[#d97706] border-2 border-[#fef3c7] shadow-[0_0_20px_rgba(255,161,22,0.35)]" : ""}
                ${!level.unlocked ? "opacity-60 grayscale" : ""}
            `}
        style={!isCertificate ? baseStyle : {}}
      >
        {/* Glass Gloss */}
        <div className="absolute inset-0 bg-white/10 rounded-[10px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center">
          {level.unlocked ? (
            <div className="drop-shadow-lg">
              {isCertificate ? (
                <Trophy
                  size={18}
                  className="text-white"
                  fill="currentColor"
                />
              ) : (
                renderIcon(level.icon, true)
              )}
            </div>
          ) : (
            <div className="opacity-40">
              {isCertificate ? (
                <Trophy size={16} className="text-slate-500" />
              ) : (
                <Lock size={14} className="text-slate-500" />
              )}
            </div>
          )}
        </div>

        {/* Stars (Small Overlay) */}
        {level.unlocked && !isCertificate && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 bg-[#262626] rounded-full px-1.5 py-0.5 backdrop-blur-md border border-[#3a3a3a] shadow-lg transform scale-90 z-20">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={10}
                strokeWidth={2.5}
                className={`${star <= (level.stars || 0) ? "text-[#ffb84d] fill-[#ffb84d]" : "text-slate-300 fill-slate-300"}`}
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
              ? "text-[#ffa116]"
              : level.unlocked
                ? "text-white shadow-sm"
                : "text-slate-400"
          }`}
        >
          {isCertificate ? "BADGE" : `L${level.order || level.id}`}
        </p>
      </div>
    </motion.button>
  );
};

export default LevelButton;
