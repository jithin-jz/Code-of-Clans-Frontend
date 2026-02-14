import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { toast } from "sonner";
import { Sword, Shield, Crown, Sparkles } from "lucide-react";

// SVG Icons for providers
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const Login = () => {
  const {
    loading,
    isOtpLoading,
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
        action: {
          label: "Resend",
          onClick: () => handleSendOtp(e),
        },
      });
    } else {
      toast.error("Failed to send OTP", {
        description: "Please check your connection and try again.",
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
        description: "The code you entered is incorrect. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-[#FFD700] selection:text-black flex items-center justify-center relative overflow-hidden">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-20 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[400px] p-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl mb-6 group relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-[#FFD700]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Crown size={28} className="text-[#FFD700]" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-4">
            CLASH OF{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FFD700] to-[#FFA500]">
              CODE
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Sign in to start your journey</p>
        </div>

        {/* Login Card */}
        <div className="space-y-4">
          {/* Email OTP Section */}
          <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 mb-6">
            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email Login / Sign Up
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#FFD700] transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-full h-10 bg-[#FFD700] text-black font-bold text-sm rounded-lg hover:bg-[#FFA500] transition-colors disabled:opacity-50"
                >
                  {isOtpLoading ? "Sending..." : "Send Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Enter Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowOtpInput(false)}
                    className="text-xs text-[#FFD700] hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full h-10 px-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white text-center text-lg tracking-widest focus:outline-none focus:border-[#FFD700] transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={isOtpLoading}
                  className="w-full h-10 bg-[#FFD700] text-black font-bold text-sm rounded-lg hover:bg-[#FFA500] transition-colors disabled:opacity-50"
                >
                  {isOtpLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>
            )}
          </div>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-px bg-white/10"></div>
            <span className="relative z-10 bg-[#050505] px-2 text-xs text-gray-500 uppercase">
              Or continue with
            </span>
          </div>

          {/* GitHub */}
          <button
            onClick={() => handleOAuthClick("github")}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            <GithubIcon />
            <span>GitHub</span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            {/* Google */}
            <button
              onClick={() => handleOAuthClick("google")}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#1A1A1A] border border-white/10 hover:border-white/20 text-white rounded-xl font-medium hover:bg-[#222] active:scale-[0.98] transition-all"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>

            {/* Discord */}
            <button
              onClick={() => handleOAuthClick("discord")}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 bg-[#1A1A1A] border border-white/10 hover:border-white/20 text-white rounded-xl font-medium hover:bg-[#222] active:scale-[0.98] transition-all"
            >
              <DiscordIcon />
              <span>Discord</span>
            </button>
          </div>
        </div>

        {/* Footer terms */}
        <p className="text-center text-gray-600 text-xs mt-12 font-medium">
          By continuing, you agree to our{" "}
          <Link
            to="#"
            className="text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="#"
            className="text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;
