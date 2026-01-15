import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Play } from 'lucide-react';
import { notify } from '../services/notification';


const LevelModal = ({ selectedLevel, onClose }) => {
    if (!selectedLevel) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="w-80 rounded-3xl overflow-hidden"
                    style={{ 
                        background: 'linear-gradient(180deg, #6b5a4a 0%, #5c4a3a 30%, #3d3228 100%)',
                        border: '5px solid #a08060',
                        boxShadow: `
                            inset 0 2px 8px rgba(255,255,255,0.2),
                            0 10px 0 #2a2218,
                            0 12px 8px rgba(0,0,0,0.4),
                            0 20px 40px rgba(0,0,0,0.6)
                        `
                    }}
                    initial={{ scale: 0.8, y: 50, rotateX: -15 }}
                    animate={{ scale: 1, y: 0, rotateX: 0 }}
                    exit={{ scale: 0.8, y: 50, rotateX: 15 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-4 text-center"
                        style={{ 
                            background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
                        }}>
                        <p className="text-yellow-300 font-black text-2xl drop-shadow-lg">Level {selectedLevel.id}</p>
                        <p className="text-white/80 font-semibold">{selectedLevel.name}</p>
                    </div>
                    
                    <div className="p-6 text-center">
                        {/* Level icon */}
                        <div className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center relative"
                            style={{ 
                                background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 30%, #d97706 70%, #b45309 100%)',
                                border: '4px solid #fcd34d',
                                boxShadow: 'inset 0 3px 8px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.3), 0 6px 0 #92400e, 0 8px 12px rgba(0,0,0,0.4)'
                            }}>
                            <div className="absolute top-1 left-2 right-2 h-6 bg-linear-to-b from-white/40 to-transparent rounded-t-xl" />
                            <span className="text-white drop-shadow-lg">{selectedLevel.icon && React.cloneElement(selectedLevel.icon, { size: 48 })}</span>
                        </div>
                        
                        {/* Stars */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3].map((star) => (
                                <motion.span 
                                    key={star} 
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: star * 0.15 }}
                                >
                                    <Star 
                                        size={32} 
                                        className={`${star <= selectedLevel.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 fill-gray-600'}`} 
                                    />
                                </motion.span>
                            ))}
                        </div>
                        
                        {/* Play button */}
                        <motion.button 
                            onClick={() => notify.loading(`Loading Level ${selectedLevel.id}...`, { duration: 3000 })}
                            className="w-full py-4 rounded-xl font-bold text-xl text-white shadow-lg bg-green-600 hover:bg-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                             <Play size={24} fill="currentColor" className="text-white" />
                             <span>PLAY</span>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LevelModal;
