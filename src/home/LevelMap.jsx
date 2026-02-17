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
      className="w-full h-screen relative overflow-hidden flex flex-col items-center justify-center custom-scrollbar"
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
              Clash of <span className="text-[#ffa116]">Code</span>
            </h1>

            {/* Brief Description */}
            <p className="text-slate-300 text-sm mb-10 max-w-sm leading-relaxed px-4 font-medium">
              A professional learn-by-doing platform. Build your legacy through
              hands-on challenges and master your craft one line at a time.
            </p>

            <div className="w-full max-w-[220px]">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 px-8 bg-gradient-to-r from-[#111111] to-[#1f2937] border-2 border-[#2f2f2f] text-white font-black uppercase tracking-widest rounded-2xl transition-all duration-300 hover:from-[#ffa116] hover:to-[#ff8f00] hover:border-[#ffa116] hover:text-black active:scale-95 text-xs shadow-lg"
              >
                Launch Experience
              </button>
            </div>
          </motion.div>

          {/* Simple Footer - Bottom Positioned */}
          <div className="absolute bottom-10 left-0 right-0 opacity-40 pointer-events-none">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">
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

      {/* Level icons directly on home background */}
      <div
        className={`w-full max-w-[min(1400px,calc(100vw-180px))] h-[calc(100vh-180px)] mt-14 mb-12 px-8 sm:px-10 py-6 transition-all duration-700 ${!user ? "blur-sm opacity-30 grayscale pointer-events-none select-none" : ""}`}
      >
        <div className="h-full grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-x-8 gap-y-8 md:gap-x-10 md:gap-y-10 justify-items-center content-start">
          {levels.map((level, index) => {
            const isCurrentLevel =
              level.unlocked && !levels[index + 1]?.unlocked;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className="relative group h-10 w-10"
              >
                {/* Active Pulse */}
                {isCurrentLevel && (
                  <div className="absolute -inset-2 bg-[#ffa116]/25 rounded-2xl blur-xl animate-pulse"></div>
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
