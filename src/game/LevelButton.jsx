import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, Star, Trophy } from "lucide-react";
import { getDifficultyMeta } from "../utils/challengeMeta";

const LevelButton = ({ level, isCurrentLevel, onClick }) => {
  const isCertificate = level.order === 54;
  const difficulty = getDifficultyMeta(level.order);

  const statusTone = level.completed
    ? "border-emerald-400/35 bg-emerald-400/5"
    : level.unlocked
      ? "border-[#2e3d54] bg-[#111a2a]"
      : "border-[#243042] bg-[#0f1521]/70";

  return (
    <motion.button
      onClick={onClick}
      disabled={!level.unlocked}
      className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 ${statusTone} ${
        level.unlocked
          ? "cursor-pointer hover:border-[#4b6386] hover:bg-[#152137]"
          : "cursor-not-allowed opacity-80"
      } group`}
      whileHover={level.unlocked ? { y: -2 } : {}}
      whileTap={level.unlocked ? { scale: 0.995 } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
              isCertificate
                ? "bg-linear-to-br from-[#facc15] to-[#f59e0b] border-[#fde68a] text-black"
                : "bg-[#1c2a3f] border-[#415672] text-[#d3deee]"
            }`}
          >
            {level.unlocked ? (
              isCertificate ? (
                <Trophy size={17} className="text-black" fill="currentColor" />
              ) : (
                React.isValidElement(level.icon)
                  ? React.cloneElement(level.icon, {
                      size: 18,
                      strokeWidth: 1.7,
                      className: "text-[#d3deee]",
                    })
                  : level.icon
              )
            ) : (
              <Lock size={15} className="text-slate-500" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.14em] truncate">
              {isCertificate ? "Certification" : `Level ${level.order}`}
            </p>
            <p className="text-base font-semibold text-slate-50 leading-tight truncate">
              {isCertificate ? "Professional Badge" : level.title || level.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCertificate && (
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${difficulty.pill}`}
            >
              {difficulty.label}
            </span>
          )}

          {level.completed ? (
            <CheckCircle2 size={17} className="text-emerald-400" />
          ) : (
            <ArrowRight
              size={17}
              className={
                level.unlocked
                  ? "text-slate-300 group-hover:text-white"
                  : "text-slate-600"
              }
            />
          )}
        </div>
      </div>

      {!isCertificate && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {(level.xp_reward || 0).toLocaleString()} XP
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={12}
                strokeWidth={2.2}
                className={
                  star <= (level.stars || 0)
                    ? "text-[#fbbf24] fill-[#fbbf24]"
                    : "text-slate-500 fill-slate-500"
                }
              />
            ))}
          </div>
        </div>
      )}

      {isCurrentLevel && level.unlocked && (
        <div className="mt-3">
          <span className="inline-flex text-[10px] px-2.5 py-1 rounded-md font-semibold bg-[#3b82f6]/15 text-[#93c5fd] border border-[#3b82f6]/35 uppercase tracking-wide">
            Current
          </span>
        </div>
      )}

      {!isCertificate && !level.unlocked && (
        <p className="mt-3 text-xs text-slate-500">Complete previous level to unlock</p>
      )}

      {isCertificate && (
        <p className="mt-3 text-xs text-[#f5d08d]">Unlock after completing all 53 levels</p>
      )}
    </motion.button>
  );
};

export default LevelButton;
