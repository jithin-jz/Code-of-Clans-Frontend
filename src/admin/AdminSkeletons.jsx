import React from "react";
import {
  SkeletonBase,
  SkeletonPage,
  SkeletonCard,
  SkeletonText,
} from "../common/SkeletonPrimitives";
import { TableCell, TableRow } from "../components/ui/table";

/**
 * Reusable Stat Card Skeleton
 */
export const StatCardSkeleton = () => (
  <SkeletonCard className="h-24 p-5">
    <div className="flex justify-between mb-4">
      <SkeletonText width="40%" height="0.75rem" />
      <SkeletonBase className="h-8 w-8 rounded-lg" />
    </div>
    <SkeletonText width="60%" height="1.5rem" />
  </SkeletonCard>
);

/**
 * Reusable Table Row Skeleton
 */
export const AdminTableLoadingRow = ({ colSpan = 5 }) => (
  <TableRow className="border-white/5">
    {[...Array(colSpan)].map((_, i) => (
      <TableCell key={i} className="py-4">
        <SkeletonBase className="h-6 w-full rounded-md opacity-40" />
      </TableCell>
    ))}
  </TableRow>
);

/**
 * High-Level Page Skeletons
 */
export const AnalyticsSkeleton = () => (
  <div className="space-y-8">
    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Main Chart */}
    <SkeletonCard className="h-80" />

    {/* Double Tables */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-64" />
    </div>
  </div>
);

export const AdminPageSkeleton = () => (
  <SkeletonPage className="flex h-screen overflow-hidden flex-col md:flex-row">
    <aside className="hidden md:block w-[260px] h-full border-r border-white/5 bg-[#0a0a0a] p-5 space-y-4">
      <SkeletonBase className="h-8 w-28 rounded-md" />
      <div className="space-y-2 mt-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonBase key={i} className="h-11 w-full rounded-xl" />
        ))}
      </div>
    </aside>
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="mb-8 space-y-2">
        <SkeletonText width="200px" height="2rem" />
        <SkeletonText width="300px" height="0.8rem" className="opacity-40" />
      </div>
      <AnalyticsSkeleton />
    </main>
  </SkeletonPage>
);
