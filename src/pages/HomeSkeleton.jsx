import React from "react";
import { SkeletonBase, SkeletonPage } from "../common/SkeletonPrimitives";

const HomeSkeleton = () => {
  return (
    <SkeletonPage className="flex items-center justify-center bg-[#0a0a0a]">
      {/* Top Left Profile Skeleton */}
      <div className="fixed left-6 top-6 z-50">
        <div className="bg-[#121212]/50 border border-white/5 rounded-2xl p-3 flex items-center gap-4">
          <SkeletonBase className="w-12 h-12 rounded-xl" />
          <div className="flex flex-col gap-2">
            <SkeletonBase className="w-24 h-4" />
            <SkeletonBase className="w-16 h-3 opacity-50" />
          </div>
        </div>
      </div>

      {/* Right Side UI Skeleton */}
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-4 items-end">
        {/* XP Bar Skeleton */}
        <div className="bg-[#121212]/50 border border-white/5 rounded-full pl-4 pr-6 py-2.5 flex items-center gap-4">
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between w-32">
              <SkeletonBase className="w-12 h-2" />
              <SkeletonBase className="w-4 h-2" />
            </div>
            <SkeletonBase className="w-32 h-2 rounded-full" />
          </div>
        </div>

        {/* Action Buttons Skeletons */}
        <div className="flex flex-col gap-4">
          <SkeletonBase className="w-14 h-14 rounded-2xl" />
          <SkeletonBase className="w-14 h-14 rounded-2xl" />
          <SkeletonBase className="w-14 h-14 rounded-2xl" />
          <SkeletonBase className="w-14 h-14 rounded-2xl" />
        </div>
      </div>

      {/* Shop Button Skeleton (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="p-2">
          <SkeletonBase className="w-16 h-16 rounded-full" />
        </div>
      </div>

      {/* Play Button Skeleton (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="p-2">
          <SkeletonBase className="w-20 h-20 rounded-full" />
        </div>
      </div>

      {/* Level Map Grid Skeleton */}
      <div className="w-full max-w-[95%] px-10 pointer-events-none mt-8">
        <div className="grid grid-cols-9 gap-3 gap-y-4 justify-items-center">
          {[...Array(54)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonBase className="w-10 h-10 rounded-xl" />
              <SkeletonBase className="w-6 h-2 opacity-30" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
};

export default HomeSkeleton;
