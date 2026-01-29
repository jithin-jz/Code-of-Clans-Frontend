import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';

// Pages

import Login from './auth/Login';
import Profile from './profile/Profile';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import AdminDashboard from './admin/Dashboard';
import NotFound from './pages/NotFound';
import BuyXPPage from './pages/BuyXPPage';
import Game from './pages/Game';
import CertificateVerification from './pages/CertificateVerification';
import CodeArena from './game/CodeArena';
import Leaderboard from './challenges/Leaderboard';
import Store from './store/Store';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import AdminRoute from './routes/AdminRoute';

// Components
import Loader from './common/Loader';

// Auth initializer component
const AuthInitializer = ({ children }) => {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return children;
};

import { NotificationContainer } from './services/notification';

const AppContent = () => {
    const { user } = useAuthStore();

    // Map themes to CSS variables
    useEffect(() => {
        if (!user?.profile?.active_theme) return;
        
        const root = document.documentElement;
        const themes = {
            'dracula': { bg: '231 15% 18%', primary: '265 90% 78%' },     // #282a36, #bd93f9
            'nord': { bg: '220 16% 22%', primary: '188 43% 67%' },        // #2e3440, #88c0d0
            'monokai': { bg: '75 8% 15%', primary: '338 95% 56%' },       // #272822, #f92672
            'solarized_dark': { bg: '192 100% 11%', primary: '205 69% 49%' }, // #002b36, #268bd2
            'cyberpunk': { bg: '0 0% 4%', primary: '330 100% 50%' },      // #0d0d0d, #ff007f
        };

        const theme = themes[user.profile.active_theme];
        if (theme) {
            root.style.setProperty('--background', theme.bg);
            // primary is in HSL format "H S L" for index.css variables
            if (theme.primary) {
                root.style.setProperty('--primary', theme.primary);
                root.style.setProperty('--ring', theme.primary);
            }
        } else {
            // Default
            root.style.setProperty('--background', '0 0% 4%');
            root.style.setProperty('--primary', '45 100% 51%');
        }

        // Apply Font
        if (user.profile.active_font) {
            root.style.fontFamily = `"${user.profile.active_font}", sans-serif`;
        } else {
            root.style.fontFamily = '';
        }
    }, [user?.profile?.active_theme, user?.profile?.active_font]);

    return (
        <AuthInitializer>
            <NotificationContainer />
            <div className="min-h-screen">
                <main>
                    <Routes>
                        {/* Public Landing (Game Map) - Visible to all */}
                        <Route path="/" element={<Home />} />

                        {/* Authentication - Public Only */}
                        <Route path="/login" element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        } />

                        {/* Redirect legacy routes to / */}
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        
                        {/* OAuth Callbacks */}
                        <Route path="/auth/github/callback" element={<OAuthCallback provider="github" />} />
                        <Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
                        <Route path="/auth/discord/callback" element={<OAuthCallback provider="discord" />} />
                        
                        {/* Certificate Verification - Public */}
                        <Route path="/certificate/verify/:id" element={<CertificateVerification />} />

                        {/* Admin Dashboard - Admin Only */}
                        <Route path="/admin/dashboard" element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        } />
                        
                        {/* Protected Routes */}
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile/:username" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/level/:id" element={
                            <ProtectedRoute>
                                <CodeArena />
                            </ProtectedRoute>
                        } />
                        <Route path="/shop" element={
                            <ProtectedRoute>
                                <BuyXPPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/game" element={
                            <ProtectedRoute>
                                <Game />
                            </ProtectedRoute>
                        } />

                        <Route path="/leaderboard" element={
                            <ProtectedRoute>
                                <Leaderboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/store" element={
                            <ProtectedRoute>
                                <Store />
                            </ProtectedRoute>
                        } />
                        
                        {/* Fallback */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        
                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </AuthInitializer>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;