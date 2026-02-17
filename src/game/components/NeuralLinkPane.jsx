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

  return (
    <Card className="flex-1 flex flex-col bg-[#18181b] border-none rounded-none overflow-hidden m-0">
      <CardHeader className="border-b border-white/5 px-4 py-2 flex flex-row items-center justify-between space-y-0 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#00af9b]" />
          <CardTitle className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
            Assistant
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {userXp !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-[#ffa116] text-[10px] font-bold">
                {userXp}
              </span>
              <span className="text-[8px] text-[#cc8400] font-bold">XP</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 relative flex flex-col bg-[#18181b] overflow-hidden p-0">
        {/* Hint Carousel Wrapper */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 flex overflow-x-auto snap-x snap-mandatory custom-scrollbar-none select-none scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {hintHistory.length > 0 ? (
              hintHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex-none w-full h-full snap-start p-4 flex flex-col"
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

                  <div className="flex-1 bg-white/3 border border-white/5 rounded-none p-4 overflow-y-auto custom-scrollbar-thin">
                    <div
                      className="prose prose-invert prose-sm max-w-none 
                              prose-p:text-gray-400 prose-p:leading-relaxed prose-p:text-[12px]
                              prose-strong:text-white prose-strong:font-semibold
                              prose-pre:bg-black prose-pre:border prose-pre:border-white/5 prose-pre:rounded-none prose-pre:p-0
                              prose-code:text-[#00af9b] prose-code:bg-[#1f1f1f]/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-none prose-code:font-mono prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
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
            ) : !isHintLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-20 grayscale">
                <Sparkles size={24} className="text-gray-500 mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Awaiting Query
                </p>
              </div>
            ) : null}

            {isHintLoading && (
              <div className="flex-none w-full h-full snap-start p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 size={10} className="text-[#00af9b] animate-spin" />
                  <span className="text-[10px] font-bold text-[#00af9b]/50 uppercase tracking-widest">
                    Generating...
                  </span>
                </div>
                <div className="flex-1 bg-white/5 border border-white/5 rounded-none p-4 animate-pulse relative">
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
                    className={`w-1 h-1 transition-all duration-300 ${
                      i === activeIndex
                        ? "bg-[#00af9b] scale-125 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        : "bg-white/10"
                    }`}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Bar - Fixed at absolute bottom of Card */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a] space-y-2 shrink-0">
        {isMaxReached ? (
          <Button
            disabled
            className="w-full bg-red-500/5 text-red-900 border border-red-500/10 text-[10px] font-bold h-10 rounded-none cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            Max Hints Reached
          </Button>
        ) : isLocked ? (
          <div className="space-y-2">
            <Button
              onClick={onPurchase}
              disabled={
                isHintLoading || (userXp !== undefined && userXp < nextCost)
              }
              className={`w-full text-[10px] font-bold h-10 rounded-none transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden uppercase tracking-widest ${
                userXp !== undefined && userXp < nextCost
                  ? "bg-red-500/5 border border-red-500/10 text-red-800 cursor-not-allowed"
                  : "bg-white text-black hover:bg-gray-200 border border-white/10"
              }`}
            >
              {/* Shimmer effect overlay */}
              {userXp >= nextCost && (
                <div className="absolute inset-0 bg-black/5 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
              )}

              {isHintLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles size={12} className="fill-current" />
              )}
              <span className="relative z-10">Get Hint</span>
              <span className="opacity-50 text-[9px] relative z-10 font-normal ml-1">
                ({nextCost} XP)
              </span>
            </Button>
            {userXp !== undefined && userXp < nextCost && (
              <p className="text-[9px] text-red-900 text-center font-bold uppercase tracking-tighter">
                Insufficient XP
              </p>
            )}
          </div>
        ) : (
          <Button
            onClick={onGetHint}
            disabled={isHintLoading}
            className="w-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white border border-white/5 text-[10px] font-bold h-10 rounded-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isHintLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            Unlock Intelligence
          </Button>
        )}
      </div>
    </Card>
  );
};

export default memo(NeuralLinkPane);
