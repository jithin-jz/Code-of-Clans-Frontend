import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Gem } from "lucide-react";

const formatReviewMarkdown = (raw = "") => {
  if (!raw) return "";

  const normalized = raw
    .replace(/\r\n/g, "\n")
    // Convert "1) Findings" / "1. Findings" into markdown headings.
    .replace(/^\s*\d+[).]?\s+([A-Za-z][^\n:]*)\s*$/gm, "### $1")
    // Convert "Findings:" style section labels into headings.
    .replace(/^([A-Za-z][A-Za-z\s]{2,40}):\s*$/gm, "### $1")
    // Keep spacing between sections readable.
    .replace(/\n(### )/g, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n");

  return normalized.trim();
};

const AIAssistantPane = ({
  onGetHint,
  onPurchase,
  onAnalyze,
  hint,
  review,
  isHintLoading,
  isReviewLoading,
  hintLevel,
  ai_hints_purchased,
  userXp,
}) => {
  const [hintHistory, setHintHistory] = React.useState([]);
  const scrollRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  React.useEffect(() => {
    if (hint) {
      setHintHistory((prev) => {
        if (prev.includes(hint)) return prev;
        return [...prev, hint];
      });
      // Auto-scroll to latest hint
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: scrollRef.current.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [hint]);

  // Reset history if challenge id changes
  React.useEffect(() => {
    if (hintLevel === 1) {
      setHintHistory([]);
      setActiveIndex(0);
    }
  }, [hintLevel]);

  // Cost Logic
  const nextCost = 10 * (ai_hints_purchased + 1);
  const isMaxReached = ai_hints_purchased >= 3;
  const isLocked = ai_hints_purchased < hintLevel && !isMaxReached;
  const formattedReview = React.useMemo(
    () => formatReviewMarkdown(review),
    [review],
  );

  return (
    <section className="flex-1 min-h-0 flex flex-col bg-[#0f1b2e] overflow-hidden m-0">
      <header className="border-b border-white/10 px-4 py-2 flex items-center justify-between bg-[#111d30]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#00af9b]" />
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
            Assistant
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {userXp !== undefined && (
            <div className="flex items-center gap-1">
              <Gem size={10} className="text-[#a78bfa]" />
              <span className="text-[#a78bfa] text-[10px] font-bold">
                {userXp}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 relative bg-[#0f1b2e] overflow-y-auto custom-scrollbar-thin">
        <div className="min-h-full flex flex-col">
          {review ? (
            <div className="mx-4 mt-4 mb-3 rounded-xl border border-[#7ea3d9]/25 bg-[#0a1220]/75 backdrop-blur-md p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex flex-col">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#7ea3d9] mb-2">
                AI Review
              </div>
              <div className="max-h-[50vh] min-h-[180px] overflow-y-auto custom-scrollbar-thin pr-2">
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-h3:text-[13px] prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4 first:prose-h3:mt-0 prose-p:text-slate-300 prose-p:text-[12px] prose-p:leading-relaxed prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-[12px] prose-strong:text-white prose-code:text-[#00af9b] prose-code:bg-[#111d30]/70 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown>{formattedReview}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : null}

          {/* Hint Carousel Wrapper */}
          <div className="flex-1 min-h-[340px] relative overflow-hidden flex flex-col">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 min-h-[300px] flex overflow-x-auto snap-x snap-mandatory custom-scrollbar-none select-none scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {hintHistory.length > 0 ? (
                hintHistory.map((h, i) => (
                  <div
                    key={i}
                    className="flex-none w-full h-full min-h-0 snap-start p-4 flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-none bg-[#00af9b]/10 flex items-center justify-center border border-[#00af9b]/20">
                        <span className="text-[9px] font-bold text-[#00af9b]">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Hint Phase {i + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-h-0 bg-white/[0.03] border border-white/10 rounded-xl p-4 overflow-y-auto custom-scrollbar-thin">
                      <div
                        className="prose prose-invert prose-sm max-w-none 
                              prose-p:text-gray-400 prose-p:leading-relaxed prose-p:text-[12px]
                              prose-strong:text-white prose-strong:font-semibold
                              prose-pre:bg-black prose-pre:border prose-pre:border-white/5 prose-pre:rounded-none prose-pre:p-0
                              prose-code:text-[#00af9b] prose-code:bg-[#0a1220]/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                          "
                      >
                        <ReactMarkdown
                          components={{
                            pre: ({ children }) => (
                              <pre className="relative p-3 overflow-x-auto custom-scrollbar-thin">
                                {children}
                              </pre>
                            ),
                            code: ({ inline, className, children, ...props }) => {
                              return !inline ? (
                                <code
                                  className={`${className} block text-[11px] leading-normal font-mono text-gray-400`}
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
                ))
              ) : !isHintLoading && !review ? (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-20 grayscale">
                  <Sparkles size={24} className="text-gray-500 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Awaiting Query
                  </p>
                </div>
              ) : null}

              {isHintLoading && (
                <div className="flex-none w-full h-full min-h-0 snap-start p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#00af9b] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#00af9b]/50 uppercase tracking-widest">
                      Generating...
                    </span>
                  </div>
                  <div className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl p-4 animate-pulse relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles
                        size={20}
                        className="text-[#00af9b]/20 animate-pulse"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Carousel Pagination Dots */}
            {(hintHistory.length > 1 ||
              (hintHistory.length > 0 && isHintLoading)) && (
                <div className="flex justify-center gap-1.5 pb-3">
                  {[...Array(hintHistory.length + (isHintLoading ? 1 : 0))].map(
                    (_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 transition-all duration-300 ${i === activeIndex
                            ? "bg-[#00af9b] scale-125 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            : "bg-white/10"
                          }`}
                      />
                    ),
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Action Bar - Fixed at absolute bottom of Card */}
      <div className="p-4 border-t border-white/10 bg-[#111d30] space-y-2 shrink-0">
        {isMaxReached ? (
          <div className="w-full bg-red-500/10 text-red-300 border border-red-500/25 text-[10px] font-bold h-10 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest">
            Max Hints Reached
          </div>
        ) : isLocked ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onPurchase}
              disabled={
                isHintLoading || (userXp !== undefined && userXp < nextCost)
              }
              className={`w-full text-[10px] font-bold h-10 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden uppercase tracking-widest ${userXp !== undefined && userXp < nextCost
                  ? "bg-red-500/10 border border-red-500/25 text-red-300 cursor-not-allowed"
                  : "bg-[#ffa116] text-black hover:bg-[#ff8f00] border border-[#ffb347]/40 shadow-lg shadow-[#ffa116]/20"
                }`}
            >
              {/* Shimmer effect overlay */}
              {userXp >= nextCost && (
                <div className="absolute inset-0 bg-black/5 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
              )}

              {isHintLoading ? (
                <span className="w-3 h-3 rounded-full bg-black/50 animate-pulse" />
              ) : (
                <Sparkles size={12} className="fill-current" />
              )}
              <span className="relative z-10">Get Hint</span>
              <span className="opacity-50 text-[9px] relative z-10 font-normal ml-1 flex items-center gap-0.5">
                (<Gem size={8} className="inline" />{nextCost})
              </span>
            </button>
            {userXp !== undefined && userXp < nextCost && (
              <p className="text-[9px] text-red-900 text-center font-bold uppercase tracking-tighter">
                Insufficient <Gem size={8} className="inline text-red-400" />
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onGetHint}
            disabled={isHintLoading}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[10px] font-bold h-10 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isHintLoading ? (
              <span className="w-3 h-3 rounded-full bg-white/70 animate-pulse" />
            ) : (
              <Sparkles size={12} />
            )}
            Unlock Intelligence
          </button>
        )}

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isReviewLoading}
          className="w-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/15 text-[10px] font-bold h-10 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-60"
        >
          {isReviewLoading ? (
            <span className="w-3 h-3 rounded-full bg-white/70 animate-pulse" />
          ) : (
            <Sparkles size={12} />
          )}
          {review ? "Re-analyze Code" : "Analyze Code"}
        </button>
      </div>
    </section>
  );
};

export default memo(AIAssistantPane);
