import React from "react";
import { SkeletonBase, SkeletonPage, SkeletonCode } from "../common/SkeletonPrimitives";

const ChallengeWorkspaceSkeleton = () => {
  return (
    <SkeletonPage className="flex flex-col h-dvh bg-black">
      {/* Global pure-black foundation */}
      <div className="absolute inset-0 pointer-events-none bg-black" />

      {/* Subtle industrial depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative z-10 h-14 bg-black border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SkeletonBase className="w-9 h-9 rounded-md" />
          <SkeletonBase className="w-48 h-4 rounded-md opacity-40" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBase className="w-4 h-4 rounded-sm" />
          <SkeletonBase className="w-24 h-10 rounded-xl" />
        </div>
      </div>

      <div className="relative z-10 flex-1 p-0 sm:p-3 gap-0 sm:gap-3 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[24rem] sm:rounded-xl sm:border border-white/5 bg-black p-4 space-y-4 shadow-2xl">
          <SkeletonBase className="h-4 w-44 opacity-20" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
          {[...Array(4)].map((_, i) => (
            <SkeletonBase key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>

        <div className="flex-1 min-w-0 sm:rounded-xl sm:border border-white/5 bg-black overflow-hidden flex flex-col shadow-2xl">
          <div className="flex-1 p-2">
            <SkeletonCode lines={18} className="h-full border-none" />
          </div>
          <div className="h-[35%] sm:h-[32%] min-h-[180px] border-t border-white/5 p-4 space-y-3">
            <SkeletonBase className="h-3 w-24 opacity-20" />
            <SkeletonBase className="h-10 w-full rounded-lg opacity-10" />
            <SkeletonBase className="h-10 w-5/6 rounded-lg opacity-10" />
          </div>
        </div>

        <div className="w-full lg:w-[22rem] sm:rounded-xl sm:border border-white/5 bg-black p-4 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <SkeletonBase className="h-3 w-24 opacity-20" />
            <SkeletonBase className="h-3 w-14 opacity-20" />
          </div>
          <div className="flex-1">
            <SkeletonBase className="h-full w-full rounded-lg" />
          </div>
          <SkeletonBase className="h-10 w-full rounded-lg mt-4 opacity-10" />
        </div>
      </div>
    </SkeletonPage>
  );
};

export default ChallengeWorkspaceSkeleton;
