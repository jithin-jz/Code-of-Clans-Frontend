import React from "react";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";

const HeaderBar = ({
  title,
  navigate,
  isPyodideReady,
  isRunning,
  runCode,
  stopCode,
}) => {
  return (
    <div className="h-12 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20 relative overflow-hidden">
      {/* Left: Navigation & Title */}
      <div className="flex items-center gap-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-white hover:bg-white/5 rounded-none h-8 w-8 transition-colors"
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xs font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 rounded-none bg-[#00af9b]"></span>
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
            className={`w-1.5 h-1.5 rounded-none ${
              isPyodideReady
                ? "bg-[#00af9b] shadow-[#00af9b]/50"
                : "bg-[#ffa116] animate-pulse"
            }`}
          />
        </div>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {isRunning ? (
          <Button
            onClick={stopCode}
            variant="destructive"
            className="h-8 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
            Stop
          </Button>
        ) : (
          <Button
            onClick={runCode}
            disabled={!isPyodideReady}
            className={`
                h-8 px-6 relative overflow-hidden group
                ${
                  isPyodideReady
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-gray-900 text-gray-700 cursor-not-allowed border border-white/5"
                }
                text-[10px] font-bold uppercase tracking-widest rounded-none 
                transition-all
              `}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play
                size={10}
                fill="currentColor"
                strokeWidth={3}
                className="group-hover:scale-110 transition-transform"
              />{" "}
              Run Code
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default React.memo(HeaderBar);
