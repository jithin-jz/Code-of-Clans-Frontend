import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

/**
 * ProtectedRoute - Requires authentication
 * Redirects unauthenticated users to home page
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isInitialized } = useAuthStore();

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
