import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const OAuthCallback = ({ provider }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading, error, isAuthenticated, handleOAuthCallback, clearError } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPopup, setIsPopup] = useState(false);

    // Helper to determine redirect path based on user role
    const getRedirectPath = (userData) => {
        if (userData?.is_staff || userData?.is_superuser) {
            return '/admin/dashboard';
        }
        return '/home';
    };

    useEffect(() => {
        // Check if this is a popup window
        const isPopupWindow = window.opener && !window.opener.closed;
        setIsPopup(isPopupWindow);

        const processCallback = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                if (isPopupWindow) {
                    // Send error to parent and close
                    window.opener.postMessage({ 
                        type: 'oauth-error', 
                        provider, 
                        error: errorParam 
                    }, window.location.origin);
                    window.close();
                }
                return;
            }

            if (!code) {
                return;
            }

            // Check if this code was already processed using sessionStorage
            const processedKey = `oauth_processed_${code}`;
            if (sessionStorage.getItem(processedKey)) {
                console.log('OAuth code already processed, skipping...');
                return;
            }

            // Mark as processing
            setIsProcessing(true);
            sessionStorage.setItem(processedKey, 'true');
            
            try {
                const success = await handleOAuthCallback(provider, code);
                
                if (success) {
                    if (isPopupWindow) {
                        // Notify parent window and close popup
                        window.opener.postMessage({ 
                            type: 'oauth-success', 
                            provider 
                        }, window.location.origin);
                        window.close();
                    } else {
                        // Get fresh user data from store and redirect based on role
                        const currentUser = useAuthStore.getState().user;
                        const redirectPath = getRedirectPath(currentUser);
                        navigate(redirectPath, { replace: true });
                    }
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                // Clear the processed flag on error so user can retry
                sessionStorage.removeItem(processedKey);
                
                if (isPopupWindow) {
                    window.opener.postMessage({ 
                        type: 'oauth-error', 
                        provider, 
                        error: err.message 
                    }, window.location.origin);
                    window.close();
                }
            } finally {
                setIsProcessing(false);
            }
        };

        processCallback();
    }, [searchParams, provider, handleOAuthCallback, navigate]);

    useEffect(() => {
        if (isAuthenticated && !isPopup) {
            const redirectPath = getRedirectPath(user);
            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, navigate, isPopup, user]);

    if (loading || isProcessing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/80 mt-6 text-lg">Completing sign in...</p>
                    {isPopup && (
                        <p className="text-white/50 mt-2 text-sm">This window will close automatically.</p>
                    )}
                </div>
            </div>
        );
    }

    if (error || searchParams.get('error')) {
        const errorMessage = error || `Authentication was cancelled or failed: ${searchParams.get('error')}`;
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center max-w-md">
                    <div className="text-5xl mb-4">❌</div>
                    <h2 className="text-white text-2xl font-semibold mb-3">Authentication Failed</h2>
                    <p className="text-white/60 mb-6">{errorMessage}</p>
                    <button 
                        onClick={() => {
                            clearError();
                            if (isPopup) {
                                window.close();
                            } else {
                                navigate('/login');
                            }
                        }}
                        className="px-8 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                    >
                        {isPopup ? 'Close' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default OAuthCallback;
