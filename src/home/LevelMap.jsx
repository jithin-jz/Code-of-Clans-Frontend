import React from "react";
import { motion } from "framer-motion";
import LevelButton from "../game/LevelButton";
import PlayButton from "./PlayButton";
import { useNavigate } from "react-router-dom";

const LevelMap = ({
  levels,
  handleLevelClick,
  user,
  isLeaderboardOpen,
  isNotificationOpen,
}) => {
  const navigate = useNavigate();
  // Standard Grid Layout
  return (
    <div
      className="w-full h-screen relative overflow-y-auto bg-[#0a0a0a] flex flex-col items-center pt-28 pb-20 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center pointer-events-auto"
          >
            {/* Game Title */}
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Clash of <span className="text-[#FFD700]">Code</span>
            </h1>

            {/* Brief Description */}
            <p className="text-gray-400 text-sm mb-10 max-w-sm leading-relaxed px-4 font-medium">
              A professional learn-by-doing platform. Build your legacy through
              hands-on challenges and master your craft one line at a time.
            </p>

            <div className="w-full max-w-[220px]">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 px-8 bg-transparent border-2 border-[#FFD700] text-[#FFD700] font-black uppercase tracking-widest rounded-full transition-all duration-500 hover:bg-[#FFD700] hover:text-black hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] active:scale-95 text-xs"
              >
                Launch Experience
              </button>
            </div>
          </motion.div>

          {/* Simple Footer - Bottom Positioned */}
          <div className="absolute bottom-10 left-0 right-0 opacity-40 pointer-events-none">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.25em]">
              Where practice meets mastery
            </p>
          </div>
        </div>
      )}

      {/* Play Button - Fixed */}
      {!isLeaderboardOpen && !isNotificationOpen && (
        <PlayButton
          user={user}
          levels={levels}
          className="fixed bottom-6 right-6 z-50 scale-90 origin-bottom-right"
        />
      )}

      {/* Added left and right padding to prevent overlap with fixed UI buttons */}
      <div
        className={`w-full max-w-[95%] px-10 transition-all duration-700 ${!user ? "blur-sm opacity-30 grayscale pointer-events-none select-none" : ""}`}
      >
        <div className="grid grid-cols-9 gap-3 gap-y-4 justify-items-center">
          {levels.map((level, index) => {
            const isCurrentLevel =
              level.unlocked && !levels[index + 1]?.unlocked;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className="relative group col-span-1"
              >
                {/* Active Pulse */}
                {isCurrentLevel && (
                  <div className="absolute inset-0 bg-[#FFD700]/20 rounded-xl blur-md animate-pulse"></div>
                )}

                <LevelButton
                  level={level}
                  isCurrentLevel={isCurrentLevel}
                  onClick={() => handleLevelClick(level)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
