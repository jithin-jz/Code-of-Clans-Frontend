import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { getDifficultyMeta } from "../../utils/challengeMeta";

const ProblemPane = ({ challenge, loading }) => {
  const derived = useMemo(() => {
    if (!challenge) return null;

    const difficulty = getDifficultyMeta(challenge.order);

    return {
      difficulty,
      targetMinutes: Math.max(1, Math.ceil((challenge.time_limit || 300) / 60)),
    };
  }, [challenge]);

  if (loading || !challenge || !derived) {
    return (
      <div className="flex-1 bg-[#0f1b2e] flex flex-col animate-pulse">
        <div className="p-5 border-b border-white/10 bg-[#111d30] space-y-2">
          <div className="h-4 w-40 bg-white/10 rounded-md" />
          <div className="h-3 w-56 bg-white/5 rounded-md" />
        </div>
        <div className="p-6 space-y-4">
          <div className="h-4 w-36 bg-white/10 rounded-md" />
          <div className="h-3 w-full bg-white/5 rounded-md" />
          <div className="h-3 w-5/6 bg-white/5 rounded-md" />
          <div className="h-3 w-4/6 bg-white/5 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <section className="flex-1 min-h-0 flex flex-col bg-[#0f1b2e]">
      <div className="p-4 border-b border-white/10 bg-[#111d30]">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">
          {challenge.title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-md bg-[#00af9b]/10 text-[#84f0e4] border border-[#00af9b]/30">
            Python
          </span>
          <span className={`text-xs px-2 py-1 rounded-md ${derived.difficulty.pill}`}>
            {derived.difficulty.label}
          </span>
          <span className="text-xs px-2 py-1 rounded-md bg-white/[0.05] border border-white/15 text-slate-300">
            {challenge.xp_reward}
          </span>
          <span className="text-xs px-2 py-1 rounded-md bg-white/[0.05] border border-white/15 text-slate-300">
            Target: {derived.targetMinutes} min
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 pb-8 space-y-4">
        <div className="rounded-xl border border-white/10 bg-[#111d30] p-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
            Problem
          </h3>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-300 prose-code:text-[#66d1c3] prose-code:bg-black/25 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ProblemPane);
