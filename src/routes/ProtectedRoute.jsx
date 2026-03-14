import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { SkeletonGenericPage } from "../common/SkeletonPrimitives";

/**
 * ProtectedRoute - Requires authentication
 * Redirects unauthenticated users to landing page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, loading } = useAuthStore();

  if (!isInitialized || loading) {
    return <SkeletonGenericPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
