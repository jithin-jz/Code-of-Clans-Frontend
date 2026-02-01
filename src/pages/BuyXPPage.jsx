import React, { useState } from "react";
import { paymentAPI } from "../services/api";
import { loadRazorpay } from "../utils/loadRazorpay";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import { toast } from "sonner";
import { Loader2, Zap, ArrowLeft, Shield, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BuyXPSkeleton from "./BuyXPSkeleton";

const XP_PACKAGES = [
  {
    amount: 99,
    xp: 100,
    label: "Starter Pack",
    description: "Begin your journey",
    features: ["100 XP Added", "Instant Boost"],
  },
  {
    amount: 249,
    xp: 250,
    label: "Booster Pack",
    description: "Great value for leveling",
    features: ["250 XP Added", "Crucial Progress"],
  },
  {
    amount: 499,
    xp: 500,
    label: "Pro Pack",
    description: "Serious commitment",
    features: ["500 XP Added", "Major Leap"],
  },
  {
    amount: 999,
    xp: 1000,
    label: "Ultimate Pack",
    description: "Dominate the leaderboard",
    features: ["1,000 XP Added", "Maximum Power"],
  },
];

const BuyXPPage = () => {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate brief loading for static content to show skeleton
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  const { user } = useAuthStore();
  const { fetchCurrentUser } = useUserStore();

  const handleBuy = async (pkg) => {
    setLoading(true);

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }

    try {
      const { data: orderData } = await paymentAPI.createOrder(pkg.amount);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: "INR",
        name: "Code of Clans",
        description: `Purchase ${pkg.xp} XP`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(`Successfully purchased ${pkg.xp} XP!`);
            if (fetchCurrentUser) await fetchCurrentUser(); // Refresh User XP
            // Optional: navigate back after success or stay
          } catch (verifyError) {
            console.error(verifyError);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: {
          color: "#FFD700",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        toast.error(response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
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
          transition={{ duration: 0.5 }}
          className="h-screen w-full"
        >
          <BuyXPSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans"
        >
          {/* Subtle Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-20 pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto pt-16">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link
                  to="/"
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                >
                  <ArrowLeft
                    className="group-hover:-translate-x-1 transition-transform text-gray-400 group-hover:text-white"
                    size={20}
                  />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                    XP Store
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">
                    Accelerate your progress
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {XP_PACKAGES.map((pkg, idx) => (
                <div
                  key={idx}
                  className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-xl p-6 relative overflow-hidden transition-all hover:translate-y-[-2px] group flex flex-col h-full"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/5 rounded-lg text-white group-hover:text-[#FFD700] transition-colors">
                          <Zap
                            size={20}
                            fill="currentColor"
                            className="opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        {idx === 3 && (
                          <span className="bg-[#FFD700]/10 text-[#FFD700] text-[10px] uppercase font-bold px-2 py-1 rounded tracking-wider border border-[#FFD700]/20">
                            Best Value
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {pkg.label}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tighter text-white">
                          {pkg.xp.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          XP
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 w-full mb-6"></div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {pkg.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors"
                        >
                          <Check
                            size={14}
                            className="text-[#FFD700] mt-0.5 shrink-0"
                          />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleBuy(pkg)}
                      disabled={loading}
                      className="w-full py-3 rounded-lg font-medium text-sm bg-white text-black hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <span>Purchase for ₹{pkg.amount}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BuyXPPage;
