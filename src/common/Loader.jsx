import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col items-center gap-4">
                        {/* Elegant Simple Spinner */}
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-[#ffa116]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-[#ffa116] rounded-full animate-spin"></div>
                        </div>
                        
                        <p 
                            className="text-[#ffa116] text-sm font-bold tracking-[0.2em] uppercase opacity-80 animate-pulse"
                        >
                            Loading
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Loader;
