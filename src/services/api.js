import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
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
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                        refresh_token: refreshToken,
                    });
                    
                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);
                    
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch {
                // Refresh failed, clear tokens
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    // Get OAuth URLs
    getGithubAuthUrl: () => api.get('/auth/github/'),
    getGoogleAuthUrl: () => api.get('/auth/google/'),
    getDiscordAuthUrl: () => api.get('/auth/discord/'),
    
    // Handle OAuth callbacks
    githubCallback: (code) => api.post('/auth/github/callback/', { code }),
    googleCallback: (code) => api.post('/auth/google/callback/', { code }),
    discordCallback: (code) => api.post('/auth/discord/callback/', { code }),
    
    // User endpoints
    getCurrentUser: () => api.get('/auth/user/'),
    getUserProfile: (username) => api.get(`/auth/users/${username}/`),
    logout: () => api.post('/auth/logout/'),
    refreshToken: (refresh_token) => api.post('/auth/refresh/', { refresh_token }),
    updateProfile: (data) => {
        const config = {};
        if (data instanceof FormData) {
            // Setting Content-Type to undefined allows the browser to set the boundary automatically
            config.headers = { 'Content-Type': undefined };
        }
        return api.patch('/auth/user/update/', data, config);
    },
    followUser: (username) => api.post(`/auth/users/${username}/follow/`),
    getFollowers: (username) => api.get(`/auth/users/${username}/followers/`),
    getFollowing: (username) => api.get(`/auth/users/${username}/following/`),
    redeemReferral: (code) => api.post('/auth/user/redeem-referral/', { code }),
    deleteAccount: () => api.delete('/auth/user/delete/'),
};

export default api;
