import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import LoginSkeleton from "../auth/LoginSkeleton";

/**
 * PublicOnlyRoute - For login/register pages
 * Redirects authenticated users based on role:
 * - Admins → /admin/dashboard
 * - Regular users → /home
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isInitialized, user, loading } = useAuthStore();

  // Wait for auth check to complete before rendering
  if (!isInitialized || loading) {
    return <LoginSkeleton />;
  }

  if (isAuthenticated) {
    if (user?.is_staff || user?.is_superuser) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
