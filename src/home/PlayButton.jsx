import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const PlayButton = ({ user, levels }) => {
    const navigate = useNavigate();
    
    // Find the first available level:
    // 1. First "UNLOCKED" (but not completed) level.
    // 2. OR if all unlocked are completed, the last completed one.
    // Actually simpler: Find the highest order "UNLOCKED" or "COMPLETED" level.
    // But backend sorts by order. So we find the *last* level that is UNLOCKED/COMPLETED?
    // No, if I am on L1, L1 is Unlocked. L2 is Locked. I play L1.
    // If I complete L1, L1 is Completed, L2 is Unlocked. I play L2.
    // So the rule is: Find the FIRST level where (status === 'UNLOCKED').
    // Wait, if I have L1 (Completed), L2 (Completed), L3 (Unlocked).
    // I want to play L3.
    // If I have only L1 (Unlocked). I play L1.
    // So: Find first level where status == 'UNLOCKED'. 
    // Wait, backend returns status. If I completed L1, status is 'COMPLETED'.
    // So filter for 'UNLOCKED' or 'COMPLETED'?
    // If I filter for 'UNLOCKED', I get L3. Correct.
    // If I filter for 'COMPLETED', I get L1, L2.
    // So logic: `levels.find(l => l.status === 'UNLOCKED')`.
    // Fallback: If no 'UNLOCKED' level found (e.g. all completed?), then play the last level?
    // Or if all 'LOCKED' (shouldn't happen), play L1.
    
    // NOTE: In `Home.jsx`, we map API levels and set `unlocked` boolean.
    // `unlocked` is true if status is UNLOCKED or COMPLETED.
    // `completed` is true if status is COMPLETED.
    // So if I want the *next* challenge:
    // It's the first one that is `unlocked` but NOT `completed`.
    // OR if all unlocked are completed (end of content?), the last one.
    
    const currentLevel = levels?.find(l => l.unlocked && !l.completed) 
        || levels?.find(l => l.unlocked) // Fallback for pure replaying or if only 1 level
        || levels?.[0]; // Absolute fallback

    if (!currentLevel) return null;

    return (
        <motion.div 
            className="fixed right-6 bottom-6 z-30"
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
