import { create } from "zustand";
import { notificationsAPI } from "../services/api";
import { notify } from "../services/notification";


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
  fcmToken: null,
  permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
  _listenerSetup: false,
  _fetchPromise: null,

  /**
   * Initialize FCM notifications.
   */
  initFCM: async () => {
    if (typeof Notification === 'undefined') {
        console.warn("Notifications are not supported in this browser.");
        return;
    }
    
    if (Notification.permission === "default") {
        // Avoid duplicate toasts if already shown this session
        if (!get()._promptShown) {
          notify.info("Enable Notifications", {
            description: "Stay updated with real-time alerts. Click Allow to enable browser notifications.",
            duration: Infinity, // Stay until interacted with
            action: {
              label: "Allow",
              onClick: () => get().requestPermission()
            },
            cancel: {
              label: "Not Now",
              onClick: () => {}
            }
          });
          set({ _promptShown: true });
        }
    } else if (Notification.permission === "granted") {
        await get().registerFCM();
    } else {
        console.warn("Notification permission is denied. Real-time updates will not work.");
        // Only show once per session to avoid annoyance
        if (!get()._deniedWarned) {
          notify.error("Notifications Blocked", { 
            description: "Browser permissions are currently blocked. Please reset them in your address bar.",
            duration: Infinity,
            action: {
              label: "Allow",
              onClick: () => {
                // If it's still denied, give specific guidance
                if (Notification.permission === 'denied') {
                  notify.warning("Still Blocked", { 
                    description: "You must manually click the 🔒 lock icon in the address bar to unblock notifications first.",
                    duration: 8000
                  });
                } else {
                  set({ _deniedWarned: false });
                  get().initFCM();
                }
              }
            },
            cancel: {
              label: "Not Now",
              onClick: () => {}
            }
          });
          set({ _deniedWarned: true });
        }
    }

    // Listen for foreground messages (only once)
    if (get()._listenerSetup) return;
    set({ _listenerSetup: true });
    try {
        const { onMessageListener } = await import("../services/firebase");
        onMessageListener((payload) => {
            // Show toast notification - try accessing data if notification is missing
            const title = payload.notification?.title || payload.data?.title || "New Notification";
            const body = payload.notification?.body || payload.data?.body || "You have a new message.";

            // Only show if we have some content
            if (payload.notification || payload.data) {
                notify.info(title, {
                    description: body,
                    duration: 5000,
                });
            }

            // Always refetch to update the red dot/count
            get().fetchNotifications(true);
        });


    } catch (error) {

        console.error("Error setting up foreground message listener:", error);
    }
  },

  /**
   * Request notification permission and register token.
   */
  requestPermission: async () => {
    if (typeof Notification === 'undefined') return 'default';
    try {
        const permission = await Notification.requestPermission();
        set({ permission });
        if (permission === 'granted') {
            notify.success("Permission Granted!", { description: "Setting up real-time secure channel..." });
            await get().registerFCM();
        } else if (permission === 'denied') {
            notify.error("Permission Denied", { description: "You've blocked notifications. Please enable them in site settings." });
        }
        return permission;
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        return 'default';
    }
  },

  /**
   * Register FCM token with backend.
   */
  registerFCM: async () => {
    try {
        const { requestForToken } = await import("../services/firebase");
        const token = await requestForToken();
        
        if (!token) {
            console.warn("[FCM] No token received from Firebase. Registration aborted.");
            return;
        }

        // Force sync with backend on every login/re-init to be safe
        const response = await notificationsAPI.registerFCMToken({
            token: token,
            device_id: navigator.userAgent
        });
        
        set({ fcmToken: token });
        void response;
        // Only show success toast if it's the first time or explicitly needed
        if (token !== get().fcmToken) {
            notify.success("Push notifications active! 🔔");
        }
    } catch (error) {
        console.error("[FCM] Registration error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        const errorDetail = error.message || "Unknown error";
        notify.error("Registration Failed", { 
            description: `Could not sync with backend: ${errorDetail}`,
            duration: 8000
        });
    }
  },





  // Cache duration (2 minutes for real-time feel)
  CACHE_DURATION: 2 * 60 * 1000,

  /**
   * Fetch all notifications with caching.
   */
  fetchNotifications: async (force = false) => {
    const state = get();
    const now = Date.now();

    // De-duplicate concurrent calls from multiple mounted components
    if (state._fetchPromise) {
      return state._fetchPromise;
    }

    // Use cache if valid
    if (
      !force &&
      state.lastFetched &&
      now - state.lastFetched < state.CACHE_DURATION &&
      state.notifications.length > 0
    ) {
      return state.notifications;
    }

    const fetchPromise = (async () => {
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
          lastFetched: Date.now(),
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
      } finally {
        set({ _fetchPromise: null });
      }
    })();

    set({ _fetchPromise: fetchPromise });
    return fetchPromise;
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
      fcmToken: null,
      _deniedWarned: false,
      _promptShown: false,
      _fetchPromise: null,
    });
  },
}));

export default useNotificationStore;
