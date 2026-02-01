import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Lock,
  Check,
  Sparkles,
  Type,
  Palette,
  Package,
  PartyPopper,
  Crown,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "../components/ui/button";
import { storeAPI } from "../services/api";
import useAuthStore from "../stores/useAuthStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StoreSkeleton from "./StoreSkeleton";

const CATEGORIES = [
  { id: "ALL", label: "All Items", icon: ShoppingBag },
  { id: "THEME", label: "Themes", icon: Palette },
  { id: "FONT", label: "Fonts", icon: Type },
  { id: "EFFECT", label: "Effects", icon: Sparkles },
  { id: "VICTORY", label: "Victory", icon: PartyPopper },
];

const Store = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await storeAPI.getItems();
        setItems(response.data);
      } catch (error) {
        console.error("Failed to fetch store items", error);
        toast.error("Failed to load store items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleBuy = async (item) => {
    if (!user || user.profile.xp < item.cost) return;

    setPurchasing(item.id);
    try {
      const response = await storeAPI.buyItem(item.id);
      toast.success(response.data.message);
      await checkAuth();
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_owned: true } : i)),
      );
    } catch (error) {
      toast.error(error.response?.data?.error || "Purchase failed.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (item) => {
    try {
      const res = await storeAPI.equipItem(item.id);
      toast.success(res.data.message);
      await checkAuth();
    } catch {
      toast.error("Failed to equip");
    }
  };

  const handleUnequip = async (item) => {
    try {
      const res = await storeAPI.unequipItem(item.category);
      toast.success(res.data.message);
      await checkAuth();
    } catch {
      toast.error("Failed to unequip");
    }
  };

  const isItemActive = (item) => {
    if (!user?.profile) return false;
    if (item.category === "THEME")
      return user.profile.active_theme === item.item_data?.theme_key;
    if (item.category === "FONT")
      return user.profile.active_font === item.item_data?.font_family;
    if (item.category === "EFFECT")
      return user.profile.active_effect === item.item_data?.effect_key;
    if (item.category === "VICTORY")
      return user.profile.active_victory === item.item_data?.victory_key;
    return false;
  };

  const renderIcon = (iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.Package;
    return <Icon className="w-12 h-12" />;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "THEME":
        return "from-purple-500/20 to-purple-600/10 border-purple-500/30";
      case "FONT":
        return "from-blue-500/20 to-blue-600/10 border-blue-500/30";
      case "EFFECT":
        return "from-amber-500/20 to-amber-600/10 border-amber-500/30";
      case "VICTORY":
        return "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30";
      default:
        return "from-gray-500/20 to-gray-600/10 border-gray-500/30";
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case "THEME":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "FONT":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "EFFECT":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "VICTORY":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const filteredItems =
    activeCategory === "ALL"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <StoreSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-[#09090b] text-gray-100"
        >
          {/* Premium Header */}
          <div className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              {/* Top Bar */}
              <div className="h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <ArrowLeft size={20} />
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <ShoppingBag size={20} className="text-black" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-white">
                        Premium Store
                      </h1>
                      <p className="text-xs text-gray-500">
                        Customize your experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* XP Balance */}
                <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500/10 to-amber-600/5 rounded-full border border-amber-500/20">
                  <Crown size={16} className="text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">
                    {user?.profile?.xp?.toLocaleString() || 0}
                  </span>
                  <span className="text-xs text-amber-400/60">XP</span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 pb-4 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                                                ${
                                                  isActive
                                                    ? "bg-white text-black shadow-lg shadow-white/10"
                                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                                                }
                                            `}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6">
            {filteredItems.length === 0 ? (
              /* Empty State */
              <div className="h-80 flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center">
                  <Package size={32} className="opacity-30" />
                </div>
                <p className="text-sm">No items found in this category.</p>
              </div>
            ) : (
              /* Items Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const isActive = isItemActive(item);
                    const canAfford = user?.profile?.xp >= item.cost;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="group"
                      >
                        <div
                          className={`
                                                    relative rounded-2xl overflow-hidden
                                                    bg-linear-to-b ${getCategoryColor(item.category)}
                                                    border transition-all duration-300
                                                    hover:border-white/20 hover:shadow-xl hover:shadow-black/20
                                                    ${isActive ? "ring-2 ring-amber-500/50" : ""}
                                                `}
                        >
                          {/* Preview Area */}
                          <div className="relative h-44 bg-linear-to-b from-black/20 to-black/40 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="text-white/20 group-hover:text-white/40 transition-colors duration-300">
                                {renderIcon(item.icon_name)}
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                              <span
                                className={`
                                                                text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full
                                                                border backdrop-blur-sm ${getCategoryBadgeColor(item.category)}
                                                            `}
                              >
                                {item.category}
                              </span>
                            </div>

                            {/* Owned/Active Badge */}
                            {item.is_owned && (
                              <div className="absolute top-3 right-3">
                                <div
                                  className={`
                                                                    flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold
                                                                    backdrop-blur-sm border
                                                                    ${
                                                                      isActive
                                                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                                                        : "bg-white/10 text-white/80 border-white/20"
                                                                    }
                                                                `}
                                >
                                  <Check size={10} />
                                  {isActive ? "Active" : "Owned"}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            <h3 className="text-base font-semibold text-white mb-1 truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 line-clamp-2 mb-4 min-h-[32px]">
                              {item.description}
                            </p>

                            {/* Action Button */}
                            {item.is_owned ? (
                              <Button
                                className={`
                                                                    w-full h-11 text-sm font-semibold rounded-xl transition-all
                                                                    ${
                                                                      isActive
                                                                        ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                                                                        : "bg-linear-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                                                                    }
                                                                `}
                                onClick={() =>
                                  isActive
                                    ? handleUnequip(item)
                                    : handleEquip(item)
                                }
                              >
                                {isActive ? "Unequip" : "Equip Now"}
                              </Button>
                            ) : (
                              <Button
                                className={`
                                                                    w-full h-11 text-sm font-semibold rounded-xl transition-all
                                                                    ${
                                                                      canAfford
                                                                        ? "bg-linear-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                                                                        : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                                                                    }
                                                                `}
                                disabled={!canAfford || purchasing === item.id}
                                onClick={() => handleBuy(item)}
                              >
                                {purchasing === item.id ? (
                                  <Loader2 className="animate-spin w-4 h-4" />
                                ) : canAfford ? (
                                  <span className="flex items-center gap-2">
                                    <Crown size={14} />
                                    Buy for {item.cost.toLocaleString()} XP
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    <Lock size={14} />
                                    {item.cost.toLocaleString()} XP Required
                                  </span>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Store;
