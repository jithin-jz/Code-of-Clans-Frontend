import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ isLoading }) => {
    const [progress, setProgress] = useState(0);
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            setShowLoader(false);
            return;
        }
        
        setShowLoader(true);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + Math.random() * 10 + 3;
            });
        }, 60);

        return () => clearInterval(progressInterval);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {showLoader && (
                <motion.div 
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                >
                    {/* Subtle gradient orb */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-30"
                        style={{
                            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)'
                        }}
                    />

                    <div className="relative flex flex-col items-center">
                        {/* Modern Title */}
                        <motion.h1
                            className="text-5xl md:text-7xl font-black tracking-tight mb-16"
                            style={{ 
                                fontFamily: "'Lilita One', system-ui, sans-serif",
                                background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #6366f1 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            CODE OF CLANS
                        </motion.h1>

                        {/* Minimal Progress Bar */}
                        <div className="w-64 md:w-80">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full rounded-full"
                                    style={{ 
                                        width: `${Math.min(progress, 100)}%`,
                                        background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)'
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            
                            {/* Progress percentage */}
                            <motion.p 
                                className="text-white/40 text-xs mt-4 text-center font-medium tracking-widest"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {Math.min(Math.round(progress), 100)}%
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Loader;
