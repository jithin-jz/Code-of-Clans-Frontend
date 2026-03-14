import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonText,
  SkeletonButton,
} from "../common/SkeletonPrimitives";

const LoginSkeleton = () => {
  return (
    <SkeletonPage className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,0.1),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(14,165,233,0.08),transparent_30%)]" />
      <div className="app-grid-overlay absolute inset-0 pointer-events-none opacity-[0.04]" />

      <div className="relative z-10 w-full max-w-[440px] px-4">
        {/* Branding placeholder */}
        <div className="flex justify-center mb-8">
          <SkeletonText width="180px" height="1rem" className="bg-white/5" />
        </div>

        {/* Main login card placeholder */}
        <SkeletonCard className="app-panel p-8 pb-10 rounded-2xl">
          <div className="space-y-6">
            {/* Input field placeholder */}
            <div className="space-y-2">
              <SkeletonBase className="h-14 w-full rounded-2xl bg-white/[0.03] border border-white/10" />
            </div>

            {/* Action button placeholder */}
            <SkeletonButton className="h-14 bg-white/[0.05] border border-white/10 text-transparent" />

            {/* Divider */}
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-x-0 h-px bg-border/70" />
              <div className="relative bg-[rgba(10,16,28,0.96)] px-4">
                <SkeletonText
                  width="100px"
                  height="0.6rem"
                  className="opacity-40"
                />
              </div>
            </div>

            {/* Social logins */}
            <div className="grid grid-cols-2 gap-4">
              <SkeletonBase className="h-14 rounded-2xl border border-white/5 bg-white/[0.02]" />
              <SkeletonBase className="h-14 rounded-2xl border border-white/5 bg-white/[0.02]" />
            </div>
          </div>
        </SkeletonCard>

        {/* Copyright placeholder */}
        <div className="mt-8 flex justify-center">
          <SkeletonText width="140px" height="0.6rem" className="opacity-20" />
        </div>
      </div>
    </SkeletonPage>
  );
};

export default LoginSkeleton;
