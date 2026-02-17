import React, { useMemo } from "react";
import { Trophy } from "lucide-react";
import { generateLevels } from "../../constants/levelData";

const Milestones = ({ profileUser, loading }) => {
  const completedLevels = useMemo(() => {
    if (loading || !profileUser) return [];
    const levels = generateLevels();
    const currentXp = profileUser.profile?.xp || 0;
    const currentLevelId = Math.floor(currentXp / 1000) + 1;
    return levels.filter((l) => l.id <= currentLevelId);
  }, [profileUser, loading]);

  if (loading) {
      return (
        <div>
           <div className="h-4 w-32 bg-white/5 rounded-md mb-3 animate-pulse"></div>
           <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-[#121212] border border-white/5 rounded-xl p-2 h-16 animate-pulse"></div>
              ))}
           </div>
        </div>
      );
  }

  if (completedLevels.length === 0) {
    return (
      <div className="col-span-full py-8 text-center text-gray-500 border border-white/5 rounded-2xl border-dashed">
        <Trophy size={32} className="mx-auto mb-2 opacity-20" />
        <p className="font-medium text-xs">No tasks completed yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
        Completed Milestones
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {completedLevels.map((level) => (
          <div
            key={level.id}
            className="bg-[#121212] border border-white/5 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center transition-all hover:border-[#ffa116]/30 hover:-translate-y-1 group"
          >
            <div className="w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform text-white/50 group-hover:text-[#ffa116]">
              {level.icon && React.cloneElement(level.icon, { size: 14 })}
            </div>
            <div className="text-[9px] font-bold text-[#ffa116] uppercase tracking-wider">
              LEVEL {level.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Milestones);
