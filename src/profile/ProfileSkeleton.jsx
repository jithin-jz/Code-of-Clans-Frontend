import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCircle,
} from "../common/SkeletonPrimitives";

const ProfileSkeleton = () => {
  return (
    <SkeletonPage className="p-4 md:p-6 flex justify-center gap-6">
      {/* Left Panel Skeleton */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6 h-full">
        <SkeletonBase className="w-full h-[500px] rounded-3xl" />
      </div>

      {/* Right Panel Skeleton */}
      <div className="w-full max-w-3xl bg-[#121212]/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Tabs Header Skeleton */}
        <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-black/20">
          <SkeletonBase className="w-32 h-10 rounded-xl m-1" />
          <SkeletonBase className="w-32 h-10 rounded-xl m-1" />
        </div>

        {/* Tab Content Skeleton */}
        <div className="flex-1 p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBase className="h-32 rounded-2xl" />
            <SkeletonBase className="h-32 rounded-2xl" />
            <SkeletonBase className="h-32 rounded-2xl" />
            <SkeletonBase className="h-32 rounded-2xl" />
          </div>
          {/* Coding Stats */}
          <SkeletonBase className="h-48 rounded-2xl" />
          {/* Milestones */}
          <SkeletonBase className="h-64 rounded-2xl" />
        </div>
      </div>
    </SkeletonPage>
  );
};

export default ProfileSkeleton;
