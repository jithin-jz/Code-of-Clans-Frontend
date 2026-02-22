import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Check,
  Sparkles,
  Type,
  Palette,
  Package,
  PartyPopper,
  Gem,
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
import useMarketplaceStore from "../stores/useMarketplaceStore";
import { toast } from "sonner";
import { motion as Motion, AnimatePresence } from "framer-motion";
import MarketplacePageSkeleton from "./MarketplacePageSkeleton";

const CATEGORIES = [
  { id: "THEME", label: "Themes", icon: Palette },
  { id: "FONT", label: "Fonts", icon: Type },
  { id: "EFFECT", label: "Effects", icon: Sparkles },
  { id: "VICTORY", label: "Victory", icon: PartyPopper },
];

const MarketplacePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
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
  } = useMarketplaceStore();
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
      const remainingXp = result.data?.remaining_xp;
      const latestUser = useAuthStore.getState().user;
      if (latestUser?.profile && typeof remainingXp === "number") {
        setUser({
          ...latestUser,
          profile: {
            ...latestUser.profile,
            xp: remainingXp,
          },
        });
      }
      toast.success(result.data.message || "Purchase successful.");
    } else {
      toast.error(result.error || "Purchase failed.");
    }
  };

  const handleEquip = async (item) => {
    const result = await equipItem(item.id);
    if (result.success) {
      const data = result.data || {};
      const latestUser = useAuthStore.getState().user;
      if (latestUser?.profile) {
        setUser({
          ...latestUser,
          profile: {
            ...latestUser.profile,
            ...(data.active_theme ? { active_theme: data.active_theme } : {}),
            ...(data.active_font ? { active_font: data.active_font } : {}),
            ...(data.active_effect ? { active_effect: data.active_effect } : {}),
            ...(data.active_victory ? { active_victory: data.active_victory } : {}),
          },
        });
      }
      toast.success(result.data.message || "Equipped successfully.");
    } else {
      toast.error(result.error || "Failed to equip.");
    }
  };

  const handleUnequip = async (item) => {
    const result = await unequipCategory(item.category);
    if (result.success) {
      const latestUser = useAuthStore.getState().user;
      if (latestUser?.profile) {
        setUser({
          ...latestUser,
          profile: {
            ...latestUser.profile,
            ...(item.category === "THEME" ? { active_theme: "vs-dark" } : {}),
            ...(item.category === "FONT" ? { active_font: "Fira Code" } : {}),
            ...(item.category === "EFFECT" ? { active_effect: null } : {}),
            ...(item.category === "VICTORY" ? { active_victory: "default" } : {}),
          },
        });
      }
      toast.success(result.data.message || "Unequipped successfully.");
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
        <Motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <MarketplacePageSkeleton />
        </Motion.div>
      ) : (
        <Motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full pb-20 sm:pb-0 text-white flex flex-col pt-0 mt-0"
        >

          {/* Controls & Category Tabs (Unified Row) */}
          <div className="sticky top-14 z-20 border-b border-white/5 bg-[#0a0f18]/85 backdrop-blur-xl">
            <div className="w-full px-4 sm:px-6 lg:px-8 min-w-0">
              <div className="flex items-center gap-2 sm:gap-4 py-2 sm:py-3">
                {/* Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 shrink-0 -ml-1.5"
                >
                  <ArrowLeft size={18} />
                </Button>

                <div className="w-px h-5 bg-white/10 shrink-0 hidden sm:block" />

                {/* Scrollable Tabs */}
                <div className="flex items-center gap-1 sm:gap-2 flex-1 overflow-x-auto no-scrollbar">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        title={cat.label}
                        className={`
                        flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border flex-1 sm:flex-none sm:whitespace-nowrap
                        ${isActive
                            ? "bg-white/[0.14] text-white border-white/25"
                            : "text-slate-400 border-transparent hover:text-white hover:bg-white/10 hover:border-white/15"
                          }
                      `}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Get XP Button (Optional mobile hide, clear call to action) */}
                <div className="shrink-0 ml-1">
                  <button
                    onClick={() => navigate("/buy-xp")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#162338] rounded-full border border-[#7ea3d9]/20 hover:bg-[#1b2a40] transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-300">Get XP</span>
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Items Grid */}
          <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 min-w-0">
            {filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Package size={32} className="opacity-30" />
                <p className="text-sm">No items in this category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const isActive = isItemActive(item);
                    const canAfford = user?.profile?.xp >= item.cost;
                    const isOwned = item.is_owned;

                    return (
                      <Motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`
                            rounded-xl overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 group flex flex-col h-full
                            ${isActive
                              ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02] border border-emerald-500/30 border-t-emerald-400/50 shadow-[0_8px_32px_rgba(16,185,129,0.08)]"
                              : "bg-[#0f1b2e]/70 border border-[#7ea3d9]/20 hover:border-[#7ea3d9]/50 hover:bg-[#162338]/80 hover:-translate-y-1 hover:shadow-[0_12px_40px_-15px_rgba(126,163,217,0.2)]"
                            }
                          `}
                        >
                          {/* Icon/Preview - Glass Area */}
                          <div className={`h-32 flex items-center justify-center border-b transition-colors relative shrink-0 ${isActive ? "bg-emerald-500/[0.05] border-emerald-500/20" : "bg-[#162338]/80 border-[#7ea3d9]/20 group-hover:bg-[#1a2940]"}`}>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover mix-blend-overlay"
                              />
                            ) : (
                              <div className={`${isActive ? "text-emerald-400" : "text-[#d3deee]"}`}>
                                {renderIcon(item.icon_name)}
                              </div>
                            )}

                            {/* Status Badges */}
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              {isOwned && (
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-[#162338]/80 text-[#d3deee] border-[#7ea3d9]/20"}`}
                                >
                                  {isActive && <Check size={10} className="mr-1" />}
                                  {isActive ? "Active" : "Owned"}
                                </Badge>
                              )}
                            </div>

                            {/* Category Badge */}
                            <Badge
                              variant="outline"
                              className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded border ${isActive ? "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20" : "bg-black/20 text-[#a3b8d9] border-[#7ea3d9]/10"}`}
                            >
                              {item.category}
                            </Badge>
                          </div>

                          {/* Content - Compact Padding */}
                          <div className="flex flex-col flex-1 p-3.5 pb-2.5">
                            <h3 className={`text-sm tracking-tight truncate ${isActive ? "text-emerald-400 font-bold" : "text-slate-100 font-semibold"}`}>
                              {item.name}
                            </h3>
                            <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isActive ? "text-emerald-400/70" : "text-[#7ea3d9]/70"}`}>
                              {item.description}
                            </p>
                          </div>

                          <div className="p-3.5 pt-0 mt-auto">
                            {isOwned ? (
                              <Button
                                className={`
                                  w-full h-9 text-xs font-semibold tracking-wide transition-all
                                  ${isActive
                                    ? "bg-transparent border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                    : "bg-[#162338] border border-[#7ea3d9]/20 text-slate-200 hover:bg-[#1a2940] hover:text-white"
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
                                  w-full h-9 text-xs font-semibold tracking-wide transition-all border
                                  ${canAfford
                                    ? "bg-[#0ea5e9]/90 border-[#0ea5e9]/50 text-white hover:bg-[#0284c7] hover:border-[#0284c7] shadow-[0_4px_12px_rgba(14,165,233,0.3)] hover:shadow-[0_4px_16px_rgba(14,165,233,0.4)]"
                                    : "bg-[#0a0f18]/80 text-[#7ea3d9]/40 border-[#7ea3d9]/10 cursor-not-allowed"
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
                                  <span className="text-[10px] font-semibold">
                                    Processing...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    {canAfford ? (
                                      <Gem size={12} className="text-white/80" />
                                    ) : (
                                      <Lock size={12} className="opacity-50" />
                                    )}
                                    {item.cost}
                                  </span>
                                )}
                              </Button>
                            )}
                          </div>
                        </Card>
                      </Motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </main>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default MarketplacePage;
