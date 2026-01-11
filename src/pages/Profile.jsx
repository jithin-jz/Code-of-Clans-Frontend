import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { 
    Users, Camera, Trophy, MapPin, Calendar, Edit3, Shield, Star, Sword, Crown, Camera as CameraIcon, Home, LogOut
} from 'lucide-react';
import { Loader } from '../components/common';

const Profile = () => {
    const navigate = useNavigate();
    const { username } = useParams(); // If viewing another user
    const { user: currentUser, updateProfileImage, updateProfile, followUser, logout } = useAuthStore();
    
    // Determine if we are viewing our own profile or someone else's
    const isOwnProfile = !username || (currentUser && username === currentUser.username);
    
    const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
    const [loading, setLoading] = useState(!isOwnProfile);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form State
    const [editForm, setEditForm] = useState({
        username: '',
        bio: '',
    });

    // Local Loading States
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // File refs
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const fetchProfile = useCallback(async (targetUsername) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/users/${targetUsername}/`);
            if (response.ok) {
                const data = await response.json();
                setProfileUser(data);
            } else {
                navigate('/404'); 
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (isOwnProfile) {
            setProfileUser(currentUser);
            setEditForm({
                username: currentUser?.username || '',
                bio: currentUser?.profile?.bio || '',
            });
            setLoading(false);
        } else if (username) {
            // Fetch other user profile
            fetchProfile(username);
        }
    }, [username, currentUser, isOwnProfile, fetchProfile]);

    const handleImageUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        if (type === 'avatar') setUploadingAvatar(true);
        if (type === 'banner') setUploadingBanner(true);

        try {
            const updatedUser = await updateProfileImage(type, file);
            if (isOwnProfile) {
                setProfileUser(updatedUser);
            }
        } catch (error) {
            console.error(`Failed to upload ${type}`, error);
        } finally {
            if (type === 'avatar') setUploadingAvatar(false);
            if (type === 'banner') setUploadingBanner(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const updatedUser = await updateProfile(editForm);
            setProfileUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser) return navigate('/login');
        
        try {
            const data = await followUser(profileUser.username);
            setProfileUser(prev => ({
                ...prev,
                is_following: data.is_following,
                followers_count: data.follower_count
            }));
        } catch (error) {
            console.error("Failed to toggle follow", error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // For initial load of other user's profile, show full loader
    // For own profile, we start with data so no full loader needed usually.
    if (loading && !profileUser) {
        return <Loader isLoading={true} />;
    }

    if (!profileUser) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
            
            {/* Banner Section */}
            <div className="relative h-64 md:h-80 w-full group overflow-hidden">
                {uploadingBanner && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                    </div>
                )}
                {profileUser.profile?.banner_url ? (
                    <>
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] z-10" />
                        <img src={profileUser.profile.banner_url} alt="Banner" className="w-full h-full object-cover opacity-80" />
                    </>
                ) : (
                    <div className="w-full h-full bg-[#1a1a1a] relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-60" />
                         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
                    </div>
                )}

                {/* Navigation Buttons */}
                <button 
                    onClick={() => navigate('/home')}
                    className="absolute top-4 left-4 z-50 bg-black/40 hover:bg-black/80 text-white p-3 rounded-xl backdrop-blur-md transition-all border border-white/10"
                    title="Go Home"
                >
                    <Home size={20} />
                </button>

                {currentUser && (
                    <button 
                        onClick={handleLogout}
                        className="absolute top-4 right-4 z-50 bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-xl backdrop-blur-md transition-all border border-white/10 shadow-lg"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                )}
                
                {isOwnProfile && (
                    <button 
                        onClick={() => bannerInputRef.current.click()}
                        className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
                        title="Edit Banner"
                    >
                        <Camera size={20} />
                    </button>
                )}
                <input 
                    type="file" 
                    ref={bannerInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')} 
                />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 relative z-20">
                <div className="flex flex-col md:flex-row gap-8 -mt-24">
                    
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="flex flex-col items-center md:items-start shrink-0 md:w-64">
                         {/* Avatar */}
                        <div className="relative group mb-4">
                            <div className="w-40 h-40 rounded-3xl border-4 border-[#0a0a0a] overflow-hidden bg-[#242424] shadow-2xl relative">
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                )}
                                {profileUser.profile?.avatar_url ? (
                                    <img src={profileUser.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#333] to-[#111]">
                                        <Users size={64} className="text-zinc-600" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Edit Avatar Overlay */}
                             {isOwnProfile && !uploadingAvatar && (
                                <div 
                                    onClick={() => avatarInputRef.current.click()}
                                    className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all border-4 border-[#0a0a0a]"
                                >
                                    <CameraIcon className="text-white drop-shadow-lg" size={32} />
                                </div>
                            )}
                             <input 
                                type="file" 
                                ref={avatarInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'avatar')} 
                            />
                            
                            {/* Level Badge (Mock) */}
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 w-12 h-12 rounded-xl border-4 border-[#0a0a0a] flex items-center justify-center font-black text-white shadow-lg text-lg">
                                42
                            </div>
                        </div>

                        {/* Name & Tag */}
                        <div className="text-center md:text-left w-full mb-6">
                            <h1 className="text-3xl font-black text-white leading-tight tracking-tight mb-1 truncate">
                                {profileUser.first_name || profileUser.username}
                            </h1>
                            <p className="text-zinc-500 font-bold tracking-wide text-sm flex items-center justify-center md:justify-start gap-1">
                                <span className="text-yellow-500">@</span>{profileUser.username}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="w-full space-y-3">
                             {isOwnProfile ? (
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                        isEditing 
                                            ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                                    }`}
                                >
                                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                </button>
                             ) : (
                                 <div className="flex gap-3">
                                    <button 
                                        onClick={handleFollowToggle}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                                            profileUser.is_following 
                                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                    >
                                        {profileUser.is_following ? 'Unfollow' : 'Follow'}
                                    </button>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Right Column: Content & Stats */}
                    <div className="flex-1 md:pt-12 w-full">
                        
                        {/* Edit Mode Form */}
                        {isEditing && isOwnProfile ? (
                            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-zinc-800 shadow-xl mb-6 animate-fade-in-down">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Edit3 size={18} className="text-blue-500"/> Edit Details
                                </h3>
                                
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 ml-1">Username</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-zinc-500 font-bold">@</span>
                                            <input 
                                                type="text" 
                                                value={editForm.username}
                                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                                className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl p-3 pl-8 text-white focus:outline-hidden focus:border-blue-600 font-bold transition-colors"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 ml-1">About Me</label>
                                        <textarea 
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                            className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-xl p-4 text-zinc-300 focus:outline-hidden focus:border-blue-600 transition-colors h-32 resize-none leading-relaxed"
                                            placeholder="Write something epic..."
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end pt-2">
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={savingProfile}
                                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {savingProfile ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                        <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Followers</div>
                                        <div className="text-2xl font-black text-white">{profileUser.followers_count || 0}</div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                        <div className="text-zinc-500 text-xs font-bold uppercase mb-1">Following</div>
                                        <div className="text-2xl font-black text-white">{profileUser.following_count || 0}</div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                        <div className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Trophy size={12} className="text-yellow-500"/> Wins</div>
                                        <div className="text-2xl font-black text-white">1,337</div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                                        <div className="text-zinc-500 text-xs font-bold uppercase mb-1">League</div>
                                        <div className="text-lg font-black text-[#a6b1e1] truncate">Diamond II</div>
                                    </div>
                                </div>

                                {/* Bio Section */}
                                <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-zinc-800/50">
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <Crown size={20} className="text-yellow-500" /> About
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                        {profileUser.profile?.bio || "This warrior hasn't written a bio yet."}
                                    </p>
                                </div>

                                {/* Achievements / Games (Mock) */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 tracking-wider ml-1">Recent Achievements</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-2xl border border-zinc-800/50 hover:bg-[#222] transition-colors cursor-pointer group">
                                                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 group-hover:border-yellow-500/50 transition-colors">
                                                    <Star className="text-yellow-500" size={24} fill="currentColor" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">Victory Royale {i}</div>
                                                    <div className="text-xs text-zinc-500">Unlocked 2h ago</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
