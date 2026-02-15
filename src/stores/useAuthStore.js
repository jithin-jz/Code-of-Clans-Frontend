import { create } from "zustand";
import { authAPI } from "../services/api";
import useChallengesStore from "./useChallengesStore";
import { notify } from "../services/notification";

// Helper function to open OAuth in a popup window
const openOAuthPopup = (url, name = "OAuth Login") => {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
  );
};

// Helper to generate random state
const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  loading: true,
  isInitialized: false, // Tracks if initial auth check is complete
  error: null,
  oauthPopup: null,
  email: "",
  otp: "",
  showOtpInput: false,
  isOtpLoading: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setEmail: (email) => set({ email }),
  setOtp: (otp) => set({ otp }),
  setShowOtpInput: (showOtpInput) => set({ showOtpInput }),

  clearError: () => set({ error: null }),

  // Set User (Used by useUserStore to update profile data)
  setUser: (user) => set({ user }),

  checkAuth: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isInitialized: true,
      });
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      set({
        user: response.data,
        isAuthenticated: true,
        loading: false,
        error: null,
        isInitialized: true,
      });
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isInitialized: true,
      });
    }
  },

  // Open OAuth in popup
  openOAuthPopup: async (provider) => {
    set({ loading: true, error: null });

    try {
      const state = generateState();
      localStorage.setItem('oauth_state', state);

      let response;
      let popupName;

      switch (provider) {
        case "github":
          response = await authAPI.getGithubAuthUrl(state);
          popupName = "GitHub Login";
          break;
        case "google":
          response = await authAPI.getGoogleAuthUrl(state);
          popupName = "Google Login";
          break;
        case "discord":
          response = await authAPI.getDiscordAuthUrl(state);
          popupName = "Discord Login";
          break;
        default:
          throw new Error("Unknown provider");
      }

      const popup = openOAuthPopup(response.data.url, popupName);
      set({ oauthPopup: popup, loading: false });

      return popup;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.error || `Failed to get ${provider} auth URL`,
      });
      return null;
    }
  },

  handleOAuthCallback: async (provider, code, returnedState) => {
    set({ loading: true, error: null });

    // Verify State
    const savedState = localStorage.getItem('oauth_state');
    localStorage.removeItem('oauth_state'); // Clear immediately after use

    if (!savedState || savedState !== returnedState) {
         set({
            loading: false,
            error: "Security Error: State mismatch (CSFR protection). Please try again.",
         });
         return false;
    }

    try {
      let response;
      switch (provider) {
        case "github":
          response = await authAPI.githubCallback(code);
          break;
        case "google":
          response = await authAPI.googleCallback(code);
          break;
        case "discord":
          response = await authAPI.discordCallback(code);
          break;
        default:
          throw new Error("Unknown provider");
      }

      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      set({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.error || "OAuth callback failed",
      });
      return false;
    }
  },

  handleOAuthMessage: async (event) => {
    const { checkAuth } = useAuthStore.getState();
    
    // Relaxed origin check for development to handle port changes (5173 vs 5174 etc)
    if (event.origin !== window.location.origin) {
      console.warn(
        "Login: Received message from different origin:",
        event.origin,
        "Expected:",
        window.location.origin,
      );
      // In production, you might want to force strict equality or a whitelist
      const authorizedOrigin = new URL(import.meta.env.VITE_API_URL).origin;
      if (
        !event.origin.startsWith(authorizedOrigin) &&
        !event.origin.startsWith("https://souled.jithin.site")
      ) {
        return;
      }
    }

    const { type, provider, error } = event.data;
    if (type === "oauth-success") {
      await checkAuth();
    } else if (type === "oauth-error") {
      console.error(`OAuth error from ${provider}:`, error);
      if (error === "User account is disabled.") {
        notify.error("Your account has been blocked by an administrator.", {
          duration: 5000,
        });
      } else {
        notify.error(`Login failed: ${error}`);
      }
    }
  },

  requestOtp: async (email) => {
    set({ isOtpLoading: true, error: null });
    try {
      await authAPI.requestOtp(email);
      set({ isOtpLoading: false });
      return true;
    } catch (error) {
      set({ 
        isOtpLoading: false, 
        error: error.response?.data?.error || "Failed to send OTP" 
      });
      return false;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isOtpLoading: true, error: null });
    try {
      const response = await authAPI.verifyOtp(email, otp);
      const { access_token, refresh_token, user } = response.data;
      
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      set({
        user,
        isAuthenticated: true,
        isOtpLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({ 
        isOtpLoading: false, 
        error: error.response?.data?.error || "Invalid OTP" 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue with logout even if API fails
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    
    // Clear caches
    useChallengesStore.getState().clearCache();
    const useNotificationStore = (await import("./useNotificationStore")).default;
    useNotificationStore.getState().clearCache();

    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      email: "",
      otp: "",
      showOtpInput: false,
    });
  },

  deleteAccount: async () => {
    try {
      await authAPI.deleteAccount();
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Clear challenges cache
      useChallengesStore.getState().clearCache();

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        email: "",
        otp: "",
        showOtpInput: false,
      });

      return true;
    } catch (error) {
      console.error("Delete account failed:", error);
      throw error;
    }
  },

}));

export default useAuthStore;
