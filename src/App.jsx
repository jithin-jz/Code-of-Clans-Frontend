import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';

// Pages

import Login from './auth/Login';
import Profile from './profile';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import AdminDashboard from './admin/Dashboard';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import AdminRoute from './routes/AdminRoute';

// Components
import Loader from './common/Loader';

// Auth initializer component
const AuthInitializer = ({ children }) => {
    const { isInitialized, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <>
            <Loader isLoading={!isInitialized} />
            {isInitialized && children}
        </>
    );
};

import { NotificationContainer } from './services/notification';

const AppContent = () => {
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
                        <Route path="/game" element={<Navigate to="/" replace />} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        
                        {/* OAuth Callbacks */}
                        <Route path="/auth/github/callback" element={<OAuthCallback provider="github" />} />
                        <Route path="/auth/google/callback" element={<OAuthCallback provider="google" />} />
                        <Route path="/auth/discord/callback" element={<OAuthCallback provider="discord" />} />
                        
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
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
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