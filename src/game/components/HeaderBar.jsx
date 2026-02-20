import React from "react";
import { ArrowLeft, Play } from "lucide-react";

const HeaderBar = ({
  title,
  navigate,
  isPyodideReady,
  isRunning,
  runCode,
  stopCode,
}) => {
  return (
    <div className="h-14 bg-[#0a1220]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-20 relative overflow-hidden">
      {/* Left: Navigation & Title */}
      <div className="flex items-center gap-4 relative z-10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="h-9 w-9 rounded-xl border border-white/15 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00af9b]"></span>
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-3 relative z-10">
        {/* Status Indicator */}
        <div className="flex items-center p-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-none ${isPyodideReady
                ? "bg-[#00af9b] shadow-[#00af9b]/50"
                : "bg-[#ffa116] animate-pulse"
              }`}
          />
        </div>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {isRunning ? (
          <button
            type="button"
            onClick={stopCode}
            className="h-10 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wide rounded-xl transition-all flex items-center"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2 animate-pulse" />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={runCode}
            disabled={!isPyodideReady}
            className={`
                h-10 px-5 relative overflow-hidden group rounded-xl
                ${isPyodideReady
                ? "bg-[#10b981] text-white hover:bg-[#059669] border border-[#34d399]/40 shadow-lg shadow-[#10b981]/25"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/10"
              }
                text-xs font-bold uppercase tracking-wide transition-all flex items-center
              `}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play
                size={10}
                fill="currentColor"
                strokeWidth={3}
                className="group-hover:scale-110 transition-transform"
              />{" "}
              Run
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(HeaderBar);
