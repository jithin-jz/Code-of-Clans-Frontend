import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

/**
 * PublicOnlyRoute - For login/register pages
 * Redirects authenticated users based on role:
 * - Admins → /admin/dashboard
 * - Regular users → /
 */
const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated, isInitialized, user } = useAuthStore();

    // Wait for auth check to complete before rendering
    if (!isInitialized) {
        return null;
    }

    if (isAuthenticated) {
        if (user?.is_staff || user?.is_superuser) {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicOnlyRoute;
