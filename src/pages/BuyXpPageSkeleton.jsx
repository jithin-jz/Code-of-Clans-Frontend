import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonText,
  SkeletonButton
} from "../common/SkeletonPrimitives";

const BuyXpPageSkeleton = () => {
  return (
    <SkeletonPage className="bg-[#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Page Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <SkeletonBase className="h-6 w-32 mx-auto rounded-full bg-white/[0.05] border border-white/10" />
          <SkeletonText width="100%" height="2.5rem" className="bg-white/5" />
          <SkeletonText width="80%" height="1.1rem" className="mx-auto opacity-20" />
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard
              key={i}
              className="flex flex-col h-[320px] p-6 bg-black border border-white/5 relative group"
            >
              {/* Card Header */}
              <div className="space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <SkeletonBase className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 shadow-xl" />
                  {i % 4 === 0 && <SkeletonBase className="h-6 w-20 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20" />}
                </div>

                <div className="space-y-3">
                  <SkeletonText width="60%" height="1.25rem" />
                  <div className="flex items-end gap-2">
                    <SkeletonText width="120px" height="2.5rem" />
                    <SkeletonText width="30px" height="1rem" className="pb-2 opacity-30 text-xs" />
                  </div>
                </div>

                <div className="pt-2">
                  <SkeletonText width="50%" height="0.75rem" className="opacity-50" />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-white/5">
                <SkeletonButton className="h-12 bg-white/[0.05] border border-white/10" />
              </div>
            </SkeletonCard>
          ))}
        </div>

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-6 py-10 opacity-30">
          <div className="flex gap-8">
            <SkeletonText width="120px" height="0.75rem" />
            <SkeletonText width="120px" height="0.75rem" />
            <SkeletonText width="120px" height="0.75rem" />
          </div>
          <SkeletonText width="240px" height="0.6rem" />
        </div>

      </div>
    </SkeletonPage>
  );
};

export default BuyXpPageSkeleton;
