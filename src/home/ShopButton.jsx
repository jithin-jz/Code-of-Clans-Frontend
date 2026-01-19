import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShopButton = () => {
    const navigate = useNavigate();
    return (
        <div className="fixed left-6 bottom-6 z-30">
            <button 
                onClick={() => navigate('/shop')}
                className="group relative"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                
                {/* Button Content */}
                <div className="relative bg-[#121212] border border-orange-500/30 hover:border-orange-500/80 rounded-full pl-6 pr-8 py-5 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                    <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-900/50">
                        <ShoppingBag size={24} className="ml-0.5" />
                    </div>
                    <div>
                        <p className="text-white font-black text-2xl tracking-wide group-hover:text-orange-400 transition-colors">SHOP</p>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default ShopButton;
