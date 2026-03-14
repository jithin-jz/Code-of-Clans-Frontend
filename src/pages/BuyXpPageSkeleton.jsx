import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonText,
} from "../common/SkeletonPrimitives";

const BuyXpPageSkeleton = () => {
  return (
    <SkeletonPage className="bg-black flex flex-col pt-0 mt-0">
      {/* Main Content Grid Skeleton */}
      <main className="relative z-10 flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard
              key={i}
              className="rounded-xl overflow-hidden bg-[#141414]/70 border border-[#404040]/20 flex flex-col h-[280px]"
            >
              {/* Card Header Skeleton */}
              <div className="p-5 pb-3 space-y-4">
                <SkeletonBase className="w-10 h-10 rounded-lg bg-white/[0.06]" />
                <SkeletonBase className="h-4 w-20 bg-white/10 rounded-sm" />
                <div className="flex items-baseline gap-1 mt-2">
                  <SkeletonBase className="h-8 w-16 bg-white/20 rounded-sm" />
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="p-5 pt-2 mt-auto space-y-3">
                <SkeletonBase className="h-3 w-24 bg-white/5 rounded-sm" />
                <SkeletonBase className="w-full h-10 bg-white/5 border border-white/5 rounded-md" />
              </div>
            </SkeletonCard>
          ))}
        </div>
      </main>
    </SkeletonPage>
  );
};

export default BuyXpPageSkeleton;
