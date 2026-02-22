import React from "react";
import { Play, Sparkles, Star, Gem } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { getDifficultyMeta } from "../utils/challengeMeta";

import { useNavigate } from "react-router-dom";

const LevelModal = ({ selectedLevel, onClose }) => {
  const navigate = useNavigate();

  if (!selectedLevel) return null;

  const levelNumber = selectedLevel.order || selectedLevel.id;
  const levelTitle = selectedLevel.title || selectedLevel.name;
  const stars = Math.max(0, Math.min(3, selectedLevel.stars || 0));
  const xpReward = selectedLevel.xp_reward || 0;
  const difficulty = getDifficultyMeta(levelNumber);

  return (
    <Dialog open={!!selectedLevel} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[24rem] p-0 overflow-hidden rounded-2xl border border-white/18 bg-[#0f1827]/74 text-white backdrop-blur-2xl shadow-[0_26px_78px_rgba(0,0,0,0.58)]">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.24),transparent_46%),radial-gradient(circle_at_85%_100%,rgba(14,165,233,0.18),transparent_44%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(148,163,184,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.5)_1px,transparent_1px)] bg-[size:26px_26px]" />

          <div className="relative border-b border-white/12 px-5 pb-4 pt-5">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
              <Sparkles size={12} className="text-sky-300" />
              Level Brief
            </span>

            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-3xl font-black tracking-tight text-white">
                Level {levelNumber}
              </DialogTitle>
              <p className="text-xl font-bold leading-tight text-slate-100">
                {levelTitle}
              </p>
              <p className="text-sm text-slate-400">
                Clear test cases, earn stars, and unlock the next challenge.
              </p>
            </DialogHeader>
          </div>

          <div className="relative space-y-4 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative h-20 w-20 shrink-0 rounded-xl border border-white/16 bg-[#101a29]/80 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-[#3b82f6]/18 via-transparent to-[#0ea5e9]/18" />
                <div className="relative flex h-full w-full items-center justify-center text-white">
                  {selectedLevel.icon && React.isValidElement(selectedLevel.icon)
                    ? React.cloneElement(selectedLevel.icon, {
                      size: 38,
                      strokeWidth: 1.9,
                    })
                    : null}
                </div>
              </div>

              <div className="w-full rounded-xl border border-white/14 bg-[#101a29]/70 p-2.5 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Reward
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Gem size={14} className="text-[#a78bfa]" />
                  <p className="text-xl font-black text-white">
                    {xpReward.toLocaleString()}
                  </p>
                </div>
                <span className="mt-2 inline-flex rounded-full border border-sky-300/35 bg-sky-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-200">
                  {difficulty.label}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/14 bg-[#101a29]/70 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                  Star Progress
                </p>
                <p className="text-xs font-semibold text-slate-400">{stars}/3 earned</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={cn(
                      "transition-all duration-300",
                      star <= stars
                        ? "text-[#7dd3fc] fill-[#38bdf8]"
                        : "text-slate-600 fill-slate-800",
                    )}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={() => navigate(`/level/${selectedLevel.slug || selectedLevel.id}`)}
              className="h-12 w-full rounded-xl border border-white/20 bg-linear-to-r from-[#1e3a8a] to-[#1d4ed8] text-white text-base font-black tracking-wide shadow-[0_12px_28px_rgba(30,64,175,0.38)] hover:from-[#1e40af] hover:to-[#2563eb] transition-all"
            >
              <Play size={17} fill="currentColor" />
              <span>START LEVEL</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelModal;
