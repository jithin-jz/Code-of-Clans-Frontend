import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import { loadRazorpay } from "../utils/loadRazorpay";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import { toast } from "sonner";
import {
  Loader2,
  Zap,
  ArrowLeft,
  Check,
  Sparkles,
  Crown,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import BuyXPSkeleton from "./BuyXPSkeleton";

const XP_PACKAGES = [
  { amount: 49, xp: 50, label: "Mini", icon: Zap },
  { amount: 99, xp: 100, label: "Starter", icon: Zap },
  { amount: 199, xp: 200, label: "Growth", icon: Sparkles },
  { amount: 249, xp: 250, label: "Booster", icon: Sparkles },
  { amount: 499, xp: 500, label: "Pro", icon: Flame, popular: true },
  { amount: 749, xp: 800, label: "Elite", icon: Crown },
  { amount: 999, xp: 1000, label: "Ultimate", icon: Crown, bestValue: true },
  { amount: 1999, xp: 2500, label: "Champion", icon: Crown },
];

const BuyXPPage = () => {
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchCurrentUser } = useUserStore();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBuy = async (pkg) => {
    setPurchasing(pkg.amount);

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load");
      setPurchasing(null);
      return;
    }

    try {
      const { data: orderData } = await paymentAPI.createOrder(pkg.amount);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Clash of Code",
        description: `Purchase ${pkg.xp} XP`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`+${pkg.xp} XP added!`);
            if (fetchCurrentUser) await fetchCurrentUser();
          } catch (verifyError) {
            console.error(verifyError);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: { color: "#18181b" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", (response) => {
        toast.error(response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      const backendError =
        error?.response?.data?.error ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : null);
      const serializerError =
        error?.response?.data?.amount?.[0] || error?.response?.data?.detail;
      toast.error(backendError || serializerError || "Failed to initiate payment");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <BuyXPSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-screen bg-[#1a1a1a] text-white flex flex-col overflow-hidden"
        >
          {/* Header */}
          <header className="bg-[#262626] border-b border-white/5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5"
                  >
                    <ArrowLeft size={18} />
                  </Button>
                  <h1 className="text-base font-semibold tracking-tight">
                    Buy XP
                  </h1>
                </div>

                {/* Current Balance */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-white/5">
                  <Zap size={14} className="text-[#ffa116]" />
                  <span className="text-sm font-medium text-white">
                    {user?.profile?.xp?.toLocaleString() || 0}
                  </span>
                  <span className="text-xs text-zinc-500">XP</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden px-4 sm:px-6 py-6">
            <div className="max-w-6xl mx-auto h-full">
              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 h-full content-start">
                {XP_PACKAGES.map((pkg) => {
                  const Icon = pkg.icon;
                  const isPurchasing = purchasing === pkg.amount;

                  return (
                    <Card
                      key={pkg.amount}
                      className={`
                        bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all relative
                        ${pkg.popular ? "ring-1 ring-[#ffa116]/30" : ""}
                        ${pkg.bestValue ? "ring-1 ring-[#00af9b]/30" : ""}
                      `}
                    >
                      {/* Badge */}
                      {(pkg.popular || pkg.bestValue) && (
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={`text-[9px] px-1.5 py-0 ${
                              pkg.popular
                                ? "bg-[#ffa116]/10 text-[#ffa116] border-[#ffa116]/20"
                                : "bg-[#00af9b]/10 text-[#00af9b] border-[#00af9b]/20"
                            }`}
                          >
                            {pkg.popular ? "Popular" : "Best Value"}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="p-5 pb-3">
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                            pkg.popular
                              ? "bg-[#ffa116]/10"
                              : pkg.bestValue
                                ? "bg-[#00af9b]/10"
                                : "bg-white/5"
                          }`}
                        >
                          <Icon
                            size={20}
                            className={
                              pkg.popular
                                ? "text-[#ffa116]"
                                : pkg.bestValue
                                  ? "text-[#00af9b]"
                                  : "text-zinc-400"
                            }
                          />
                        </div>

                        <CardTitle className="text-base font-medium text-white">
                          {pkg.label}
                        </CardTitle>

                        {/* XP Amount */}
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold text-white">
                            {pkg.xp.toLocaleString()}
                          </span>
                          <span className="text-sm text-zinc-500 font-medium">
                            XP
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-2">
                        {/* Bonus indicator */}
                        {pkg.xp > pkg.amount && (
                          <div className="flex items-center gap-1 mb-4">
                            <Check size={12} className="text-[#00af9b]" />
                            <span className="text-xs text-[#00af9b]">
                              +{Math.round((pkg.xp / pkg.amount - 1) * 100)}%
                              bonus
                            </span>
                          </div>
                        )}

                        <Button
                          onClick={() => handleBuy(pkg)}
                          disabled={isPurchasing}
                          className={`
                            w-full h-10 text-sm font-medium
                            ${
                              pkg.popular
                                ? "bg-[#ffa116] hover:bg-[#cc8400] text-black"
                                : pkg.bestValue
                                  ? "bg-[#00af9b] hover:bg-emerald-600 text-black"
                                  : "bg-white text-black hover:bg-zinc-200"
                            }
                          `}
                        >
                          {isPurchasing ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <span>₹{pkg.amount}</span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BuyXPPage;
