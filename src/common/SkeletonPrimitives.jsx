import React from "react";
import { cn } from "../lib/utils";

/**
 * Shimmer Effect component
 * Industrial Standard: Smooth, translucent CSS animation
 */
export const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
);

/**
 * Base Skeleton component with layout and shimmer
 */
export const SkeletonBase = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/[0.02] border border-white/[0.01] rounded-xl",
        className,
      )}
      {...props}
    >
      <Shimmer />
      {children}
    </div>
  );
};

/* --- Specialized Primitives --- */

export const SkeletonCircle = ({ className, ...props }) => (
  <SkeletonBase className={cn("rounded-full aspect-square", className)} {...props} />
);

export const SkeletonText = ({ className, width = "100%", height = "1rem", ...props }) => (
  <SkeletonBase
    className={cn("rounded-md", className)}
    style={{ width, height, ...props.style }}
    {...props}
  />
);

export const SkeletonButton = ({ className, ...props }) => (
  <SkeletonBase className={cn("h-11 w-full rounded-xl", className)} {...props} />
);

export const SkeletonAvatar = ({ size = "md", className, ...props }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };
  return <SkeletonCircle className={cn(sizes[size], className)} {...props} />;
};

export const SkeletonCard = ({ className, children, variant = "solid", ...props }) => {
  const variants = {
    glass: "bg-[#000000]/80 backdrop-blur-md border border-white/5 shadow-2xl",
    solid: "bg-black border border-white/5",
    plain: "bg-transparent border border-white/5"
  };

  return (
    <div
      className={cn("p-4 rounded-xl relative overflow-hidden", variants[variant], className)}
      {...props}
    >
      <Shimmer />
      {children}
    </div>
  );
};

/* --- Complex Primitives --- */

export const SkeletonCode = ({ lines = 12, className, ...props }) => {
  const lineWidths = [85, 60, 45, 70, 90, 55, 75, 40, 80, 65, 50, 95];

  return (
    <div
      className={cn("bg-black rounded-xl border border-white/5 overflow-hidden font-mono", className)}
      {...props}
    >
      <div className="flex">
        <div className="w-12 bg-white/[0.02] border-r border-white/5 py-4 px-2 flex flex-col gap-2.5">
          {[...Array(lines)].map((_, i) => (
            <div key={i} className="h-3 w-6 bg-white/[0.03] rounded" />
          ))}
        </div>
        <div className="flex-1 p-4 space-y-2.5 relative overflow-hidden">
          <Shimmer />
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className="h-3 bg-white/[0.04] rounded"
              style={{ width: `${lineWidths[i % lineWidths.length]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonStats = ({ className, ...props }) => (
  <SkeletonCard className={cn("flex flex-col gap-3", className)} {...props}>
    <SkeletonText width="60%" height="0.75rem" className="opacity-30" />
    <SkeletonText width="40%" height="1.5rem" />
    <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden mt-2">
      <SkeletonBase className="h-full w-2/3 bg-blue-500/20" />
    </div>
  </SkeletonCard>
);

/* --- Layout Wrapper --- */

export const SkeletonPage = ({ children, className }) => (
  <div
    className={cn(
      "w-full min-h-screen text-zinc-400 relative",
      className,
    )}
  >
    {children}

    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

/* --- High-Level Page Skeletons --- */

export const SkeletonAdminDashboard = () => (
  <SkeletonPage className="p-6 bg-[#000000] space-y-8">
    <div className="flex justify-between items-center">
      <SkeletonText width="250px" height="2rem" />
      <div className="flex gap-4">
        <SkeletonBase className="h-10 w-32 rounded-xl" />
        <SkeletonBase className="h-10 w-10 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <SkeletonStats key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SkeletonCard className="lg:col-span-2 h-[400px]" />
      <SkeletonCard className="h-[400px]" />
    </div>
  </SkeletonPage>
);

export const SkeletonGenericPage = () => (
  <SkeletonPage className="p-8 space-y-8 bg-[#000000]">
    <div className="space-y-4">
      <SkeletonText width="300px" height="2.5rem" />
      <SkeletonText width="500px" height="1.1rem" className="opacity-40" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <SkeletonCard key={i} className="h-64" />
      ))}
    </div>
    <SkeletonCard className="h-96" />
  </SkeletonPage>
);
