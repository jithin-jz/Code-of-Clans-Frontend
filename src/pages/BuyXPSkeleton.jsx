import React from "react";
import { SkeletonBase, SkeletonPage } from "../common/SkeletonPrimitives";

const BuyXPSkeleton = () => {
  return (
    <SkeletonPage className="flex flex-col bg-[#09090b]">
      {/* Header */}
      <div className="bg-[#09090b] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonBase className="h-9 w-9 rounded-lg" />
              <SkeletonBase className="h-4 w-20 rounded" />
            </div>
            <SkeletonBase className="h-8 w-16 rounded-lg opacity-50" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 flex flex-col gap-4"
            >
              {/* Icon */}
              <SkeletonBase className="w-10 h-10 rounded-lg" />

              {/* Label & Amount */}
              <div className="space-y-3">
                <SkeletonBase className="w-16 h-4 rounded" />
                <div className="flex items-baseline gap-1">
                  <SkeletonBase className="w-20 h-8 rounded" />
                  <SkeletonBase className="w-4 h-3 rounded" />
                </div>
              </div>

              {/* Bonus Tag */}
              <SkeletonBase className="w-24 h-3 rounded opacity-30" />

              {/* Button */}
              <SkeletonBase className="w-full h-10 rounded-lg mt-auto" />
            </div>
          ))}
        </div>
      </main>
    </SkeletonPage>
  );
};

export default BuyXPSkeleton;
