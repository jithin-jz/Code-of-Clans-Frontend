import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

/**
 * AdminRoute - For admin-only pages
 * Requires user to be authenticated AND be staff/superuser
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.is_staff && !user?.is_superuser) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
