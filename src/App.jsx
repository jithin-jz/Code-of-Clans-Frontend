import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import UserHome from './pages/UserHome';

// Admin pages
import AdminDashboard from './admin/Dashboard';

// Auth initializer component
const AuthInitializer = ({ children }) => {
    const { loading, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return children;
};

const AppContent = () => {
    return (
        <AuthInitializer>
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={
                            <PublicOnlyRoute>
                                <Login />
                            </PublicOnlyRoute>
                        } />
                        <Route path="/home" element={
                            <ProtectedRoute>
                                <UserHome />
                            </ProtectedRoute>
                        } />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        
                        {/* OAuth Callbacks */}
                        <Route 
                            path="/auth/github/callback" 
                            element={<OAuthCallback provider="github" />} 
                        />
                        <Route 
                            path="/auth/google/callback" 
                            element={<OAuthCallback provider="google" />} 
                        />
                        <Route 
                            path="/auth/discord/callback" 
                            element={<OAuthCallback provider="discord" />} 
                        />
                        
                        {/* Admin Dashboard - requires staff/superuser (checked in component) */}
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        
                        {/* Protected Routes */}
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />
                        
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

// Helper component to redirect authenticated users
const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

export default App;