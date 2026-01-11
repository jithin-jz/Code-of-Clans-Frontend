import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button3D } from '../common';

const ShopButton = () => {
    return (
        <motion.div className="fixed left-4 bottom-4 z-30" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.3 }}>
            <Button3D variant="orange" className="px-8 py-5 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2">
                    <span className="text-white drop-shadow-lg"><ShoppingCart size={28} /></span>
                    <span className="text-white font-black text-2xl drop-shadow-lg" style={{ textShadow: '2px 2px 0 #92400e' }}>SHOP</span>
                </div>
                <p className="text-white/80 text-sm font-bold">New Offers</p>
            </Button3D>
        </motion.div>
    );
};

export default ShopButton;
