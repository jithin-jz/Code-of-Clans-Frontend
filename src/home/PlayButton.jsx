import React from "react";
import { Play, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const PlayButton = ({ levels, user, className }) => {
  const navigate = useNavigate();

  // Priority 1: First unlocked but not completed level (Current Grind)
  // Priority 2: Highest order unlocked level (Latest Reached)
  // Priority 3: First level (Fallback)

  // Assuming levels are sorted by order 1..N
  const activeLevel = levels?.find((l) => l.unlocked && !l.completed);
  const latestLevel = levels?.filter((l) => l.unlocked).pop();

  const currentLevel = activeLevel || latestLevel || levels?.[0];

  if (!currentLevel) return null;

  return (
    <motion.div
      className={className || "fixed right-6 bottom-6 z-30"}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
    >
      <button
        type="button"
        onClick={() => {
          if (!user) {
            navigate("/login");
            return;
          }
          navigate(`/level/${currentLevel.slug}`);
        }}
        className="group rounded-2xl border border-[#ef4444]/40 bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-3 flex items-center gap-3 transition-all shadow-lg shadow-[#ef4444]/20"
      >
        <div className="w-9 h-9 rounded-xl bg-black/20 border border-white/20 flex items-center justify-center">
          <Play size={18} fill="currentColor" className="ml-0.5" />
        </div>
        <div className="text-left leading-tight">
          <p className="text-[11px] uppercase tracking-wider text-white/80 font-semibold">
            Continue
          </p>
          <p className="text-sm font-bold">Run Next Challenge</p>
        </div>
        <ChevronRight
          size={16}
          className="text-white/80 group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    </motion.div>
  );
};

export default PlayButton;
