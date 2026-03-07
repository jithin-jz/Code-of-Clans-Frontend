import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
} from "../common/SkeletonPrimitives";

const ProfileSkeleton = () => {
  return (
    <SkeletonPage className="bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Card Skeleton */}
          <div className="lg:col-span-1 space-y-4 min-w-0">
            {/* Main Profile Card */}
            <SkeletonCard className="p-0 bg-[#141414]/70 border border-[#404040]/20 overflow-hidden">
              <div className="h-32 bg-[#1a1a1a]/40 relative">
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <SkeletonAvatar size="xl" className="h-24 w-24 border-4 border-black shadow-2xl" />
                </div>
              </div>
              <div className="pt-20 sm:pt-20 pb-6 px-6 text-center">
                <div className="h-2 sm:h-4" /> {/* Match Profile.jsx spacer */}
                <div className="mt-2 sm:mt-4 space-y-3">
                  <SkeletonText width="140px" height="1.5rem" className="mx-auto" />
                  <SkeletonText width="100px" height="0.85rem" className="mx-auto opacity-20 italic" />
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-center gap-8 border-t border-white/5 pt-6 mt-6">
                  <div className="space-y-1.5 flex flex-col items-center">
                    <SkeletonText width="25px" height="1.25rem" />
                    <SkeletonText width="65px" height="0.65rem" className="opacity-30" />
                  </div>
                  <div className="space-y-1.5 flex flex-col items-center">
                    <SkeletonText width="25px" height="1.25rem" />
                    <SkeletonText width="65px" height="0.65rem" className="opacity-30" />
                  </div>
                </div>
              </div>
            </SkeletonCard>

            {/* Referral Card Skeleton */}
            <SkeletonCard className="bg-[#141414]/70 border border-[#404040]/20 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <SkeletonBase className="w-4 h-4 rounded bg-white/10" />
                <SkeletonText width="60px" height="0.75rem" className="opacity-40" />
              </div>
              <div className="p-4 space-y-4">
                <SkeletonBase className="h-11 w-full rounded-xl bg-white/[0.03]" />
                <div className="space-y-2">
                  <SkeletonText width="80px" height="0.65rem" className="opacity-30" />
                  <div className="flex gap-2">
                    <SkeletonBase className="flex-1 h-10 rounded-lg bg-white/[0.03]" />
                    <SkeletonBase className="w-12 h-10 rounded-lg bg-white/[0.05]" />
                  </div>
                </div>
              </div>
            </SkeletonCard>
          </div>

          {/* Center Column - Content Skeleton */}
          <div className="lg:col-span-2 space-y-4 min-w-0">
            {/* Tabs / Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1 bg-[#141414]/80 p-1 rounded-xl border border-white/10">
                <SkeletonBase className="h-9 w-24 rounded-lg bg-white/10" />
              </div>
              <SkeletonBase className="h-10 w-32 rounded-xl bg-white/10" />
            </div>

            {/* Contribution Graph Heatmap Skeleton */}
            <SkeletonCard className="bg-[#141414]/70 border-white/5 p-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <SkeletonBase className="w-4 h-4 rounded bg-[#00af9b]/20" />
                  <SkeletonText width="100px" height="0.85rem" />
                </div>
                <SkeletonText width="80px" height="0.6rem" className="opacity-20 uppercase tracking-widest" />
              </div>

              {/* Heatmap simulation */}
              <div className="flex gap-1 overflow-hidden h-[80px]">
                {[...Array(24)].map((_, w) => (
                  <div key={w} className="flex flex-col gap-1 shrink-0">
                    {[...Array(7)].map((_, d) => (
                      <SkeletonBase
                        key={d}
                        className={`w-[11px] h-[11px] rounded-[1px] ${Math.random() > 0.8 ? 'bg-[#00af9b]/30' : 'bg-white/[0.02]'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 mt-2 border-t border-white/5">
                <SkeletonText width="160px" height="0.65rem" className="opacity-20" />
                <div className="flex gap-1.5 items-center">
                  <SkeletonText width="30px" height="0.6rem" className="opacity-20 mr-1" />
                  {[...Array(5)].map((_, i) => (
                    <SkeletonBase key={i} className={`w-2 h-2 rounded-[1px] bg-white/${(i + 1) * 5}`} />
                  ))}
                </div>
              </div>
            </SkeletonCard>

            {/* Posts Feed Skeleton */}
            {[...Array(2)].map((_, i) => (
              <SkeletonCard key={i} className="p-5 bg-[#141414]/70 border-white/5 space-y-4">
                <div className="flex gap-3">
                  <SkeletonAvatar size="md" className="rounded-xl" />
                  <div className="space-y-2 flex-1 pt-1">
                    <SkeletonText width="120px" height="0.9rem" />
                    <SkeletonText width="90px" height="0.65rem" className="opacity-20" />
                  </div>
                </div>
                <div className="space-y-2 outline-none">
                  <SkeletonText width="95%" height="0.75rem" />
                  <SkeletonText width="60%" height="0.75rem" />
                </div>
                <SkeletonBase className="h-[280px] w-full rounded-2xl bg-white/[0.02] border border-white/5" />
              </SkeletonCard>
            ))}
          </div>

          {/* Right Column - Suggested Users Skeleton */}
          <div className="lg:col-span-1 min-w-0">
            <div className="sticky top-[88px]">
              <SkeletonCard className="bg-[#141414]/70 border-[#404040]/20 p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <SkeletonText width="120px" height="0.85rem" className="opacity-60" />
                </div>
                <div className="p-4 space-y-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <SkeletonAvatar size="sm" className="rounded-full shadow-lg" />
                        <div className="space-y-1.5 flex-1">
                          <SkeletonText width="80%" height="0.8rem" />
                          <SkeletonText width="50%" height="0.6rem" className="opacity-20" />
                        </div>
                      </div>
                      <SkeletonBase className="w-14 h-7 rounded-lg bg-blue-500/10" />
                    </div>
                  ))}
                </div>
              </SkeletonCard>
            </div>
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
};

export default ProfileSkeleton;
