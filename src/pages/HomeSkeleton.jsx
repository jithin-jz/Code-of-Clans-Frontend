import React from 'react';

const HomeSkeleton = () => {
    return (
        <div className="h-screen relative overflow-hidden bg-[#0a0a0a] text-white flex items-center justify-center">
            {/* Background Texture */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
                    backgroundSize: '40px 40px' 
                }} 
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

            {/* Top Left Profile Skeleton */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                <div className="flex flex-col gap-2">
                    <div className="w-32 h-4 rounded bg-white/10"></div>
                    <div className="w-24 h-3 rounded bg-white/5"></div>
                </div>
            </div>

            {/* Right Side UI Skeleton */}
            <div className="absolute top-6 right-6 z-50 flex flex-col gap-4 animate-pulse">
                <div className="w-40 h-12 rounded-full bg-white/10"></div>
                <div className="w-12 h-12 rounded-2xl bg-white/10"></div>
                <div className="w-12 h-12 rounded-2xl bg-white/10"></div>
                <div className="w-12 h-12 rounded-2xl bg-white/10"></div>
            </div>

            {/* Play Button Skeleton */}
             <div className="fixed bottom-6 right-6 z-50 animate-pulse">
                <div className="w-48 h-16 rounded-full bg-white/10"></div>
            </div>

            {/* Grid Skeleton - 9 columns, 6 rows = 54 items */}
            <div className="w-full max-w-7xl pl-4 pr-28">
                <div className="grid grid-cols-9 gap-4 gap-y-6 justify-items-center animate-pulse">
                    {[...Array(54)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-lg bg-white/10"></div>
                            <div className="w-6 h-2 rounded bg-white/5"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeSkeleton;
