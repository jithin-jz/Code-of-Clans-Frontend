import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonText,
  SkeletonButton
} from "../common/SkeletonPrimitives";

const MarketplacePageSkeleton = () => {
  return (
    <SkeletonPage className="flex flex-col bg-black">
      {/* Category Tabs Skeleton */}
      <div className="sticky top-0 z-30 border-b border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 py-4 overflow-x-auto no-scrollbar">
            <SkeletonBase className="h-10 w-10 rounded-xl shrink-0 border border-white/10" />
            <div className="flex items-center gap-2 flex-1">
              {[...Array(6)].map((_, i) => (
                <SkeletonBase key={i} className="h-9 w-24 rounded-full border border-white/5 bg-white/[0.02] shrink-0" />
              ))}
            </div>
            <SkeletonBase className="h-10 w-32 rounded-xl shrink-0" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Section Heading */}
        <div className="space-y-4">
          <SkeletonText width="240px" height="2rem" />
          <SkeletonText width="400px" height="1rem" className="opacity-40" />
        </div>

        {/* Marketplace Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <SkeletonCard
              key={i}
              className="group p-0 border border-white/5 bg-black hover:border-white/10 transition-colors"
            >
              {/* Item Preview Skeleton */}
              <div className="aspect-video relative overflow-hidden bg-white/[0.02]">
                <SkeletonBase className="h-full w-full rounded-none" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <SkeletonBase className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Item Info */}
              <div className="p-5 space-y-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <SkeletonText width="80%" height="1.1rem" />
                    <SkeletonText width="50%" height="0.6rem" className="opacity-40" />
                  </div>
                  <SkeletonBase className="h-8 w-8 rounded-lg border border-white/5" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <SkeletonBase className="h-5 w-5 rounded-md" />
                    <SkeletonText width="60px" height="1rem" />
                  </div>
                  <SkeletonBase className="h-10 w-24 rounded-xl" />
                </div>
              </div>
            </SkeletonCard>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
};

export default MarketplacePageSkeleton;
