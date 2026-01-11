import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authAPI } from '../services/api';

// Helper function to open OAuth in a popup window
const openOAuthPopup = (url, name = 'OAuth Login') => {
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
    error: null,
    oauthPopup: null,

    // Actions
    setLoading: (loading) => set({ loading }),
    
    clearError: () => set({ error: null }),

    checkAuth: async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            set({ user: null, isAuthenticated: false, loading: false });
            return;
        }
        
        try {
            const response = await authAPI.getCurrentUser();
            set({ 
                user: response.data, 
                isAuthenticated: true, 
                loading: false, 
                error: null 
            });
        } catch {
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            set({ 
                user: null, 
                isAuthenticated: false, 
                loading: false 
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
                case 'github':
                    response = await authAPI.getGithubAuthUrl();
                    popupName = 'GitHub Login';
                    break;
                case 'google':
                    response = await authAPI.getGoogleAuthUrl();
                    popupName = 'Google Login';
                    break;
                case 'discord':
                    response = await authAPI.getDiscordAuthUrl();
                    popupName = 'Discord Login';
                    break;
                default:
                    throw new Error('Unknown provider');
            }
            
            const popup = openOAuthPopup(response.data.url, popupName);
            set({ oauthPopup: popup, loading: false });
            
            // Return popup reference for monitoring
            return popup;
        } catch (error) {
            set({ 
                loading: false, 
                error: error.response?.data?.error || `Failed to get ${provider} auth URL` 
            });
            return null;
        }
    },

    // Legacy methods for backward compatibility (redirect-based)
    getGithubAuthUrl: async () => {
        try {
            const response = await authAPI.getGithubAuthUrl();
            window.location.href = response.data.url;
        } catch (error) {
            set({ error: error.response?.data?.error || 'Failed to get GitHub auth URL' });
        }
    },

    getGoogleAuthUrl: async () => {
        try {
            const response = await authAPI.getGoogleAuthUrl();
            window.location.href = response.data.url;
        } catch (error) {
            set({ error: error.response?.data?.error || 'Failed to get Google auth URL' });
        }
    },

    getDiscordAuthUrl: async () => {
        try {
            const response = await authAPI.getDiscordAuthUrl();
            window.location.href = response.data.url;
        } catch (error) {
            set({ error: error.response?.data?.error || 'Failed to get Discord auth URL' });
        }
    },

    handleOAuthCallback: async (provider, code) => {
        set({ loading: true, error: null });
        
        try {
            let response;
            switch (provider) {
                case 'github':
                    response = await authAPI.githubCallback(code);
                    break;
                case 'google':
                    response = await authAPI.googleCallback(code);
                    break;
                case 'discord':
                    response = await authAPI.discordCallback(code);
                    break;
                default:
                    throw new Error('Unknown provider');
            }
            
            const { access_token, refresh_token, user } = response.data;
            Cookies.set('access_token', access_token, { expires: 1 });
            Cookies.set('refresh_token', refresh_token, { expires: 7 });
            
            set({ 
                user, 
                isAuthenticated: true, 
                loading: false, 
                error: null 
            });
            
            return true;
        } catch (error) {
            set({ 
                loading: false, 
                error: error.response?.data?.error || 'OAuth callback failed' 
            });
            return false;
        }
    },

    // Called from popup callback page to notify parent
    handlePopupCallback: async (provider, code) => {
        const success = await get().handleOAuthCallback(provider, code);
        
        // Close the popup if it exists
        const popup = get().oauthPopup;
        if (popup && !popup.closed) {
            popup.close();
        }
        set({ oauthPopup: null });
        
        return success;
    },

    logout: async () => {
        try {
            await authAPI.logout();
        } catch {
            // Continue with logout even if API fails
        }
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: null 
        });
    },

    // Profile Management Actions
    setUser: (user) => set({ user }),

    updateProfile: async (data) => {
        set({ loading: true });
        try {
            const token = Cookies.get('access_token');
            // Using fetch directly here since authAPI doesn't have these methods yet
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${baseUrl}/auth/user/update/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const updatedUser = await response.json();
            set({ user: updatedUser, loading: false });
            return updatedUser;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateProfileImage: async (type, file) => {
        set({ loading: true });
        try {
            const token = Cookies.get('access_token');
            const formData = new FormData();
            formData.append(type, file);

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${baseUrl}/auth/user/update/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error(`Failed to upload ${type}`);

            const updatedUser = await response.json();
            set({ user: updatedUser, loading: false });
            return updatedUser;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    followUser: async (username) => {
        try {
            const token = Cookies.get('access_token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const response = await fetch(`${baseUrl}/auth/users/${username}/follow/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to follow user');

            return await response.json();
        } catch (error) {
            console.error('Follow action failed:', error);
            throw error;
        }
    }
}));

export default useAuthStore;
