import React, { useEffect, useMemo, useState } from "react";
import useAuthStore from "../stores/useAuthStore";
import { toast } from "sonner";

const Login = () => {
  const {
    loading,
    isOAuthLoading,
    isOtpLoading,
    error,
    otpCooldownUntil,
    email,
    otp,
    showOtpInput,
    setEmail,
    setOtp,
    setShowOtpInput,
    openOAuthPopup,
    requestOtp,
    verifyOtp,
    handleOAuthMessage,
  } = useAuthStore();
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const otpCooldownSeconds = useMemo(
    () => Math.max(0, Math.ceil((otpCooldownUntil - nowMs) / 1000)),
    [otpCooldownUntil, nowMs],
  );

  useEffect(() => {
    const handleMessage = (event) => handleOAuthMessage(event);
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleOAuthMessage]);

  // Note: Redirection is handled by the PublicOnlyRoute wrapper in App.jsx
  // when isAuthenticated becomes true.

  const handleOAuthClick = async (provider) => {
    await openOAuthPopup(provider);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error("Email Required", {
        description: "Please enter your email address to continue.",
      });
    }

    const success = await requestOtp(email);
    if (success) {
      setShowOtpInput(true);
      toast.success("OTP Sent", {
        description: "Please check your inbox for the verification code.",
      });
    } else {
      toast.error("Failed to send OTP", {
        description: error || "Please check your connection and try again.",
      });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      return toast.error("OTP Required", {
        description: "Please enter the 6-digit code sent to your email.",
      });
    }

    const success = await verifyOtp(email, otp);
    if (success) {
      toast.success("Welcome Back!", {
        description: "You have been successfully logged in.",
      });
      // Navigation handled by router based on auth state
    } else {
      toast.error("Invalid OTP", {
        description: error || "The code you entered is incorrect. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-[#ffa116]/30 selection:text-black flex items-center justify-center relative overflow-hidden px-4 py-10 bg-[#1a1a1a]">
      <div className="relative z-10 w-full max-w-[440px] p-6 sm:p-8 app-surface rounded-[2rem] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">Sign In</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1f1f1f] p-4 rounded-2xl border border-[#3a3a3a] mb-6 shadow-sm">
            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3 bg-[#262626] border border-[#3a3a3a] rounded-xl text-white text-sm focus:outline-none focus:border-[#ffa116] focus:ring-2 focus:ring-[#ffa116]/20 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isOtpLoading || otpCooldownSeconds > 0}
                  className="w-full h-11 bg-[#ffa116] text-black font-bold text-sm rounded-xl hover:bg-[#ff8f00] transition-colors disabled:opacity-50"
                >
                  {isOtpLoading
                    ? "Sending..."
                    : otpCooldownSeconds > 0
                      ? `Retry in ${otpCooldownSeconds}s`
                      : "Send Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="text-xs text-[#ffa116] hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full h-11 px-3 bg-[#262626] border border-[#3a3a3a] rounded-xl text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#ffa116] focus:ring-2 focus:ring-[#ffa116]/20 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-full h-11 bg-[#ffa116] text-black font-semibold text-sm rounded-xl hover:bg-[#ff8f00] transition-colors disabled:opacity-50"
                >
                  {isOtpLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            )}
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="absolute inset-x-0 h-px bg-[#3a3a3a]"></div>
            <span className="relative z-10 bg-[#262626] px-3 text-xs text-gray-400">
              Continue with
            </span>
          </div>

          <button
            onClick={() => handleOAuthClick("github")}
            disabled={loading || isOAuthLoading}
            className="w-full h-12 flex items-center justify-center bg-[#1f1f1f] text-white rounded-2xl font-semibold border border-[#3a3a3a] hover:border-[#ffa116] active:scale-[0.98] transition-all"
          >
            {isOAuthLoading ? "Opening..." : "GitHub"}
          </button>

          <button
            onClick={() => handleOAuthClick("google")}
            disabled={loading || isOAuthLoading}
            className="w-full h-12 flex items-center justify-center bg-[#1f1f1f] border border-[#3a3a3a] hover:border-[#ffa116] text-white rounded-2xl font-medium active:scale-[0.98] transition-all"
          >
            {isOAuthLoading ? "Opening..." : "Google"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
