import React from "react";
import { SkeletonBase, SkeletonPage } from "../common/SkeletonPrimitives";

const HomeSkeleton = () => {
  return (
    <SkeletonPage className="flex items-center justify-center">
      {/* Top Left Profile Skeleton */}
      <div className="fixed left-6 top-6 z-50 flex items-center gap-4">
        <SkeletonBase className="w-12 h-12 rounded-xl" />
        <div className="flex flex-col gap-2">
          <SkeletonBase className="w-32 h-4" />
          <SkeletonBase className="w-24 h-3" />
        </div>
      </div>

      {/* Right Side UI Skeleton */}
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-4 items-end">
        {/* XP Bar Skeleton */}
        <SkeletonBase className="w-48 h-12 rounded-full" />

        {/* Action Buttons Skeletons */}
        <SkeletonBase className="w-14 h-14 rounded-2xl" />
        <SkeletonBase className="w-14 h-14 rounded-2xl" />
        <SkeletonBase className="w-14 h-14 rounded-2xl" />
      </div>

      {/* Shop Button Skeleton (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-50">
        <SkeletonBase className="w-14 h-14 rounded-2xl" />
      </div>

      {/* Play Button Skeleton (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <SkeletonBase className="w-48 h-16 rounded-full" />
      </div>

      {/* Level Map Grid Skeleton */}
      <div className="w-full max-w-7xl pl-4 pr-28 pointer-events-none">
        <div className="grid grid-cols-9 gap-4 gap-y-6 justify-items-center">
          {[...Array(54)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <SkeletonBase className="w-10 h-10 rounded-xl" />
              <SkeletonBase className="w-6 h-2" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
};

export default HomeSkeleton;
