import React from "react";
import { SkeletonBase, SkeletonPage } from "../common/SkeletonPrimitives";

const BuyXPSkeleton = () => {
  return (
    <SkeletonPage className="flex flex-col items-center p-6 pt-24">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <SkeletonBase className="h-12 w-64 mx-auto rounded-2xl" />
          <SkeletonBase className="h-6 w-96 mx-auto rounded-xl" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonBase className="h-[400px] rounded-3xl" />
          <SkeletonBase className="h-[400px] rounded-3xl" />
          <SkeletonBase className="h-[400px] rounded-3xl" />
        </div>

        {/* Footer Section */}
        <SkeletonBase className="h-32 w-full rounded-2xl" />
      </div>
    </SkeletonPage>
  );
};

export default BuyXPSkeleton;
