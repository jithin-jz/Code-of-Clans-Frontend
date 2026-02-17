import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShopButton = () => {
    const navigate = useNavigate();
    return (
        <div className="fixed left-6 bottom-6 z-30">
            <button 
                onClick={() => navigate('/store')}
                className="group relative"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#ffa116] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                
                {/* Button Content */}
                <div className="relative bg-[#262626] border border-[#3a3a3a] hover:border-[#ffa116] rounded-full p-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#ffb84d] via-[#ffa116] to-[#d97706] rounded-full flex items-center justify-center text-black shadow-lg">
                        <ShoppingBag size={28} className="ml-0.5" />
                    </div>
                </div>
            </button>
        </div>
    );
};

export default ShopButton;
