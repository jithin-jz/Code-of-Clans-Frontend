import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';

// Pages
// Pages
import Login from './pages/auth/Login';
import Profile from './pages/Profile';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import AdminDashboard from './pages/admin/Dashboard';

// Route Guards
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './routes';

// Components
import Loader from './components/common/Loader';

// Auth initializer component
const AuthInitializer = ({ children }) => {
    const { loading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <>
            <Loader isLoading={loading} />
            {!loading && children}
        </>
    );
};

const AppContent = () => {
    return (
        <AuthInitializer>
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