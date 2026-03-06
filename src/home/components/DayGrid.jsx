import React, { memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const DAILY_REWARDS = {
  1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35
};

const DayGrid = ({ checkInStatus, handleCheckIn, checkingIn }) => {
  return (
    <div className="grid grid-cols-7 gap-2.5">
      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
        const currentCycleDay = checkInStatus?.cycle_day || 1;
        const isCheckedInToday = checkInStatus?.checked_in_today;

        const isClaimedInHistory = checkInStatus?.recent_checkins?.some(
          (checkin) => checkin.streak_day === day
        );

        const isCompleted = isClaimedInHistory || (day === currentCycleDay && isCheckedInToday);
        const isClaimable = !isCheckedInToday && day === currentCycleDay;

        return (
          <button
            key={day}
            type="button"
            onClick={() => isClaimable && !checkingIn ? handleCheckIn(day) : null}
            disabled={!isClaimable || checkingIn}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 py-8 rounded-lg border transition-all duration-300 group",
              isCompleted
                ? "bg-emerald-500/10 border-emerald-500/20"
                : isClaimable
                  ? "bg-white/[0.05] border-white/20 cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.05)] ring-1 ring-white/10 active:scale-95"
                  : "bg-black border-white/5 opacity-40 cursor-not-allowed",
              checkingIn && "opacity-50"
            )}
          >
            {/* Glossy overlay for claimable */}
            {isClaimable && (
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            )}

            <div className="flex flex-col items-center gap-1.5 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500">
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.2em] font-mono",
                isCompleted ? "text-emerald-500" : isClaimable ? "text-neutral-300" : "text-neutral-500"
              )}>
                Unit {day}
              </span>

              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-xl font-black tabular-nums tracking-tighter font-mono",
                  isCompleted ? "text-emerald-400" : isClaimable ? "text-white" : "text-neutral-600"
                )}>
                  {DAILY_REWARDS[day]}
                </span>
                <span className={cn(
                  "text-[10px] font-bold",
                  isCompleted ? "text-emerald-800/60" : isClaimable ? "text-neutral-500" : "text-neutral-700"
                )}>
                  XP
                </span>
              </div>
            </div>

            {/* Status Beacons */}
            {isClaimable && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse" />
              </div>
            )}

            {isCompleted && (
              <div className="absolute top-2 right-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              </div>
            )}

            {/* Completion indicator line */}
            {isCompleted && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500/30" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default memo(DayGrid);
