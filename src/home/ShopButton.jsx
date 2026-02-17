import { ShoppingBag, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShopButton = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed left-6 bottom-6 z-30">
      <button
        type="button"
        onClick={() => navigate("/store")}
        className="group rounded-2xl border border-white/10 bg-[#232323] hover:bg-[#2b2b2b] text-zinc-100 px-4 py-3 flex items-center gap-3 transition-all"
      >
        <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
          <ShoppingBag size={17} className="text-[#f43f5e]" />
        </div>
        <div className="text-left leading-tight">
          <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
            Store
          </p>
          <p className="text-sm font-bold">Customize Workspace</p>
        </div>
        <ChevronRight
          size={16}
          className="text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all"
        />
      </button>
    </div>
  );
};

export default ShopButton;
