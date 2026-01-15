import React from 'react';
import { Toaster } from 'react-hot-toast';

const NotificationContainer = () => {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'rgba(15, 23, 42, 0.95)', // Slate-900 with opacity
                    backdropFilter: 'blur(8px)',
                    color: '#FFF',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 215, 0, 0.1)',
                    border: '1px solid #4a3810', // Dark gold/brown border
                    padding: '16px',
                    borderRadius: '4px', // Sqaured off slightly for rigid game feel
                    fontSize: '14px',
                    fontWeight: '600',
                    maxWidth: '450px',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                },
                success: {
                    iconTheme: {
                        primary: '#FFD700', // Gold icon
                        secondary: '#000',
                    },
                    style: {
                        border: '2px solid #10B981', // Emerald border
                        borderLeft: '6px solid #10B981',
                        background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.95))',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.3), inset 0 0 10px rgba(16, 185, 129, 0.1)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444', // Red icon
                        secondary: '#FFF',
                    },
                    style: {
                        border: '2px solid #EF4444', // Red border
                        borderLeft: '6px solid #EF4444',
                        background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.95))',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.3), inset 0 0 10px rgba(239, 68, 68, 0.1)',
                    },
                },
                loading: {
                    iconTheme: {
                        primary: '#3B82F6',
                        secondary: '#FFF',
                    },
                    style: {
                        border: '2px solid #3B82F6',
                        borderLeft: '6px solid #3B82F6',
                        background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0.95))',
                    },
                },
                custom: {
                    style: {
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '2px solid #FFD700', // Pure gold for custom/generic
                    }
                }
            }}
        />
    );
};

export default NotificationContainer;
