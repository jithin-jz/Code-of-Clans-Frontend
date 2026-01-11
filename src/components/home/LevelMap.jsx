import React from 'react';
import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';
import { LevelButton } from '../game';

const LevelMap = ({ 
    scrollRef, 
    levels, 
    pathPositions, 
    decorations, 
    snowflakePositions, 
    handleLevelClick 
}) => {
    const getPosition = (index) => pathPositions[index] || { x: 50, y: 50 };

    return (
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden no-scrollbar">
            <div className="relative w-full" style={{ height: '1200px', backgroundImage: 'url(/assets/clean-turf-fixed.png)', backgroundSize: '400px', backgroundRepeat: 'repeat' }}>
                
                {/* Decorations */}
                <div>
                    {decorations.map((deco, i) => (
                        <motion.img key={`deco-${i}`} src={deco.src} alt="decoration" className={`absolute drop-shadow-lg ${deco.zIndex}`}
                            style={{ left: `${deco.x}%`, top: `${deco.y}%`, width: deco.size, opacity: deco.opacity, filter: deco.brightness ? `brightness(${deco.brightness})` : 'none' }}
                            animate={deco.animate} transition={deco.transition} />
                    ))}
                </div>
                
                {/* Sky & Clouds */}
                <div className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, transparent 100%)' }}>
                    <motion.div className="absolute top-[30px] w-24 h-12 bg-white/80 rounded-full" style={{ filter: 'blur(2px)' }} animate={{ x: ['5%', '15%', '5%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                    <motion.div className="absolute top-[50px] w-16 h-8 bg-white/70 rounded-full" style={{ filter: 'blur(1px)' }} animate={{ x: ['80%', '70%', '80%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} />
                </div>

                {/* Snow overlay */}
                <div className="absolute top-0 left-0 right-0 h-[55%] pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(226,232,240,0.5) 0%, rgba(148,163,184,0.3) 50%, transparent 100%)' }} />
                
                {/* Snowflakes */}
                {snowflakePositions.map((pos, i) => (
                    <motion.span key={i} className="absolute text-white/60 pointer-events-none drop-shadow" style={pos}
                        animate={{ y: [0, 10, 0], rotate: [0, 180, 360] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
                        <Snowflake size={20} />
                    </motion.span>
                ))}

                {/* Path line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs><filter id="glow"><feGaussianBlur stdDeviation="0.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                    <path d={`M ${getPosition(0).x} ${getPosition(0).y} ${levels.slice(1).map((_, i) => `L ${getPosition(i + 1).x} ${getPosition(i + 1).y}`).join(' ')}`}
                        stroke="#6b5a4a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                </svg>

                {/* Level Nodes */}
                {levels.map((level, index) => {
                    const pos = getPosition(index);
                    const isCurrentLevel = level.unlocked && !levels[index + 1]?.unlocked;
                    return (
                        <motion.div key={level.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.05, type: 'spring' }}>
                            <LevelButton level={level} isCurrentLevel={isCurrentLevel} onClick={() => handleLevelClick(level)} />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelMap;
