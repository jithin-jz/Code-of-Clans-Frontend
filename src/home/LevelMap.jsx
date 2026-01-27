import React from 'react';
import { motion } from 'framer-motion';
import LevelButton from '../game/LevelButton';
import PlayButton from './PlayButton';

const LevelMap = ({ 
    levels, 
    handleLevelClick, 
    user 
}) => {
    // Standard Grid Layout
    return (
        <div className="w-full h-screen relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
            {/* Play Button - Fixed */}
            <PlayButton 
                user={user} 
                levels={levels} 
                className="fixed bottom-6 right-6 z-50 scale-90 origin-bottom-right" 
            />

            {/* Added right padding to prevent overlap with fixed UI buttons */}
            <div className="w-full max-w-7xl pl-4 pr-28">
                <div className="grid grid-cols-9 gap-4 gap-y-6 justify-items-center">
                    {levels.map((level, index) => {
                        const isCurrentLevel = level.unlocked && !levels[index + 1]?.unlocked;
                        
                        return (
                            <motion.div 
                                key={level.id}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.01 }}
                                className="relative group"
                            >
                                {/* Active Pulse */}
                                {isCurrentLevel && (
                                    <div className="absolute inset-0 bg-[#FFD700]/20 rounded-xl blur-md animate-pulse"></div>
                                )}
                                
                                <LevelButton 
                                    level={level} 
                                    isCurrentLevel={isCurrentLevel} 
                                    onClick={() => handleLevelClick(level)} 
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LevelMap;
