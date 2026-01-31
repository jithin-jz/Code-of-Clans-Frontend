import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const PlayButton = ({ levels, className }) => {
    const navigate = useNavigate();
    
    // Priority 1: First unlocked but not completed level (Current Grind)
    // Priority 2: Highest order unlocked level (Latest Reached)
    // Priority 3: First level (Fallback)
    
    // Assuming levels are sorted by order 1..N
    const activeLevel = levels?.find(l => l.unlocked && !l.completed);
    const latestLevel = levels?.filter(l => l.unlocked).pop(); 
    
    const currentLevel = activeLevel || latestLevel || levels?.[0];

    if (!currentLevel) return null;

    return (
        <motion.div 
            className={className || "fixed right-6 bottom-6 z-30"}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.1 }}
        >
            <button 
                onClick={() => {
                    navigate(`/level/${currentLevel.slug}`);
                }}
                className="group relative"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                
                {/* Button Content */}
                <div className="relative bg-[#121212] border border-[#FFD700]/30 hover:border-[#FFD700] rounded-full pl-8 pr-10 py-5 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                    <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-black shadow-lg shadow-yellow-900/50">
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                    <div>
                        <p className="text-white font-black text-2xl tracking-wide group-hover:text-[#FFD700] transition-colors">PLAY</p>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Level {currentLevel.order}</p>
                    </div>
                </div>
            </button>
        </motion.div>
    );
};

export default PlayButton;
