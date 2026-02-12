import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const NeuralLinkPane = ({
  onGetHint,
  onPurchase,
  hint,
  isHintLoading,
  hintLevel,
  ai_hints_purchased,
  userXp, // Add userXp prop
}) => {
  const [hintHistory, setHintHistory] = React.useState([]);

  React.useEffect(() => {
    if (hint) {
      setHintHistory((prev) => {
        if (prev.includes(hint)) return prev;
        return [...prev, hint];
      });
    }
  }, [hint]);

  // Reset history if challenge id changes (handled by parent resetting hintLevel to 1)
  React.useEffect(() => {
    if (hintLevel === 1) {
      setHintHistory([]);
    }
  }, [hintLevel]);

  // Cost Logic: 10, 20, 30 XP
  // Consistent with backend logic
  const nextCost = 10 * (ai_hints_purchased + 1);

  // Lock if max hints reached OR if need to purchase next hint
  const isMaxReached = ai_hints_purchased >= 3;
  const isLocked = ai_hints_purchased < hintLevel && !isMaxReached;

  // Star Penalty Logic (Balanced Option 3)
  // 0-1 Hint: Safe (3 Stars)
  // 2 Hints: 2 Stars
  // 3 Hints: 1 Star
  let penaltyText = "";
  let penaltyColor = "text-green-400";

  if (ai_hints_purchased === 0) {
    penaltyText = "Safe: 3-Star Rating Preserved";
  } else if (ai_hints_purchased === 1) {
    penaltyText = "Warning: Max Reward drops to 2 Stars";
    penaltyColor = "text-yellow-400";
  } else if (ai_hints_purchased === 2) {
    penaltyText = "Critical: Max Reward drops to 1 Star";
    penaltyColor = "text-red-400";
  } else {
    penaltyText = "Max Hints Used (1 Star Limit)";
    penaltyColor = "text-red-500";
  }

  return (
    <Card className="flex-1 flex flex-col bg-[#09090b] border-none rounded-none overflow-hidden m-0">
      <CardHeader className="border-b border-white/5 px-4 py-3 flex flex-row items-center justify-between space-y-0 bg-[#0c0c0e]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
            <Sparkles size={16} className="text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-white">
              🤖 AI Assistant
            </CardTitle>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Get help when you're stuck!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userXp !== undefined && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
              <span className="text-yellow-500 text-xs font-bold">
                💰 {userXp}
              </span>
              <span className="text-[9px] text-yellow-500/60 font-medium">
                XP
              </span>
            </div>
          )}
          <span className="text-[10px] text-gray-500 font-mono">
            Hints: {ai_hints_purchased}/3
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto relative custom-scrollbar p-0 bg-[#09090b] flex flex-col">
        {/* Hint History */}
        <div className="flex-1 p-4 space-y-4">
          {hintHistory.map((h, i) => (
            <div
              key={i}
              className="group animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <div className="flex items-start gap-3 mb-1">
                <div className="mt-1 w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <span className="text-[10px] font-bold text-blue-400">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 rounded-lg p-3 group-hover:bg-white/[0.07] transition-colors">
                  <div
                    className="prose prose-invert prose-sm max-w-none 
                            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-[13px]
                            prose-strong:text-white prose-strong:font-semibold
                            prose-pre:bg-[#050505] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-lg prose-pre:p-0
                            prose-code:text-blue-300 prose-code:bg-blue-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                        "
                  >
                    <ReactMarkdown
                      components={{
                        pre: ({ children }) => (
                          <pre className="relative p-3 overflow-x-auto custom-scrollbar-thin">
                            {children}
                          </pre>
                        ),
                        code: ({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline ? (
                            <code
                              className={`${className} block text-[12px] leading-normal font-mono text-gray-300`}
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {h}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isHintLoading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="mt-1 w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center animate-spin">
                <Loader2 size={10} className="text-blue-400" />
              </div>
              <div className="flex-1 bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 h-16" />
            </div>
          )}

          {!isHintLoading && hintHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
              <Sparkles size={32} className="text-blue-500 mb-4" />
              <p className="text-xs font-medium text-gray-400">
                Ready to help when you need it!
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Unlock a hint to get started
              </p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t border-white/5 bg-[#0c0c0e]">
          {isMaxReached ? (
            <div>
              <Button
                disabled
                className="w-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold h-11 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                All Hints Used (3/3)
              </Button>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                🎯 You've used all available hints for this challenge!
              </p>
            </div>
          ) : isLocked ? (
            <>
              <Button
                onClick={onPurchase}
                disabled={
                  isHintLoading || (userXp !== undefined && userXp < nextCost)
                }
                className={`w-full text-sm font-bold h-11 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  userXp !== undefined && userXp < nextCost
                    ? "bg-red-500/20 border-2 border-red-500/40 text-red-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-900/30"
                }`}
              >
                {isHintLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles size={16} className="fill-current" />
                )}
                Get Hint <span className="opacity-50">•</span> {nextCost} XP
              </Button>
              {userXp !== undefined && userXp < nextCost ? (
                <p className="text-[11px] text-red-400 text-center mt-2.5 font-medium">
                  ❌ Need {nextCost - userXp} more XP
                  <br />
                  <span className="text-gray-500">
                    🎯 Complete challenges to earn XP!
                  </span>
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  💡 Hints cost XP but keep you moving forward
                </p>
              )}
            </>
          ) : (
            <Button
              onClick={onGetHint}
              disabled={isHintLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold h-10 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isHintLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Receive Intelligence
            </Button>
          )}
          <p className="text-[10px] text-gray-600 text-center mt-3 uppercase tracking-tighter">
            AI Assistant Protocol v4.2 // Direct Logic Feed Only
          </p>
          {isLocked && !isMaxReached && (
            <p
              className={`text-[10px] text-center mt-2 font-medium ${penaltyColor}`}
            >
              {penaltyText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(NeuralLinkPane);
