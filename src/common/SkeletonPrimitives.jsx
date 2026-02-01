import { cn } from "../lib/utils";

export const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent z-10" />
);

export const SkeletonBase = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/5 border border-white/10 rounded-xl",
        className,
      )}
      {...props}
    >
      <Shimmer />
      {children}
    </div>
  );
};

export const SkeletonCircle = ({ className, ...props }) => (
  <SkeletonBase className={cn("rounded-full", className)} {...props} />
);

export const SkeletonText = ({ className, ...props }) => (
  <SkeletonBase className={cn("h-4 w-full", className)} {...props} />
);

export const SkeletonButton = ({ className, ...props }) => (
  <SkeletonBase className={cn("h-10 w-24 rounded-lg", className)} {...props} />
);

export const SkeletonPage = ({ children, className }) => (
  <div
    className={cn(
      "h-screen w-full bg-[#050505] text-white overflow-hidden relative",
      className,
    )}
  >
    {/* Background Texture */}
    <div
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

    {children}

    <style>{`
            @keyframes shimmer {
                100% {
                    transform: translateX(100%);
                }
            }
        `}</style>
  </div>
);
