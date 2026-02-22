import React, { memo } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';

const DAILY_REWARDS = {
  1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35
};

const DayGrid = ({
  checkInStatus,
  handleCheckIn,
  checkingIn
}) => {

  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {[1, 2, 3, 4, 5, 6, 7].map((day) => {
        const currentCycleDay = checkInStatus?.cycle_day || 1;
        const isCheckedInToday = checkInStatus?.checked_in_today;

        const isClaimedInHistory = checkInStatus?.recent_checkins?.some(
          (checkin) => checkin.streak_day === day
        );

        const isCompleted = isClaimedInHistory || (day === currentCycleDay && isCheckedInToday);
        const isClaimable = !isCheckedInToday && day === currentCycleDay;
        const isMissed = day < currentCycleDay && !isCompleted;

        return (
          <Card
            key={day}
            onClick={() => isClaimable ? handleCheckIn(day) : null}
            className={cn(
              "relative transition-all border-2 backdrop-blur-md",
              isCompleted && "bg-linear-to-br from-green-500/20 to-[#00af9b]/20 border-green-400/35 cursor-default shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
              isClaimable && "bg-linear-to-br from-primary/25 to-orange-500/20 border-primary/55 cursor-pointer hover:scale-105 animate-pulse shadow-[0_8px_24px_rgba(0,0,0,0.22)]",
              isMissed && "bg-red-500/12 border-red-500/25 opacity-75 cursor-not-allowed",
              !isCompleted && !isClaimable && !isMissed && "bg-[#162338]/70 border-white/12 opacity-60 cursor-not-allowed",
              checkingIn && "opacity-50 cursor-not-allowed"
            )}
          >
            <CardContent className="p-2 sm:p-3 text-center">
              <p className={cn("text-xs mb-1", isCompleted || isClaimable ? "text-white" : "text-gray-500")}>Day {day}</p>
              <Badge
                variant={isCompleted ? "default" : isClaimable ? "default" : "outline"}
                className={cn(
                  "text-xs font-bold",
                  isCompleted && "bg-green-500 hover:bg-green-500 text-white border-none",
                  isClaimable && "bg-primary hover:bg-primary text-black border-none",
                  isMissed && "bg-transparent text-red-500 border-red-500/30",
                  !isCompleted && !isClaimable && !isMissed && "text-slate-400 border-white/15 bg-white/[0.03]"
                )}

              >
                {DAILY_REWARDS[day]}
              </Badge>

              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="text-white h-3 w-3" />
                </div>
              )}
              {isClaimable && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                  <Award className="text-primary-foreground h-3 w-3" />
                </div>
              )}

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(DayGrid);
