import React from "react";
import { motion as Motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Lock, Star, Trophy } from "lucide-react";
import { getDifficultyMeta } from "../utils/challengeMeta";

const LevelButton = ({ level, isCurrentLevel, onClick, motionIndex = 0 }) => {
  const isCertificate = level.type === "CERTIFICATE" || level.slug === "certificate";
  const difficulty = getDifficultyMeta(level.order);

  const statusTone = level.completed
    ? "border-emerald-400/35 bg-emerald-400/5"
    : level.unlocked
      ? "border-[#2e3d54] bg-[#111a2a]"
      : "border-[#243042] bg-[#0f1521]/70";

  return (
    <Motion.button
      onClick={onClick}
      disabled={!level.unlocked}
      className={`w-full text-left rounded-xl border p-3 sm:p-3.5 min-h-[160px] transition-all duration-200 ${statusTone} ${
        level.unlocked
          ? "cursor-pointer hover:border-[#4b6386] hover:bg-[#152137] hover:shadow-[0_14px_32px_rgba(2,8,22,0.45)]"
          : "cursor-not-allowed opacity-80"
      } group`}
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(motionIndex * 0.045, 0.28),
      }}
      whileHover={
        level.unlocked
          ? {
              y: -4,
              scale: 1.01,
              transition: { type: "spring", stiffness: 260, damping: 20 },
            }
          : {}
      }
      whileTap={level.unlocked ? { scale: 0.992 } : {}}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
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
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-[0.14em] whitespace-normal">
              {isCertificate ? "Certification" : `Level ${level.order}`}
            </p>
            <p className="text-[13px] sm:text-[14px] font-semibold text-slate-50 leading-snug whitespace-normal break-words">
              {isCertificate ? "Professional Badge" : level.title || level.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isCertificate && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${difficulty.pill}`}
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
                  ? "text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition-transform duration-200"
                  : "text-slate-600"
              }
            />
          )}
        </div>
      </div>

      {!isCertificate && (
        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {(level.xp_reward || 0).toLocaleString()} XP
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={11}
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
        <div className="mt-2.5">
          <span className="inline-flex text-[10px] px-2.5 py-1 rounded-md font-semibold bg-[#3b82f6]/15 text-[#93c5fd] border border-[#3b82f6]/35 uppercase tracking-wide">
            Current
          </span>
        </div>
      )}

      {!isCertificate && !level.unlocked && (
        <p className="mt-2.5 text-xs text-slate-500">Complete previous level to unlock</p>
      )}

      {isCertificate && (
        <p className="mt-2.5 text-xs text-[#f5d08d]">
          {level.unlock_message || "Unlock after completing all levels"}
        </p>
      )}
    </Motion.button>
  );
};

export default LevelButton;
