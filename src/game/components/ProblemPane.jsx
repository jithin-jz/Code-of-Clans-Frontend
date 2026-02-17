import React, { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { getDifficultyMeta } from "../../utils/challengeMeta";

const getFunctionSignature = (initialCode = "") => {
  const lines = initialCode.split("\n").map((line) => line.trim());
  const signature = lines.find(
    (line) => line.startsWith("def ") || line.startsWith("class "),
  );
  return signature || "def solve(...):";
};

const getParamList = (signature = "") => {
  if (!signature.startsWith("def ")) return [];
  const open = signature.indexOf("(");
  const close = signature.indexOf(")");
  if (open === -1 || close === -1 || close <= open) return [];
  const params = signature
    .slice(open + 1, close)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return params;
};

const ProblemPane = ({ challenge, loading }) => {
  const derived = useMemo(() => {
    if (!challenge) return null;

    const difficulty = getDifficultyMeta(challenge.order);
    const signature = getFunctionSignature(challenge.initial_code);
    const params = getParamList(signature);

    return {
      difficulty,
      signature,
      params,
      targetMinutes: Math.max(1, Math.ceil((challenge.time_limit || 300) / 60)),
    };
  }, [challenge]);

  if (loading || !challenge || !derived) {
    return (
      <div className="flex-1 bg-[#1a1a1a] flex flex-col animate-pulse">
        <div className="p-5 border-b border-white/10 bg-[#262626] space-y-2">
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
    <section className="flex-1 flex flex-col bg-[#262626] overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-[#242424]">
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
          <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300">
            {challenge.xp_reward} XP
          </span>
          <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300">
            Target: {derived.targetMinutes} min
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
            Problem Statement
          </h3>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-300 prose-code:text-[#66d1c3] prose-code:bg-black/25 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
            Function Description
          </h3>
          <pre className="text-xs text-[#66d1c3] bg-black/30 border border-white/10 rounded-lg p-3 overflow-x-auto">
            {derived.signature}
          </pre>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
            Input Format
          </h3>
          {derived.params.length ? (
            <ul className="space-y-1 text-sm text-zinc-300">
              {derived.params.map((param) => (
                <li key={param}>
                  - Parameter <code className="text-[#66d1c3]">{param}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-300">
              Implement the required function/class according to the starter code.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
            Output Format
          </h3>
          <p className="text-sm text-zinc-300">
            Return the expected value from your function. Hidden tests validate
            correctness.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1f1f1f] p-4">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
            Constraints
          </h3>
          <ul className="space-y-1 text-sm text-zinc-300">
            <li>- Use Python only.</li>
            <li>- Do not modify hidden test code.</li>
            <li>- Aim to solve within {derived.targetMinutes} minutes for best stars.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default memo(ProblemPane);

