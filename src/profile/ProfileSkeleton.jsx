import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonText,
  SkeletonStats
} from "../common/SkeletonPrimitives";

const ProfileSkeleton = () => {
  return (
    <SkeletonPage className="bg-black">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Banner + Profile Header */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-black border border-white/10">
          <SkeletonBase className="h-48 sm:h-64 w-full rounded-none" />
          <div className="relative px-8 pb-8 pt-0 -mt-20 flex flex-col items-center sm:items-start text-center sm:text-left gap-6">
            <div className="flex flex-col sm:flex-row items-end gap-6 w-full">
              <SkeletonAvatar size="xl" className="h-32 w-32 sm:h-40 sm:w-40 rounded-[2.5rem] border-4 border-[#000000] shadow-2xl" />
              <div className="flex-1 pb-4 space-y-3">
                <SkeletonText width="280px" height="2rem" className="mx-auto sm:mx-0" />
                <SkeletonText width="160px" height="1rem" className="mx-auto sm:mx-0 opacity-50" />
              </div>
              <div className="pb-4 flex gap-3">
                <SkeletonBase className="h-11 w-32 rounded-xl" />
                <SkeletonBase className="h-11 w-11 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonStats key={i} className="bg-black" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Side: Info & About */}
          <div className="lg:col-span-1 space-y-6">
            <SkeletonCard title="About" className="space-y-4 bg-black">
              <SkeletonText width="100%" />
              <SkeletonText width="90%" />
              <SkeletonText width="40%" />
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div className="space-y-2">
                  <SkeletonText width="40px" height="0.6rem" />
                  <SkeletonText width="90px" height="0.9rem" />
                </div>
                <div className="space-y-2">
                  <SkeletonText width="40px" height="0.6rem" />
                  <SkeletonText width="90px" height="0.9rem" />
                </div>
              </div>
            </SkeletonCard>

            <SkeletonCard title="Skills" className="bg-black p-6">
              <SkeletonText width="80px" className="mb-4" />
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <SkeletonBase key={i} className="h-8 w-20 rounded-lg" />
                ))}
              </div>
            </SkeletonCard>
          </div>

          {/* Right Side: Feed/Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-4 border-b border-white/5 pb-2">
              <SkeletonBase className="h-10 w-24 rounded-lg" />
              <SkeletonBase className="h-10 w-24 rounded-lg opacity-40" />
              <SkeletonBase className="h-10 w-24 rounded-lg opacity-40" />
            </div>

            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} className="p-6 bg-black border-white/5">
                <div className="flex gap-4 mb-6">
                  <SkeletonAvatar size="md" className="rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <SkeletonText width="200px" height="1rem" />
                    <SkeletonText width="120px" height="0.75rem" className="opacity-40" />
                  </div>
                </div>
                <SkeletonText width="100%" height="0.9rem" className="mb-2" />
                <SkeletonText width="60%" height="0.9rem" className="mb-6" />
                <SkeletonBase className="h-[240px] w-full rounded-2xl border border-white/5" />
              </SkeletonCard>
            ))}
          </div>

        </div>
      </div>
    </SkeletonPage>
  );
};

export default ProfileSkeleton;
