import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const UserHome = () => {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
            <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 rounded-3xl mx-auto mb-6 overflow-hidden border-4 border-indigo-500/30">
                    {user?.profile?.avatar_url ? (
                        <img src={user.profile.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                            {user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
                <h1 className="text-white text-4xl md:text-5xl font-bold mb-3">
                    Welcome back, <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{user?.first_name || user?.username}!</span>
                </h1>
                <p className="text-white/60 text-lg mb-8">You're signed in and ready to go.</p>
                
                <div className="flex gap-4 justify-center">
                    <Link 
                        to="/profile" 
                        className="inline-flex px-8 py-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                    >
                        View Profile
                    </Link>
                    {/* Add more dashboard links here */}
                </div>
            </div>
        </div>
    );
};

export default UserHome;
