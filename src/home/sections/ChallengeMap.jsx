import React, { useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Crown, Lock } from "lucide-react";
import LevelButton from "../../game/LevelButton";
import { getTrackMeta } from "../../utils/challengeMeta";

const TRACK_ORDER = [
  "Python Basics",
  "Data Structures",
  "Control Flow",
  "Functions & Patterns",
  "Standard Library",
  "OOP Mastery",
];

const ChallengeMap = ({ levels, handleLevelClick, user }) => {
  const navigate = useNavigate();

  const {
    certificateLevel,
    completedChallenges,
    totalChallenges,
    certificateProgressPercent,
    grouped,
    trackProgress,
  } = useMemo(() => {
    const sorted = [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));

    const cert =
      sorted.find((l) => l.slug === "certificate" || l.type === "CERTIFICATE") ||
      null;

    const normal = sorted.filter(
      (l) => l.slug !== "certificate" && l.type !== "CERTIFICATE"
    );

    const groupsMap = {};
    normal.forEach((level) => {
      const track = getTrackMeta(level.order).label;
      if (!groupsMap[track]) groupsMap[track] = [];
      groupsMap[track].push(level);
    });

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

    const completed = normal.filter((l) => l.completed).length;

    return {
      certificateLevel: cert,
      completedChallenges: completed,
      totalChallenges: normal.length,
      certificateProgressPercent: normal.length
        ? Math.round((completed / normal.length) * 100)
        : 0,
      grouped: groupsMap,
      trackProgress: progress,
    };
  }, [levels]);

  return (
    <div className="w-full h-screen relative overflow-hidden flex flex-col items-center justify-center bg-[#0b1220]">
      
      {/* LOCKED OVERLAY */}
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center">
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg"
          >
            <p className="text-[10px] tracking-[0.35em] uppercase text-slate-500 mb-4">
              Structured Python Track
            </p>

            <h1 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
              Master Python through
              <span className="block text-[#60a5fa]">
                deliberate progression
              </span>
            </h1>

            <p className="text-sm text-slate-400 mt-5 leading-relaxed max-w-md mx-auto">
              Solve focused challenges. Track real growth.
              Certification unlocks only when every level is complete.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-8 h-10 px-6 rounded-lg bg-white text-[#0f172a] 
                         text-xs font-semibold tracking-wide 
                         hover:bg-slate-200 transition-all duration-200"
            >
              Continue
            </button>
          </Motion.div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        className={`w-full h-[calc(100vh-64px)] mt-16 px-6 pt-4 transition-all duration-500 ${
          !user ? "blur-sm opacity-20 grayscale pointer-events-none select-none" : ""
        }`}
      >
        <div className="h-full overflow-y-auto space-y-6">

          {/* TRACK SECTIONS */}
          {TRACK_ORDER.map((track) => {
            const trackLevels = grouped[track] || [];
            if (!trackLevels.length) return null;

            return (
              <section
                key={track}
                className="rounded-xl border border-white/5 bg-[#111827]/70 backdrop-blur-md p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {track}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {trackProgress[track]?.solved || 0} / {trackLevels.length} completed
                    </p>
                  </div>

                  <div className="w-36">
                    <div className="h-1.5 rounded-full bg-[#1f2937] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#38bdf8]"
                        style={{ width: `${trackProgress[track]?.percent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {trackLevels.map((level, index) => {
                    const next = trackLevels[index + 1];
                    const isCurrentLevel = level.unlocked && !next?.unlocked;

                    return (
                      <LevelButton
                        key={level.id}
                        level={level}
                        isCurrentLevel={isCurrentLevel}
                        motionIndex={index}
                        onClick={() => handleLevelClick(level)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* CERTIFICATE */}
          {certificateLevel && (
            <section className="rounded-xl border border-yellow-500/10 bg-[#111827]/80 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] tracking-[0.25em] uppercase text-yellow-400 font-semibold">
                  Certification
                </h3>
                <span className="text-[11px] text-slate-500">
                  Final Milestone
                </span>
              </div>

              <button
                onClick={() => handleLevelClick(certificateLevel)}
                className={`w-full rounded-xl border p-5 text-left transition-all duration-200 ${
                  certificateLevel.unlocked
                    ? "border-yellow-400/40 bg-[#18181b] hover:border-yellow-400"
                    : "border-yellow-900/30 bg-[#121212] cursor-not-allowed"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-lg bg-yellow-400 text-black flex items-center justify-center">
                      {certificateLevel.unlocked ? (
                        <Crown size={18} />
                      ) : (
                        <Lock size={16} />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Python Mastery Certificate
                      </h4>

                      <p className="mt-2 text-xs text-slate-500">
                        {certificateLevel.unlocked
                          ? "View and share your achievement."
                          : "Complete all levels to unlock."}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={16}
                    className={
                      certificateLevel.unlocked
                        ? "text-yellow-400"
                        : "text-slate-600"
                    }
                  />
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                    <span>
                      {completedChallenges} / {totalChallenges}
                    </span>
                    <span>{certificateProgressPercent}%</span>
                  </div>

                  <div className="h-1.5 rounded-full bg-[#1f2937] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                      style={{ width: `${certificateProgressPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeMap;
