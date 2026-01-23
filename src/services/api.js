import axios from "axios";
import { notify } from "./notification";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const AI_API_URL = import.meta.env.VITE_AI_URL;

const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const aiAPI = {
  generate: (code, language = "python") =>
    aiApi.post("/explain", { code, language }),
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for blocked user
    if (
      error.response?.data?.error === "User account is disabled." ||
      error.response?.data?.detail === "User account is disabled."
    ) {
      // If in a popup (OAuth), let the caller handle it (to close popup and notify parent)
      if (window.opener) {
        return Promise.reject(error);
      }

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      notify.error("Your account has been blocked by an administrator.", {
        duration: 5000,
      });
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, clear tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

// Auth API functions
export const authAPI = {
  // Get OAuth URLs
  getGithubAuthUrl: (state) => api.get("/auth/github/", { params: { state } }),
  getGoogleAuthUrl: (state) => api.get("/auth/google/", { params: { state } }),
  getDiscordAuthUrl: (state) =>
    api.get("/auth/discord/", { params: { state } }),

  // Handle OAuth callbacks
  githubCallback: (code) => api.post("/auth/github/callback/", { code }),
  googleCallback: (code) => api.post("/auth/google/callback/", { code }),
  discordCallback: (code) => api.post("/auth/discord/callback/", { code }),

  // Email OTP endpoints
  requestOtp: (email) => api.post("/auth/otp/request/", { email }),
  verifyOtp: (email, otp) => api.post("/auth/otp/verify/", { email, otp }),

  // User endpoints
  getCurrentUser: () => api.get("/profiles/user/"),
  getUserProfile: (username) => api.get(`/profiles/users/${username}/`),
  logout: () => api.post("/auth/logout/"),
  refreshToken: (refresh_token) =>
    api.post("/auth/refresh/", { refresh_token }),
  updateProfile: (data) => {
    const config = {};
    if (data instanceof FormData) {
      // Setting Content-Type to undefined allows the browser to set the boundary automatically
      config.headers = { "Content-Type": undefined };
    }
    return api.patch("/profiles/user/update/", data, config);
  },
  followUser: (username) => api.post(`/profiles/users/${username}/follow/`),
  getFollowers: (username) => api.get(`/profiles/users/${username}/followers/`),
  getFollowing: (username) => api.get(`/profiles/users/${username}/following/`),
  redeemReferral: (code) =>
    api.post("/profiles/user/redeem-referral/", { code }),
  deleteAccount: () => api.delete("/auth/user/delete/"),

  // Admin endpoints
  getUsers: () => api.get("/profiles/admin/users/"),
  toggleBlockUser: (username) =>
    api.post(`/profiles/admin/users/${username}/toggle-block/`),
};

// Payment endpoints
export const paymentAPI = {
  createOrder: (amount) => api.post("/payments/create-order/", { amount }),
  verifyPayment: (data) => api.post("/payments/verify-payment/", data),
};

export const storeAPI = {
  getItems: () => api.get("/store/items/"),
  buyItem: (id) => api.post(`/store/buy/${id}/`),
  equipItem: (id) => api.post("/store/equip/", { item_id: id }),
  unequipItem: (category) => api.post("/store/unequip/", { category }),
};

export default api;
