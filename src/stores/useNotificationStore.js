import { create } from "zustand";
import { notificationsAPI } from "../services/api";

/**
 * Centralized notification management.
 * Shared between NotificationDrawer and NotificationDropdown
 * for consistent state and unread count.
 */
const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // Cache duration (2 minutes for real-time feel)
  CACHE_DURATION: 2 * 60 * 1000,

  /**
   * Fetch all notifications with caching.
   */
  fetchNotifications: async (force = false) => {
    const state = get();
    const now = Date.now();

    // Use cache if valid
    if (
      !force &&
      state.lastFetched &&
      now - state.lastFetched < state.CACHE_DURATION &&
      state.notifications.length > 0
    ) {
      return state.notifications;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await notificationsAPI.getNotifications();
      const notifications = response.data;

      // Calculate unread count
      const unreadCount = notifications.filter((n) => !n.is_read).length;

      set({
        notifications,
        unreadCount,
        isLoading: false,
        lastFetched: now,
        error: null,
      });

      return notifications;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      set({
        isLoading: false,
        error: error.response?.data?.error || "Failed to load notifications",
      });
      return [];
    }
  },

  /**
   * Mark a notification as read.
   */
  markAsRead: async (notificationId) => {
    try {
      await notificationsAPI.markRead(notificationId);

      // Update local state
      set((state) => {
        const updatedNotifications = state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        const unreadCount = updatedNotifications.filter((n) => !n.is_read).length;

        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mark all notifications as read.
   */
  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllRead();

      // Update local state
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));

      return { success: true };
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear all notifications.
   */
  clearAll: async () => {
    try {
      await notificationsAPI.clearAll();

      set({
        notifications: [],
        unreadCount: 0,
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add a new notification (for real-time updates).
   */
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),

  /**
   * Clear cache and reset state.
   */
  clearCache: () => {
    set({
      notifications: [],
      unreadCount: 0,
      lastFetched: null,
      error: null,
    });
  },
}));

export default useNotificationStore;
