import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { AdminPageSkeleton } from "../admin/AdminSkeletons";

/**
 * AdminRoute - For admin-only pages
 * Requires user to be authenticated AND be staff/superuser
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading, isInitialized } = useAuthStore();

  if (loading || !isInitialized) {
    return <AdminPageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_staff && !user?.is_superuser) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
