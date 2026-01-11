import { motion } from 'framer-motion';
import { Star, Lock, Gift, Snowflake, MapPin } from 'lucide-react';

// 3D Level Button
const LevelButton = ({ level, isCurrentLevel, onClick }) => {
    const baseStyle = level.unlocked ? {
        background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 30%, #d97706 60%, #b45309 100%)',
        border: '4px solid #fcd34d',
        boxShadow: `
            inset 0 3px 8px rgba(255,255,255,0.5),
            inset 0 -4px 8px rgba(0,0,0,0.3),
            0 6px 0 #92400e,
            0 8px 6px rgba(0,0,0,0.4),
            0 12px 20px rgba(180,83,9,0.4)
        `,
    } : {
        background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #475569 100%)',
        border: '4px solid #cbd5e1',
        boxShadow: `
            inset 0 2px 6px rgba(255,255,255,0.3),
            inset 0 -3px 6px rgba(0,0,0,0.2),
            0 5px 0 #374151,
            0 7px 4px rgba(0,0,0,0.3),
            0 10px 16px rgba(0,0,0,0.3)
        `,
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={!level.unlocked}
            className={`relative flex flex-col items-center ${level.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            whileHover={level.unlocked ? { scale: 1.1, y: -4 } : {}}
            whileTap={level.unlocked ? { scale: 0.95, y: 2 } : {}}
        >
            {/* Level circle */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${isCurrentLevel ? 'ring-4 ring-yellow-400 ring-opacity-80' : ''}`}
                style={baseStyle}>

                {/* Glossy shine */}
                <div className="absolute top-1 left-2 right-2 h-5 bg-linear-to-b from-white/40 to-transparent rounded-t-xl pointer-events-none" />

                {level.unlocked ? (
                    <span className="text-white drop-shadow-lg">{level.icon}</span>
                ) : (
                    <>
                        {/* Ice overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-cyan-300/40 to-blue-400/30" />
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg drop-shadow text-white/80">
                            <Snowflake size={16} />
                        </span>
                        <span className="text-white/70 relative z-10 drop-shadow">
                            {level.hasGift ? <Gift size={28} className="text-red-500" /> : <Lock size={28} className="text-slate-600" />}
                        </span>
                    </>
                )}

                {isCurrentLevel && (
                    <motion.div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        <MapPin size={32} fill="currentColor" />
                    </motion.div>
                )}
            </div>

            {/* Label with 3D effect */}
            <div className="mt-2 px-3 py-1 rounded-lg text-center"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                <p className="text-white text-xs font-bold drop-shadow">{level.name}</p>
                <p className="text-yellow-400 text-[10px] font-semibold">Level {level.id}</p>
            </div>

            {/* Stars */}
            {level.unlocked && level.stars > 0 && (
                <div className="flex mt-1 gap-0.5">
                    {[1, 2, 3].map((star) => (
                        <motion.span
                            key={star}
                            transition={{ delay: star * 0.1 }}
                        >
                            <Star
                                size={12}
                                className={`${star <= level.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-gray-600'}`}
                            />
                        </motion.span>
                    ))}
                </div>
            )}
        </motion.button>
    );
};

export default LevelButton;
