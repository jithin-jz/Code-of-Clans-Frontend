import { create } from "zustand";
import { authAPI } from "../services/api";

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

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  loading: true,
  isInitialized: false, // Tracks if initial auth check is complete
  error: null,
  oauthPopup: null,

  // Actions
  setLoading: (loading) => set({ loading }),

  clearError: () => set({ error: null }),

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
      let response;
      let popupName;

      switch (provider) {
        case "github":
          response = await authAPI.getGithubAuthUrl();
          popupName = "GitHub Login";
          break;
        case "google":
          response = await authAPI.getGoogleAuthUrl();
          popupName = "Google Login";
          break;
        case "discord":
          response = await authAPI.getDiscordAuthUrl();
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

  handleOAuthCallback: async (provider, code) => {
    set({ loading: true, error: null });

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

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
      // Continue with logout even if API fails
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  // Profile Management
  updateProfile: async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      const response = await authAPI.updateProfile(formData);
      set({ user: response.data });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set({ error: errorMsg });
      throw error;
    }
  },

  updateProfileImage: async (type, file) => {
    try {
      const formData = new FormData();
      formData.append(type, file);
      
      const response = await authAPI.updateProfile(formData);
      set({ user: response.data });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      set({ error: errorMsg });
      throw error;
    }
  },

  followUser: async (username) => {
    try {
      const response = await authAPI.followUser(username);
      const data = response.data;
      
      // Update local user's following count
      const currentUser = get().user;
      if (currentUser) {
          const change = data.is_following ? 1 : -1;
          const currentCount = currentUser.following_count || 0;
          set({
              user: {
                  ...currentUser,
                  following_count: Math.max(0, currentCount + change)
              }
          });
      }
      
      return data;
    } catch (error) {
      console.error("Follow action failed:", error);
      throw error;
    }
  },

  redeemReferral: async (code) => {
    try {
      const response = await authAPI.redeemReferral(code);
      const data = response.data;

      // Update user state locally
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            profile: {
              ...currentUser.profile,
              xp: data.new_total_xp,
              is_referred: true,
            },
          },
        });
      }

      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      throw new Error(errorMsg);
    }
  },

  deleteAccount: async () => {
    try {
      await authAPI.deleteAccount();
      
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      console.error("Delete account failed:", error);
      throw error;
    }
  },

  setUserXP: (xp) => set((state) => ({
    user: state.user ? {
      ...state.user,
      profile: {
        ...state.user.profile,
        xp
      }
    } : null
  })),
}));

export { useAuthStore };
export default useAuthStore;

