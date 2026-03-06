import React, { useMemo } from "react";
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

const TRACK_DESCRIPTION = {
  "Python Basics": "Core syntax, variables, and fundamental concepts",
  "Data Structures": "Lists, dicts, sets, and complex data types",
  "Control Flow": "Conditionals, loops, and program logic",
  "Functions & Patterns": "Functions, closures, decorators, and design",
  "Standard Library": "Built-in modules, itertools, collections, and more",
  "OOP Mastery": "Classes, inheritance, polymorphism, and design",
};

const ChallengeMap = ({ levels, handleLevelClick }) => {
  const {
    certificateLevel,
    completedChallenges,
    totalChallenges,
    certificateProgressPercent,
    grouped,
    trackProgress,
  } = useMemo(() => {
    const sorted = [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));
    const cert = sorted.find((l) => l.slug === "certificate" || l.type === "CERTIFICATE") || null;
    const normal = sorted.filter((l) => l.slug !== "certificate" && l.type !== "CERTIFICATE");

    const groupsMap = {};
    normal.forEach((level) => {
      const track = getTrackMeta(level.order).label;
      if (!groupsMap[track]) groupsMap[track] = [];
      groupsMap[track].push(level);
    });

    const progress = {};
    Object.entries(groupsMap).forEach(([name, tLevels]) => {
      const solved = tLevels.filter((l) => l.completed).length;
      progress[name] = {
        solved,
        total: tLevels.length,
        percent: tLevels.length ? Math.round((solved / tLevels.length) * 100) : 0,
      };
    });

    const completed = normal.filter((l) => l.completed).length;

    return {
      certificateLevel: cert,
      completedChallenges: completed,
      totalChallenges: normal.length,
      certificateProgressPercent: normal.length ? Math.round((completed / normal.length) * 100) : 0,
      grouped: groupsMap,
      trackProgress: progress,
    };
  }, [levels]);

  return (
    <div className="w-full relative flex flex-col items-center">
      <div className="w-full px-3 sm:px-5">
        <div className="space-y-0.5 pb-4">

          {/* Overall progress header */}
          <div className="px-4 pt-4 pb-2 sm:px-4">
            <div className="ds-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="ds-eyebrow text-neutral-500 mb-1">Overall Progress</p>
                <p className="text-lg font-bold text-white font-['Space_Grotesk']">
                  {completedChallenges}
                  <span className="text-neutral-500 font-normal text-base"> / {totalChallenges} challenges</span>
                </p>
              </div>
              <div className="sm:w-48 min-w-0">
                <div className="flex justify-between ds-eyebrow mb-1.5 text-neutral-600">
                  <span>Completion</span>
                  <span className="text-neutral-400">{certificateProgressPercent}%</span>
                </div>
                <div className="ds-progress">
                  <div
                    className="ds-progress-fill transition-width"
                    style={{ width: `${certificateProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TRACK SECTIONS */}
          {TRACK_ORDER.map((track, trackIdx) => {
            const trackLevels = grouped[track] || [];
            if (!trackLevels.length) return null;
            const prog = trackProgress[track] || {};
            const isComplete = prog.solved === prog.total && prog.total > 0;

            return (
              <section
                key={track}
                className="px-4 py-4 sm:px-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${trackIdx * 40}ms` }}
              >
                {/* Track header */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-neutral-200">{track}</h3>
                      {isComplete && (
                        <span className="ds-pill ds-pill-success">Done</span>
                      )}
                    </div>
                    <p className="text-[12px] text-neutral-600">
                      {TRACK_DESCRIPTION[track] || ""}
                    </p>
                  </div>

                  {/* Mini progress */}
                  <div className="shrink-0 text-right">
                    <p className="ds-eyebrow text-neutral-700 mb-1">
                      {prog.solved}/{prog.total}
                    </p>
                    <div className="w-20 ds-progress">
                      <div
                        className="ds-progress-fill bg-neutral-400 transition-width"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
            <section
              className="px-4 pt-2 pb-8 sm:px-4 animate-in fade-in duration-500"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="ds-eyebrow text-amber-500">Final Achievement</p>
                <span className="ds-pill ds-pill-warning">Certification</span>
              </div>

              <button
                onClick={() => handleLevelClick(certificateLevel)}
                className={`w-full rounded-xl border p-5 text-left transition-all duration-250 ${certificateLevel.unlocked
                  ? "border-amber-500/25 bg-[#161610] hover:bg-[#1c1c12] hover:border-amber-400/40"
                  : "border-[#1e1e1e] bg-[#111] cursor-not-allowed opacity-60"
                  }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      {certificateLevel.unlocked ? (
                        <Crown size={18} className="text-amber-400" />
                      ) : (
                        <Lock size={15} className="text-neutral-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-200">
                        Python Mastery Certificate
                      </h4>
                      <p className="mt-1 text-[12px] text-neutral-500">
                        {certificateLevel.unlocked
                          ? "View and share your verified achievement."
                          : "Complete all levels to unlock your certificate."}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={15}
                    className={`shrink-0 mt-1 ${certificateLevel.unlocked ? "text-amber-400" : "text-neutral-700"}`}
                  />
                </div>

                {/* Progress */}
                <div className="mt-5">
                  <div className="flex justify-between ds-eyebrow mb-2 text-neutral-700">
                    <span>{completedChallenges} / {totalChallenges} challenges</span>
                    <span className="text-neutral-500">{certificateProgressPercent}%</span>
                  </div>
                  <div className="ds-progress">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-width"
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
