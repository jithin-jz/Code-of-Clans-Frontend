import React, { useEffect, useRef, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import useAuthStore from "./stores/useAuthStore";

// Components (loaded immediately)
import Loader from "./common/Loader";
import ErrorBoundary from "./components/ErrorBoundary";

// Route Guards (loaded immediately)
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import AdminRoute from "./routes/AdminRoute";

// Lazy-loaded Pages (code splitting)
const Login = lazy(() => import("./auth/Login"));
const Profile = lazy(() => import("./profile/Profile"));
const Home = lazy(() => import("./pages/Home"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const AdminDashboard = lazy(() => import("./admin/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BuyXPPage = lazy(() => import("./pages/BuyXPPage"));
const Game = lazy(() => import("./pages/Game"));
const CertificateVerification = lazy(
  () => import("./pages/CertificateVerification"),
);

const CodeArena = lazy(() => import("./game/CodeArena"));
const Store = lazy(() => import("./store/Store"));

import useNotificationStore from "./stores/useNotificationStore";

// Auth initializer component
const AuthInitializer = ({ children }) => {
  const { checkAuth, user } = useAuthStore();
  const { initFCM } = useNotificationStore();
  const authInitRef = useRef(false);

  useEffect(() => {
    if (authInitRef.current) return;
    authInitRef.current = true;
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      initFCM();
    }
  }, [user, initFCM]);

  return children;
};

import { Toaster } from "./components/ui/sonner";

const AppContent = () => {
  return (
    <AuthInitializer>
      <ErrorBoundary>
        <Toaster />
        <div className="min-h-screen">
          <main>
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public Landing (Game Map) - Visible to all */}
                <Route path="/" element={<Home />} />

                {/* Authentication - Public Only */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />

                {/* Redirect legacy routes to / */}
                <Route path="/home" element={<Navigate to="/" replace />} />

                {/* OAuth Callbacks */}
                <Route
                  path="/auth/github/callback"
                  element={<OAuthCallback provider="github" />}
                />
                <Route
                  path="/auth/google/callback"
                  element={<OAuthCallback provider="google" />}
                />

                {/* Admin Dashboard - Admin Only */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/level/:id"
                  element={
                    <ProtectedRoute>
                      <CodeArena />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ProtectedRoute>
                      <BuyXPPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/buy-xp"
                  element={
                    <ProtectedRoute>
                      <BuyXPPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/game"
                  element={
                    <ProtectedRoute>
                      <Game />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/store"
                  element={
                    <ProtectedRoute>
                      <Store />
                    </ProtectedRoute>
                  }
                />

                {/* Public Certificate Verification */}
                <Route
                  path="/verify/:certificateId"
                  element={<CertificateVerification />}
                />

                {/* Fallback */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </ErrorBoundary>
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
