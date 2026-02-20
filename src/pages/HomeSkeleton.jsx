import React from "react";
import { SkeletonBase, SkeletonPage } from "../common/SkeletonPrimitives";

const HomeSkeleton = () => {
  return (
    <SkeletonPage className="relative">
      {/* Navbar */}
      <div className="relative z-10 h-16 border-b border-white/10 bg-[#0a1220]/85 backdrop-blur-xl px-3 sm:px-6 lg:px-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-28 h-10 rounded-full" />
          <SkeletonBase className="w-40 h-10 rounded-full" />
        </div>
        <SkeletonBase className="w-44 h-5 rounded-md" />
        <div className="flex items-center gap-2 justify-self-end">
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-10 h-10 rounded-full" />
          <SkeletonBase className="w-24 h-10 rounded-full" />
        </div>
      </div>

      {/* Content — Track sections matching ChallengeMap layout */}
      <div className="relative z-10 h-[calc(100vh-64px)] mt-0 px-6 pt-4 pb-0">
        <div className="h-full overflow-hidden space-y-6">
          {[...Array(3)].map((_, sectionIdx) => (
            <section
              key={sectionIdx}
              className="w-full rounded-xl border border-white/5 bg-[#111827]/70 p-5"
            >
              {/* Track header */}
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1.5">
                  <SkeletonBase className="h-4 w-32" />
                  <SkeletonBase className="h-3 w-20" />
                </div>
                <SkeletonBase className="h-1.5 w-36 rounded-full" />
              </div>

              {/* Level cards grid - 5 columns like the real layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {[...Array(sectionIdx === 0 ? 10 : 10)].map((__, cardIdx) => (
                  <div
                    key={cardIdx}
                    className="rounded-xl border border-[#2e3d54] bg-[#111a2a] p-3 min-h-[130px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <SkeletonBase className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1.5">
                          <SkeletonBase className="h-2.5 w-12" />
                          <SkeletonBase className="h-3.5 w-24" />
                        </div>
                      </div>
                      <SkeletonBase className="h-5 w-12 rounded-full" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <SkeletonBase className="h-3 w-10" />
                      <div className="flex gap-1">
                        <SkeletonBase className="h-3 w-3 rounded-full" />
                        <SkeletonBase className="h-3 w-3 rounded-full" />
                        <SkeletonBase className="h-3 w-3 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
};

export default HomeSkeleton;
