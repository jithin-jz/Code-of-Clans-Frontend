import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { notify } from '../services/notification';
import { 
    Users, Camera, Trophy, MapPin, Calendar, Edit3, Shield, Star, Sword, Crown, Home, LogOut, Sparkles, X, UserMinus, UserPlus, ChevronRight
} from 'lucide-react';
import { authAPI } from '../services/api';
import Loader from '../common/Loader';
import ReferralSection from './ReferralSection';
import { generateLevels } from '../constants/levelData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Profile = () => {
    const navigate = useNavigate();
    const { username } = useParams();
    const { user: currentUser, updateProfileImage, updateProfile, followUser, logout, deleteAccount } = useAuthStore();
    
    const isOwnProfile = !username || (currentUser && username === currentUser.username);
    
    // Determine profileUser based on ownership
    const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
    const [loading, setLoading] = useState(!isOwnProfile);
    const [isEditing, setIsEditing] = useState(false);
    
    const [editForm, setEditForm] = useState({
        username: '',
        bio: '',
    });

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    
    const [listType, setListType] = useState(null); // 'followers' or 'following' or null
    const [userList, setUserList] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    // Use authAPI to fetch profile
    const { getUserProfile, getFollowers, getFollowing } = authAPI;

    const fetchProfile = useCallback(async (targetUsername) => {
        setLoading(true);
        try {
            const response = await getUserProfile(targetUsername);
            setProfileUser(response.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            navigate('/404');
        } finally {
            setLoading(false);
        }
    }, [navigate, getUserProfile]);

    const fetchUserList = async (type) => { 
       setListLoading(true);
       setUserList([]);
       try {
           const apiCall = type === 'followers' ? getFollowers : getFollowing;
           const response = await apiCall(profileUser.username);
           setUserList(response.data);
           setListType(type);
       } catch (err) {
           console.error(err);
       } finally {
           setListLoading(false);
       }
   };

    useEffect(() => {
        if (isOwnProfile) {
            // Ensure we have the latest data from the store
            setProfileUser(currentUser);
            setEditForm({
                username: currentUser?.username || '',
                bio: currentUser?.profile?.bio || '',
            });
            setLoading(false);
        } else if (username) {
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
                // Store update handles user state, but we locally update profileUser for immediate feedback if needed
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

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteAccount();
                navigate('/login');
            } catch (err) {
                notify.error(err.message);
            }
        }
    };

    if (loading && !profileUser) {
        return <Loader isLoading={true} />;
    }

    if (!profileUser) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#FFD700] selection:text-black">
            
            {/* Banner Section with Parallax-like feel */}
            <div className="relative h-80 md:h-96 w-full overflow-hidden">
                {uploadingBanner && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 border-4 border-[#FFD700]/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-[#FFD700] rounded-full animate-spin"></div>
                        </div>
                    </div>
                )}
                
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                    {profileUser.profile?.banner_url ? (
                        <img 
                            src={profileUser.profile.banner_url} 
                            alt="Banner" 
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black relative">
                             <div className="absolute inset-0 opacity-30" 
                                  style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                        </div>
                    )}
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                </div>

                {/* Navigation Buttons */}
                <div className="absolute top-6 left-6 z-50">
                    <button 
                        onClick={() => navigate('/home')}
                        className="p-3 bg-black/30 hover:bg-black/50 backdrop-blur-xl rounded-full border border-white/10 transition-all hover:scale-110 group"
                    >
                        <Home size={20} className="text-white group-hover:text-[#FFD700] transition-colors" />
                    </button>
                </div>

                {currentUser && (
                    <div className="absolute top-6 right-6 z-50 flex gap-3">
                        {isOwnProfile && (
                            <button 
                                onClick={() => bannerInputRef.current.click()}
                                className="px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-2 transition-all hover:scale-105 group"
                            >
                                <Camera size={16} className="text-gray-300 group-hover:text-white" />
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white hidden sm:inline">Change Banner</span>
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="p-3 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-xl rounded-full border border-red-500/30 transition-all hover:scale-110 group"
                        >
                            <LogOut size={20} className="text-red-200 group-hover:text-red-100" />
                        </button>
                    </div>
                )}
                
                <input 
                    type="file" 
                    ref={bannerInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')} 
                />
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 -mt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Sidebar: Profile Card & Referral */}
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        {/* Profile Info Card */}
                        <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
                            
                            {/* Avatar */}
                            <div className="relative -mt-20 mb-6 flex justify-center">
                                <div className="w-40 h-40 rounded-full border-4 border-[#050505] p-1 bg-gradient-to-br from-[#FFD700] via-orange-500 to-purple-600 shadow-xl relative group">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-[#242424] relative">
                                        {uploadingAvatar && (
                                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                <div className="relative w-8 h-8">
                                                    <div className="absolute inset-0 border-3 border-white/10 rounded-full"></div>
                                                    <div className="absolute inset-0 border-3 border-t-white rounded-full animate-spin"></div>
                                                </div>
                                            </div>
                                        )}
                                        {profileUser.profile?.avatar_url ? (
                                            <img src={profileUser.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
                                                <Users size={64} className="text-zinc-600" />
                                            </div>
                                        )}
                                        
                                        {/* Edit Overlay */}
                                        {isOwnProfile && (
                                            <div 
                                                onClick={() => avatarInputRef.current.click()}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
                                            >
                                                <Camera className="text-white drop-shadow-md" size={32} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Level Badge */}
                                    <div className="absolute bottom-0 right-0 bg-[#050505] p-1 rounded-full">
                                        <div className="bg-gradient-to-tr from-[#FFD700] to-orange-400 w-10 h-10 rounded-full flex items-center justify-center font-black text-black text-sm shadow-lg border border-white/10">
                                            {Math.floor((profileUser.profile?.xp || 0) / 1000) + 1}
                                        </div>
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    ref={avatarInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'avatar')} 
                                />
                            </div>

                            {/* User Info */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                                    {profileUser.first_name || profileUser.username}
                                    <Shield size={16} className="text-[#FFD700] fill-[#FFD700]/20" />
                                </h1>
                                <p className="text-indigo-400 font-medium mb-4">@{profileUser.username}</p>
                                
                                <div className="flex justify-center gap-6 text-sm">
                                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fetchUserList('followers')}>
                                        <div className="font-bold text-white text-lg">{profileUser.followers_count || 0}</div>
                                        <div className="text-gray-500 text-xs uppercase tracking-wide">Followers</div>
                                    </div>
                                    <div className="w-px bg-white/10"></div>
                                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fetchUserList('following')}>
                                        <div className="font-bold text-white text-lg">{profileUser.following_count || 0}</div>
                                        <div className="text-gray-500 text-xs uppercase tracking-wide">Following</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                {isOwnProfile ? (
                                    <button 
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                                            isEditing 
                                                ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                                : 'bg-[#FFD700] text-black hover:bg-[#FDB931]'
                                        }`}
                                    >
                                        {isEditing ? <><LogOut size={16}/> Cancel Editing</> : <><Edit3 size={16}/> Edit Profile</>}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleFollowToggle}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                                            profileUser.is_following 
                                                ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                        }`}
                                    >
                                        {profileUser.is_following ? 'Unfollow' : 'Follow'}
                                    </button>
                                )}
                            </div>

                            {/* Join Date */}
                            <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                                    <Calendar size={12} />
                                    Joined {new Date(profileUser.date_joined || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {/* Referral Section (Now in Sidebar) */}
                        {isOwnProfile && (
                            <div className="transform transition-transform duration-300">
                                <ReferralSection />
                            </div>
                        )}
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 space-y-6">
                        
                        {/* Edit Mode Content */}
                        {isEditing && isOwnProfile && (
                            <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 animate-fade-in-up">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                                    <Sparkles className="text-[#FFD700]" /> Customize Profile
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={editForm.username}
                                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Bio</label>
                                        <textarea 
                                            value={editForm.bio}
                                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-[#FFD700] transition-colors min-h-[120px]"
                                            placeholder="Tell your story..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={handleDeleteAccount}
                                            className="text-red-500 hover:text-red-400 text-sm font-medium hover:underline flex items-center gap-2"
                                        >
                                            <Shield size={14} /> Delete Account
                                        </button>

                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={savingProfile}
                                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stats Grid */}
                        {!isEditing && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { label: 'Total XP', value: profileUser.profile?.xp || 0, icon: Star, color: 'text-[#FFD700]' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#121212] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">{stat.label}</div>
                                            <div className="text-2xl font-black text-white">{stat.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bio / About */}
                        {!isEditing && (
                            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 min-h-[200px]">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Users size={20} className="text-indigo-400" /> About
                                </h3>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-line text-lg">
                                    {profileUser.profile?.bio || (
                                        <span className="italic opacity-50">No bio provided just yet.</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Completed Tasks / Levels */}
                        {!isEditing && (
                            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Trophy size={20} className="text-[#FFD700]" /> Completed Tasks
                                </h3>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {(() => {
                                        const levels = generateLevels();
                                        const currentXp = profileUser.profile?.xp || 0;
                                        // Simple level calculation: 1000 XP per level (matching 10% progress logic in Map)
                                        // or just using the level derived from XP
                                        const currentLevelId = Math.floor(currentXp / 1000) + 1;
                                        
                                        const completedLevels = levels.filter(l => l.id <= currentLevelId);
                                        
                                        if (completedLevels.length === 0) {
                                            return (
                                                <div className="col-span-full text-center text-gray-500 italic py-4">
                                                    No tasks completed yet. Start playing to unlock!
                                                </div>
                                            );
                                        }

                                        return completedLevels.map((level) => (
                                            <div key={level.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 text-center transition-all hover:bg-white/10 hover:border-[#FFD700]/30 group">
                                                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <span className="text-white drop-shadow-md">
                                                        {level.icon && React.cloneElement(level.icon, { size: 20 })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-[#FFD700] uppercase tracking-wider mb-1">Level {level.id}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{level.name}</div>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* User List Modal using Shadcn Dialog */}
                <Dialog open={!!listType} onOpenChange={(open) => !open && setListType(null)}>
                    <DialogContent className="bg-[#121212] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-0">
                        <DialogHeader className="p-4 border-b border-white/10 bg-[#1a1a1a]">
                            <DialogTitle className="text-white font-bold text-lg">
                                {listType === 'followers' ? 'Followers' : 'Following'}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                            {listLoading ? (
                                <div className="p-8 flex justify-center"><Loader isLoading={true} /></div>
                            ) : userList.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No users found.
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {userList.map(user => (
                                        <div key={user.username} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                            <Link to={`/profile/${user.username}`} onClick={() => setListType(null)} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-zinc-500 font-bold">{user.username.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm">{user.first_name || user.username}</div>
                                                    <div className="text-gray-500 text-xs">@{user.username}</div>
                                                </div>
                                            </Link>
                                            
                                            {currentUser && currentUser.username !== user.username && (
                                               <Link to={`/profile/${user.username}`} onClick={() => setListType(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-[#FFD700] transition-colors">
                                                   View
                                               </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Profile;
