import { motion } from 'framer-motion';
import { Star, Lock, MapPin } from 'lucide-react';


// 3D Level Button
const LevelButton = ({ level, isCurrentLevel, onClick }) => {
    const baseStyle = level.unlocked ? {
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', // Dark Slate
        border: '1px solid #fbbf24', // Gold Border
        boxShadow: '0 4px 6px rgba(0,0,0,0.5), 0 0 15px rgba(251, 191, 36, 0.1)', // Gold Glow
    } : {
        background: '#1f2937', // Gray
        border: '1px solid #374151',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={!level.unlocked}
            className={`relative flex flex-col items-center ${level.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            whileHover={level.unlocked ? { scale: 1.1, y: -4 } : {}}
            whileTap={level.unlocked ? { scale: 0.95, y: 2 } : {}}
        >
            {/* Level Square */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative transition-all duration-300
                ${isCurrentLevel ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : ''}
                ${level.unlocked ? 'hover:scale-105' : 'opacity-80 grayscale'}
            `}
                style={baseStyle}>

                {/* Glass Gloss (Subtle) */}
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent rounded-lg pointer-events-none" />

                {level.unlocked ? (
                    <span className="text-white drop-shadow-md scale-75">{level.icon}</span>
                ) : (
                    <span className="text-white/50">
                        <Lock size={16} />
                    </span>
                )}

                {isCurrentLevel && (
                    <motion.div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <MapPin size={20} fill="currentColor" />
                    </motion.div>
                )}
                {/* Stars (Small Overlay) */}
                {level.unlocked && (
                    <div className="absolute -bottom-1 flex gap-0.5 bg-[#1f2937]/80 rounded-full px-1 py-0.5 backdrop-blur-xs border border-white/5 shadow-sm transform scale-[0.6]">
                        {[1, 2, 3].map((star) => (
                            <Star
                                key={star}
                                size={8}
                                className={`${star <= (level.stars || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-gray-600'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Label */}
            <div className="mt-0.5">
                <p className={`text-[10px] font-bold font-mono ${level.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {level.type === 'CERTIFICATE' ? 'Badge' : `L${level.order || level.id}`}
                </p>
            </div>
        </motion.button>
    );
};

export default LevelButton;
