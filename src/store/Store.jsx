import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Check,
  Sparkles,
  Type,
  Palette,
  Package,
  PartyPopper,
  Zap,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import useAuthStore from "../stores/useAuthStore";
import useStoreStore from "../stores/useStoreStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import StoreSkeleton from "./StoreSkeleton";

const CATEGORIES = [
  { id: "THEME", label: "Themes", icon: Palette },
  { id: "FONT", label: "Fonts", icon: Type },
  { id: "EFFECT", label: "Effects", icon: Sparkles },
  { id: "VICTORY", label: "Victory", icon: PartyPopper },
];

const Store = () => {
  const navigate = useNavigate();
  const { user, checkAuth, setUser } = useAuthStore();
  const {
    items,
    isLoading,
    isMutating,
    activeMutationItemId,
    error,
    fetchItems,
    purchaseItem,
    equipItem,
    unequipCategory,
  } = useStoreStore();
  const [activeCategory, setActiveCategory] = useState("THEME");

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleBuy = async (item) => {
    if (!user || user.profile.xp < item.cost) return;

    const result = await purchaseItem(item.id);
    if (result.success) {
      toast.success(result.data.message || "Purchase successful.");
      await checkAuth();
    } else {
      toast.error(result.error || "Purchase failed.");
    }
  };

  const handleEquip = async (item) => {
    const result = await equipItem(item.id);
    if (result.success) {
      const data = result.data || {};
      if (user?.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...(data.active_theme ? { active_theme: data.active_theme } : {}),
            ...(data.active_font ? { active_font: data.active_font } : {}),
            ...(data.active_effect ? { active_effect: data.active_effect } : {}),
            ...(data.active_victory ? { active_victory: data.active_victory } : {}),
          },
        });
      }
      toast.success(result.data.message || "Equipped successfully.");
      await checkAuth();
    } else {
      toast.error(result.error || "Failed to equip.");
    }
  };

  const handleUnequip = async (item) => {
    const result = await unequipCategory(item.category);
    if (result.success) {
      if (user?.profile) {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            ...(item.category === "THEME" ? { active_theme: "vs-dark" } : {}),
            ...(item.category === "FONT" ? { active_font: "Fira Code" } : {}),
            ...(item.category === "EFFECT" ? { active_effect: null } : {}),
            ...(item.category === "VICTORY" ? { active_victory: "default" } : {}),
          },
        });
      }
      toast.success(result.data.message || "Unequipped successfully.");
      await checkAuth();
    } else {
      toast.error(result.error || "Failed to unequip.");
    }
  };

  const isItemActive = (item) => {
    if (!user?.profile) return false;
    if (item.category === "THEME")
      return user.profile.active_theme === item.item_data?.theme_key;
    if (item.category === "FONT")
      return user.profile.active_font === item.item_data?.font_family;
    if (item.category === "EFFECT")
      return (
        user.profile.active_effect === item.item_data?.effect_key ||
        user.profile.active_effect === item.item_data?.effect_type
      );
    if (item.category === "VICTORY")
      return (
        user.profile.active_victory === item.item_data?.victory_key ||
        user.profile.active_victory === item.item_data?.animation_type
      );
    return false;
  };

  const renderIcon = (iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.Package;
    return <Icon className="w-8 h-8" />;
  };

  const filteredItems = useMemo(
    () => items.filter((item) => item.category === activeCategory),
    [items, activeCategory],
  );

  return (
    <AnimatePresence mode="wait">
      {isLoading && items.length === 0 ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <StoreSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-[#1a1a1a] text-white overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Minimal Header */}
          <header className="sticky top-0 z-50 bg-[#262626]/95 backdrop-blur-sm border-b border-white/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="h-14 flex items-center justify-between">
                {/* Left: Back + Title */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5"
                  >
                    <ArrowLeft size={18} />
                  </Button>
                  <h1 className="text-base font-semibold tracking-tight">
                    Store
                  </h1>
                </div>

                {/* Right: XP Balance - Clickable */}
                <button
                  onClick={() => navigate("/buy-xp")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-white/5 hover:bg-zinc-700/50 hover:border-white/10 transition-all cursor-pointer"
                >
                  <Zap size={14} className="text-[#ffa116]" />
                  <span className="text-sm font-medium text-white">
                    {user?.profile?.xp?.toLocaleString() || 0}
                  </span>
                  <span className="text-xs text-zinc-500">XP</span>
                </button>
              </div>
            </div>
          </header>

          {/* Category Tabs */}
          <div className="border-b border-white/5 bg-[#262626]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                        ${
                          isActive
                            ? "bg-white text-black"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }
                      `}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <Package size={32} className="opacity-30" />
                <p className="text-sm">No items in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const isActive = isItemActive(item);
                    const canAfford = user?.profile?.xp >= item.cost;
                    const isOwned = item.is_owned;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`
                            bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all
                            ${isActive ? "ring-1 ring-white/20" : ""}
                          `}
                        >
                          {/* Icon/Preview - Reduced Height */}
                          <div className="h-28 flex items-center justify-center bg-zinc-900 border-b border-white/5 relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-zinc-600">
                                {renderIcon(item.icon_name)}
                              </div>
                            )}

                            {/* Status Badges */}
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              {isOwned && (
                                <Badge
                                  variant="secondary"
                                  className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5"
                                >
                                  <Check size={10} className="mr-0.5" />
                                  {isActive ? "Active" : "Owned"}
                                </Badge>
                              )}
                            </div>

                            {/* Category Badge */}
                            <Badge
                              variant="outline"
                              className="absolute top-2 left-2 bg-black/50 border-white/10 text-zinc-400 text-[10px] px-1.5 py-0.5"
                            >
                              {item.category}
                            </Badge>
                          </div>

                          {/* Content - Compact Padding */}
                          <CardHeader className="p-3 pb-1.5">
                            <CardTitle className="text-xs font-medium text-white truncate">
                              {item.name}
                            </CardTitle>
                            <CardDescription className="text-[10px] text-zinc-500 line-clamp-2 min-h-[32px] leading-tight">
                              {item.description}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="p-2.5 pt-0">
                            {isOwned ? (
                              <Button
                                variant={isActive ? "outline" : "default"}
                                className={`
                                  w-full h-7 text-[10px] font-medium
                                  ${
                                    isActive
                                      ? "bg-transparent border-white/10 text-zinc-400 hover:bg-white/5"
                                      : "bg-white text-black hover:bg-zinc-200"
                                  }
                                `}
                                onClick={() =>
                                  isActive
                                    ? handleUnequip(item)
                                    : handleEquip(item)
                                }
                              >
                                {isActive ? "Unequip" : "Equip"}
                              </Button>
                            ) : (
                              <Button
                                className={`
                                  w-full h-7 text-[10px] font-medium
                                  ${
                                    canAfford
                                      ? "bg-white text-black hover:bg-zinc-200"
                                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                  }
                                `}
                                disabled={
                                  !canAfford ||
                                  (isMutating &&
                                    activeMutationItemId === item.id)
                                }
                                onClick={() => handleBuy(item)}
                              >
                                {isMutating &&
                                activeMutationItemId === item.id ? (
                                  <Loader2 className="animate-spin w-3 h-3" />
                                ) : (
                                  <span className="flex items-center gap-1">
                                    {canAfford ? (
                                      <Zap size={10} />
                                    ) : (
                                      <Lock size={10} />
                                    )}
                                    {item.cost} XP
                                  </span>
                                )}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Store;
