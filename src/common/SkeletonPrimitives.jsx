import { cn } from "../lib/utils";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
);

export const SkeletonBase = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/[0.08] rounded-xl",
        className,
      )}
      {...props}
    >
      <Shimmer />
      {children}
    </div>
  );
};

const SkeletonCircle = ({ className, ...props }) => (
  <SkeletonBase className={cn("rounded-full", className)} {...props} />
);

const SkeletonText = ({ className, ...props }) => (
  <SkeletonBase className={cn("h-4 w-full", className)} {...props} />
);

const SkeletonButton = ({ className, ...props }) => (
  <SkeletonBase className={cn("h-10 w-24 rounded-lg", className)} {...props} />
);

// New: Avatar skeleton with size variants
const SkeletonAvatar = ({ size = "md", className, ...props }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };
  return <SkeletonCircle className={cn(sizes[size], className)} {...props} />;
};

// New: Card skeleton for content sections
const SkeletonCard = ({ className, children, ...props }) => (
  <SkeletonBase
    className={cn("p-4 rounded-2xl bg-white/5", className)}
    {...props}
  >
    {children}
  </SkeletonBase>
);

// New: Code editor skeleton with line numbers
export const SkeletonCode = ({ lines = 12, className, ...props }) => {
  // Deterministic widths for code lines (no Math.random)
  const lineWidths = [85, 60, 45, 70, 90, 55, 75, 40, 80, 65, 50, 95];

  return (
    <div
      className={cn("bg-[#1e1e1e] rounded-xl overflow-hidden", className)}
      {...props}
    >
      <div className="flex">
        {/* Line numbers gutter */}
        <div className="w-12 bg-white/5 border-r border-white/5 py-4 px-2 flex flex-col gap-2">
          {[...Array(lines)].map((_, i) => (
            <div key={i} className="h-3 w-6 bg-white/5 rounded" />
          ))}
        </div>
        {/* Code content */}
        <div className="flex-1 p-4 space-y-2 relative overflow-hidden">
          <Shimmer />
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className="h-3 bg-white/5 rounded"
              style={{ width: `${lineWidths[i % lineWidths.length]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// New: Tab bar skeleton
const SkeletonTabs = ({ count = 3, className, ...props }) => (
  <div
    className={cn("flex border-b border-white/5 bg-black/20", className)}
    {...props}
  >
    {[...Array(count)].map((_, i) => (
      <SkeletonBase key={i} className="flex-1 h-10 m-1 rounded-lg" />
    ))}
  </div>
);

// New: Stats card skeleton
const SkeletonStats = ({ className, ...props }) => (
  <SkeletonCard className={cn("flex flex-col gap-3", className)} {...props}>
    <div className="h-3 w-20 bg-white/10 rounded" />
    <div className="h-8 w-16 bg-white/10 rounded" />
    <div className="h-2 w-full bg-white/5 rounded-full" />
  </SkeletonCard>
);

export const SkeletonPage = ({ children, className }) => (
  <div
    className={cn(
      "h-screen w-full bg-[#0b1119] text-white overflow-hidden relative",
      className,
    )}
  >
    <div className="absolute inset-0 pointer-events-none bg-[#0b1119]" />
    <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-[#101928] via-[#0d141f] to-[#0a0f17]" />
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
      }}
    />
    <div className="absolute top-0 left-[8%] w-[24rem] h-[24rem] rounded-full bg-[#2563eb]/10 blur-3xl pointer-events-none" />
    <div className="absolute bottom-[-8rem] right-[10%] w-[20rem] h-[20rem] rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none" />

    {children}

    <style>{`
      @keyframes shimmer {
        100% { transform: translateX(200%); }
      }
    `}</style>
  </div>
);
