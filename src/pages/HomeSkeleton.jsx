import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonText,
} from "../common/SkeletonPrimitives";

const HomeSkeleton = () => {
  return (
    <SkeletonPage className="bg-black">
      <div className="w-full px-3 sm:px-5 pt-4 pb-8">
        {/* Overall progress skeleton */}
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-xl border border-white/5 bg-black p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <SkeletonText
                width="90px"
                height="0.65rem"
                className="bg-black"
              />
              <SkeletonText
                width="160px"
                height="1.25rem"
                className="bg-black"
              />
            </div>
            <div className="sm:w-48 space-y-2">
              <div className="flex justify-between">
                <SkeletonText
                  width="70px"
                  height="0.65rem"
                  className="bg-black"
                />
                <SkeletonText
                  width="30px"
                  height="0.65rem"
                  className="bg-black"
                />
              </div>
              <div className="h-1 w-full bg-black rounded-full" />
            </div>
          </div>
        </div>

        {/* Track sections skeleton — 3 tracks with 5-col grid */}
        {[...Array(3)].map((_, sectionIdx) => (
          <section key={sectionIdx} className="px-4 py-5">
            {/* Track header */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <SkeletonText
                  width="140px"
                  height="0.85rem"
                  className="bg-black"
                />
                <SkeletonText
                  width="220px"
                  height="0.65rem"
                  className="bg-black"
                />
              </div>
              <div className="space-y-1 text-right shrink-0">
                <SkeletonText
                  width="30px"
                  height="0.65rem"
                  className="bg-black"
                />
                <SkeletonBase className="w-20 h-1 rounded-full bg-black" />
              </div>
            </div>

            {/* 5-col level cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {[...Array(5)].map((__, cardIdx) => (
                <div
                  key={cardIdx}
                  className="rounded-xl border border-white/5 bg-black p-3.5 min-h-[110px] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <SkeletonBase className="w-8 h-8 rounded-lg bg-black shrink-0" />
                      <div className="space-y-1.5 min-w-0 pt-0.5 flex-1">
                        <SkeletonText
                          width="50%"
                          height="0.6rem"
                          className="bg-black"
                        />
                        <SkeletonText
                          width="85%"
                          height="0.75rem"
                          className="bg-black"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <SkeletonBase className="h-4 w-12 rounded-md bg-[#1c1c1c]" />
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <SkeletonBase
                          key={s}
                          className="w-2 h-2 rounded-full bg-[#1a1a1a]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SkeletonPage>
  );
};

export default HomeSkeleton;
