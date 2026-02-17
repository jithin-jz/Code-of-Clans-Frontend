import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Lock,
  BarChart3,
  Target,
  Sparkles,
} from "lucide-react";
import LevelButton from "../game/LevelButton";
import { getTrackMeta } from "../utils/challengeMeta";

const TRACK_ORDER = [
  "Python Basics",
  "Data Structures",
  "Control Flow",
  "Functions & Patterns",
  "Standard Library",
  "OOP Mastery",
];

const LevelMap = ({ levels, handleLevelClick, user }) => {
  const navigate = useNavigate();

  const {
    challengeLevels,
    certificateLevel,
    solvedCount,
    unlockedCount,
    grouped,
    totalStars,
    maxStars,
    trackProgress,
    completionPercent,
  } = useMemo(() => {
    const sorted = [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));
    const cert = sorted.find((l) => l.order === 54) || null;
    const normal = sorted.filter((l) => l.order !== 54);

    const groupsMap = {};
    normal.forEach((level) => {
      const track = getTrackMeta(level.order).label;
      if (!groupsMap[track]) groupsMap[track] = [];
      groupsMap[track].push(level);
    });

    const stars = normal.reduce((sum, level) => sum + (level.stars || 0), 0);
    const progress = {};

    Object.entries(groupsMap).forEach(([trackName, trackLevels]) => {
      const solved = trackLevels.filter((l) => l.completed).length;
      progress[trackName] = {
        solved,
        total: trackLevels.length,
        percent: trackLevels.length
          ? Math.round((solved / trackLevels.length) * 100)
          : 0,
      };
    });

    const completion = normal.length
      ? Math.round((normal.filter((l) => l.completed).length / normal.length) * 100)
      : 0;

    return {
      challengeLevels: normal,
      certificateLevel: cert,
      solvedCount: normal.filter((l) => l.completed).length,
      unlockedCount: normal.filter((l) => l.unlocked).length,
      grouped: groupsMap,
      totalStars: stars,
      maxStars: normal.length * 3,
      trackProgress: progress,
      completionPercent: completion,
    };
  }, [levels]);

  return (
    <div
      className="w-full h-screen relative overflow-hidden flex flex-col items-center justify-center"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="pointer-events-auto max-w-2xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-[#2a3648] bg-[#121b2a]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-5">
              <Sparkles size={12} className="text-[#60a5fa]" />
              Professional Python Track
            </p>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.05]">
              Build Interview-Ready
              <span className="block text-[#60a5fa]">Python Skills</span>
            </h1>
            <p className="text-slate-300 text-base mt-5 mb-10 max-w-xl mx-auto leading-relaxed">
              Structured challenge roadmap with verified progression, clean code
              practice, and milestone-based learning.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="h-12 px-8 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-sm tracking-wide transition-colors"
            >
              Login To Start Solving
            </button>
          </motion.div>
        </div>
      )}

      <div
        className={`w-full h-[calc(100vh-92px)] mt-16 mb-2 px-3 sm:px-5 lg:px-6 py-3 transition-all duration-700 ${
          !user ? "blur-sm opacity-25 grayscale pointer-events-none select-none" : ""
        }`}
      >
        <div className="h-full overflow-y-auto pr-1 pb-4 space-y-4 custom-scrollbar">
          <section className="w-full rounded-2xl border border-white/12 bg-linear-to-br from-white/[0.12] via-white/[0.07] to-white/[0.03] backdrop-blur-xl p-4 sm:p-5 shadow-[0_22px_60px_rgba(0,0,0,0.3)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-white/15 bg-[#101a29]/65 backdrop-blur-md p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Solved
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  {solvedCount}
                  <span className="text-slate-500 text-base font-semibold">
                    /{challengeLevels.length}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#101a29]/65 backdrop-blur-md p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Lock size={14} className="text-sky-300" />
                  <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Unlocked
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  {unlockedCount}
                  <span className="text-slate-500 text-base font-semibold">
                    /{challengeLevels.length}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#101a29]/65 backdrop-blur-md p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Target size={14} className="text-amber-300" />
                  <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Star Score
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  {totalStars}
                  <span className="text-slate-500 text-base font-semibold">
                    /{maxStars}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-[#101a29]/65 backdrop-blur-md p-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <BarChart3 size={14} className="text-violet-300" />
                  <span className="text-[11px] uppercase tracking-[0.16em] font-semibold">
                    Completion
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  {completionPercent}
                  <span className="text-slate-500 text-base font-semibold">%</span>
                </p>
              </div>
            </div>
          </section>

          {TRACK_ORDER.map((track) => {
            const trackLevels = grouped[track] || [];
            if (!trackLevels.length) return null;

            return (
              <section key={track} className="w-full rounded-2xl border border-white/12 bg-[#0f1827]/64 backdrop-blur-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{track}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {trackProgress[track]?.solved || 0}/{trackLevels.length} solved
                    </p>
                  </div>
                  <div className="w-36">
                    <div className="h-2 rounded-full bg-[#1d2736] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-[#3b82f6] to-[#38bdf8]"
                        style={{ width: `${trackProgress[track]?.percent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {trackLevels.map((level, index) => {
                    const next = trackLevels[index + 1];
                    const isCurrentLevel = level.unlocked && !next?.unlocked;

                    return (
                      <LevelButton
                        key={level.id}
                        level={level}
                        isCurrentLevel={isCurrentLevel}
                        onClick={() => handleLevelClick(level)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          {certificateLevel && (
            <section className="w-full rounded-2xl border border-[#f1d39b]/25 bg-[#2a2216]/62 backdrop-blur-xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-[#f8d08b] uppercase tracking-[0.16em] mb-3">
                Certification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <LevelButton
                  level={certificateLevel}
                  isCurrentLevel={false}
                  onClick={() => handleLevelClick(certificateLevel)}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
