import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button3D } from '../common';

const PlayButton = () => {
    return (
        <motion.div className="fixed right-4 bottom-4 z-30" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.3 }}>
            <Button3D variant="green" className="px-8 py-5">
                <div className="flex items-center gap-2 justify-center">
                    <Play size={28} fill="currentColor" className="text-white" />
                    <p className="text-white font-black text-2xl drop-shadow-lg" style={{ textShadow: '2px 2px 0 #15803d' }}>PLAY</p>
                </div>
                <p className="text-white/80 text-sm font-bold text-center">Level 5</p>
            </Button3D>
        </motion.div>
    );
};

export default PlayButton;
