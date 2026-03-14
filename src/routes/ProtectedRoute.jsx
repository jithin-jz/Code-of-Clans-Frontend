import { Navigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import useAuthStore from "../stores/useAuthStore";
import { SkeletonGenericPage } from "../common/SkeletonPrimitives";

/**
 * ProtectedRoute - Requires authentication
 * Redirects unauthenticated users to landing page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, loading } = useAuthStore(
    useShallow((s) => ({
      isAuthenticated: s.isAuthenticated,
      isInitialized: s.isInitialized,
      loading: s.loading,
    })),
  );

  if (!isInitialized || loading) {
    return <SkeletonGenericPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
