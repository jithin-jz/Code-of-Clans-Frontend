import React from "react";
import { SkeletonBase, SkeletonPage } from "../common/SkeletonPrimitives";

const StoreSkeleton = () => {
  return (
    <SkeletonPage className="flex flex-col">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SkeletonBase className="w-10 h-10 rounded-lg" />
              <div className="flex items-center gap-3">
                <SkeletonBase className="w-10 h-10 rounded-xl" />
                <div className="space-y-1">
                  <SkeletonBase className="w-32 h-4" />
                  <SkeletonBase className="w-24 h-2" />
                </div>
              </div>
            </div>
            <SkeletonBase className="w-32 h-10 rounded-full" />
          </div>
          {/* Categories */}
          <div className="flex items-center gap-2 pb-4 overflow-x-auto no-scrollbar">
            <SkeletonBase className="w-24 h-8 rounded-full" />
            <SkeletonBase className="w-24 h-8 rounded-full" />
            <SkeletonBase className="w-24 h-8 rounded-full" />
            <SkeletonBase className="w-24 h-8 rounded-full" />
            <SkeletonBase className="w-24 h-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 overflow-hidden"
            >
              <SkeletonBase className="h-44 rounded-none" />
              <div className="p-5 space-y-3">
                <SkeletonBase className="h-5 w-3/4" />
                <SkeletonBase className="h-3 w-1/2" />
                <SkeletonBase className="h-10 w-full mt-4 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
};

export default StoreSkeleton;
