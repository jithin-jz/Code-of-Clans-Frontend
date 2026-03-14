import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Star,
  Trophy,
  Terminal,
  Layers,
  Zap,
  FunctionSquare,
  Library,
  Box,
  Gem,
} from "lucide-react";
import { getDifficultyMeta, getTrackMeta } from "../utils/challengeMeta";

const DIFF_STYLES = {
  Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

const LevelButton = ({ level, isCurrentLevel, onClick }) => {
  const isCertificate =
    level.type === "CERTIFICATE" || level.slug === "certificate";
  const difficulty = getDifficultyMeta(level.order);
  const track = getTrackMeta(level.order);

  const getLevelIcon = () => {
    if (isCertificate)
      return (
        <Trophy
          size={15}
          className={level.unlocked ? "text-amber-400" : "text-neutral-700"}
        />
      );
    if (level.icon && React.isValidElement(level.icon)) return level.icon;
    switch (track.key) {
      case "basics":
        return <Terminal size={15} />;
      case "ds":
        return <Layers size={15} />;
      case "flow":
        return <Zap size={15} />;
      case "functions":
        return <FunctionSquare size={15} />;
      case "stdlib":
        return <Library size={15} />;
      case "oop":
        return <Box size={15} />;
      default:
        return <Terminal size={15} />;
    }
  };

  /* ── State-based styles ── */
  const isCompleted = level.completed;
  const isUnlocked = level.unlocked;
  const isLocked = !isUnlocked;

  const cardBase = isCompleted
    ? "bg-[#0a0a0a] border-l-2 border-l-emerald-500 border-white/20 shadow-sm"
    : isUnlocked
      ? "bg-black border-[#333] hover:border-[#666] hover:bg-[#0a0a0a] transition-all duration-200"
      : "bg-black border-white/60 shadow-inner";

  const iconBg = isCertificate
    ? isUnlocked
      ? "bg-amber-400/10 border-amber-500/30 text-amber-400"
      : "bg-black border-white/30 text-white"
    : isCompleted
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      : isUnlocked
        ? "bg-[#111] border-[#333] text-white"
        : "bg-black border-white/20 text-white";

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        w-full text-left rounded-xl border p-3.5 min-h-[120px]
        transition-all duration-150 group relative overflow-hidden
        ${cardBase}
        ${isUnlocked ? "cursor-pointer hover:-translate-y-px active:scale-[0.99]" : "cursor-not-allowed"}
      `}
    >
      {/* Top: icon + title + status */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}
          >
            {isUnlocked ? (
              React.cloneElement(getLevelIcon(), { size: 14, strokeWidth: 2 })
            ) : (
              <Lock size={12} className="text-white" />
            )}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[9px] font-mono text-white uppercase tracking-widest mb-0.5 font-bold">
              {isCertificate ? "Certification" : `Level ${level.order}`}
            </p>
            <p
              className={`text-[12px] font-semibold leading-snug break-words ${
                isCompleted
                  ? "text-white"
                  : isUnlocked
                    ? "text-white"
                    : "text-white"
              }`}
            >
              {isCertificate ? "Professional Badge" : level.title || level.name}
            </p>
          </div>
        </div>

        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {isCompleted ? (
            <CheckCircle2 size={15} className="text-emerald-500" />
          ) : isUnlocked ? (
            <ArrowRight
              size={14}
              className="text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-all"
            />
          ) : (
            <Lock size={13} className="text-neutral-800" />
          )}
        </div>
      </div>

      {/* Bottom: XP, difficulty, stars */}
      {!isCertificate && (
        <div className="mt-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            {/* Difficulty pill */}
            <span
              className={`ds-pill border text-[9px] ${DIFF_STYLES[difficulty.label] || "bg-[#1a1a1a] text-neutral-600 border-[#242424]"}`}
            >
              {difficulty.label}
            </span>
            {/* XP */}
            {isUnlocked && (
              <span className="flex items-center gap-1.5 text-[9px] text-white/40 font-mono">
                <Gem size={10} className="text-red-500 fill-red-500/10" />
                {(level.xp_reward || 0).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stars */}
          <div className="flex gap-0.5">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                size={9}
                strokeWidth={2.5}
                className={
                  star <= (level.stars || 0)
                    ? "text-amber-400 fill-amber-400"
                    : "text-neutral-800 fill-neutral-800"
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Current level badge */}
      {isCurrentLevel && isUnlocked && (
        <div className="mt-2 relative z-10">
          <span className="ds-pill ds-pill-purple text-[9px]">In Progress</span>
        </div>
      )}

      {/* Locked hint */}
      {!isCertificate && isLocked && (
        <p className="mt-2 text-[10px] text-white font-medium">
          Complete prior level to unlock
        </p>
      )}

      {isCertificate && (
        <p className="mt-2 text-[11px] text-amber-600 font-medium">
          {level.unlock_message || "Complete all levels to unlock"}
        </p>
      )}
    </button>
  );
};

export default LevelButton;
