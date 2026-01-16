import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { notify } from '../services/notification';
import { 
    Users, Camera, Trophy, MapPin, Calendar, Edit3, Shield, Star, Sword, Crown, Home, LogOut, Sparkles, X, UserMinus, UserPlus, ChevronRight, Layout, Gift, Github, Code
} from 'lucide-react';
import { authAPI } from '../services/api';
import Loader from '../common/Loader';
import ReferralSection from './ReferralSection';
import { generateLevels } from '../constants/levelData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { GitHubCalendar } from 'react-github-calendar';

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
        github_username: '',
        leetcode_username: '',
    });

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

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
                github_username: currentUser?.profile?.github_username || '',
                leetcode_username: currentUser?.profile?.leetcode_username || '',
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

    const handleDeleteAccount = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteAccount();
            navigate('/login');
        } catch (err) {
            notify.error(err.message);
        }
    };

    if (loading && !profileUser) {
        return <Loader isLoading={true} />;
    }

    if (!profileUser) return null;

    return (
        <div className="h-screen w-full bg-[#050505] text-white font-sans overflow-hidden content-center p-4 md:p-6 flex gap-6 selection:bg-[#FFD700] selection:text-black">
            
            {/* Left Panel - Identity & Actions */}
            <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
                {/* Identity Card */}
                <div className="w-full h-full bg-[#121212] border border-white/5 rounded-3xl p-6 relative flex flex-col items-center text-center shadow-2xl overflow-hidden">
                    
                    {/* Banner Background */}
                    <div className="absolute inset-0 z-0">
                        {profileUser.profile?.banner_url ? (
                            <img 
                                src={profileUser.profile.banner_url} 
                                alt="Banner" 
                                className="w-full h-full object-cover opacity-50 transition-transform duration-700 hover:scale-110" 
                            />
                        ) : (
                             <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-[#121212]"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
                    </div>

                    {/* Content Container (z-index to sit above banner) */}
                    <div className="relative z-10 w-full flex flex-col items-center h-full">
                    
                    {/* Navigation (Mobile/Compact) */}
                    <div className="absolute top-[-10px] left-[-10px]">
                        <button 
                            onClick={() => navigate('/home')}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                        >
                            <Home size={18} className="text-gray-400 group-hover:text-white" />
                        </button>
                    </div>

                    {isOwnProfile && (
                        <div className="absolute top-4 right-4">
                             <button 
                                onClick={handleLogout}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors group"
                            >
                                <LogOut size={18} className="text-red-400 group-hover:text-red-300" />
                            </button>
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="relative mt-4 mb-4 group">
                        <div className="w-32 h-32 rounded-3xl border-2 border-white/10 p-1 bg-[#1a1a1a] relative overflow-hidden">
                            {uploadingAvatar && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                                    <div className="relative w-6 h-6">
                                        <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
                                        <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                </div>
                            )}
                            <img 
                                src={profileUser.profile?.avatar_url || "https://github.com/shadcn.png"} 
                                alt="Avatar" 
                                className="w-full h-full object-cover rounded-[20px]" 
                            />
                            
                            {isOwnProfile && (
                                <div 
                                    onClick={() => avatarInputRef.current.click()}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 rounded-[20px]"
                                >
                                    <Camera className="text-white drop-shadow-md" size={24} />
                                </div>
                            )}
                            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                        </div>
                        
                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#121212] p-1 rounded-xl">
                            <div className="bg-[#FFD700] w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-xs shadow-lg shadow-[#FFD700]/20">
                                {Math.floor((profileUser.profile?.xp || 0) / 1000) + 1}
                            </div>
                        </div>
                    </div>

                    {/* Name & Handle */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                            {profileUser.first_name || profileUser.username}
                            <Shield size={16} className="text-[#FFD700] fill-[#FFD700]/20" />
                        </h1>
                    </div>

                    {/* Follow Stats */}
                    <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden w-full mb-6 border border-white/5 shrink-0">
                        <button onClick={() => fetchUserList('followers')} className="p-3 hover:bg-white/5 transition-colors text-center group">
                            <div className="text-lg font-bold text-white group-hover:text-[#FFD700] transition-colors">{profileUser.followers_count || 0}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Followers</div>
                        </button>
                        <button onClick={() => fetchUserList('following')} className="p-3 hover:bg-white/5 transition-colors text-center group">
                            <div className="text-lg font-bold text-white group-hover:text-[#FFD700] transition-colors">{profileUser.following_count || 0}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Following</div>
                        </button>
                    </div>

                    {/* Bio (Moved from Overview) */}
                    {profileUser.profile?.bio && (
                        <div className="w-full text-center mb-6 px-4 flex-1 overflow-y-auto no-scrollbar flex items-center justify-center">
                            <p className="text-gray-300 italic text-sm leading-relaxed">
                                "{profileUser.profile.bio}"
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="w-full mt-auto">
                        {isOwnProfile ? (
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                                    isEditing 
                                        ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' 
                                        : 'bg-[#FFD700] text-black hover:bg-[#FDB931]'
                                }`}
                            >
                                {isEditing ? <><X size={16}/> Cancel Editing</> : <><Edit3 size={16}/> Edit Profile</>}
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

                    <div className="mt-6 pt-6 border-t border-white/5 w-full flex justify-center shrink-0">
                        <div className="text-xs text-gray-600 flex items-center gap-2 font-medium">
                            <Calendar size={12} />
                            Joined {new Date(profileUser.date_joined || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Content */}
            <div className="flex-1 bg-[#121212]/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                
                {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255, 215, 0, 0.05), transparent 40%)' }}></div>

                {isEditing && isOwnProfile ? (
                     <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Sparkles className="text-[#FFD700]" /> Customize Profile
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Bio</label>
                                    <textarea 
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-[#FFD700] transition-colors min-h-[160px] resize-none"
                                        placeholder="Tell your story..."
                                    />
                                </div>

                                {/* Coding Profiles Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                            <Github size={14} /> GitHub Username
                                        </label>
                                        <input 
                                            type="text" 
                                            value={editForm.github_username}
                                            onChange={(e) => setEditForm({...editForm, github_username: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-white/20"
                                            placeholder="username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                            <Code size={14} /> LeetCode Username
                                        </label>
                                        <input 
                                            type="text" 
                                            value={editForm.leetcode_username}
                                            onChange={(e) => setEditForm({...editForm, leetcode_username: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-white/20"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>

                                {/* Banner Upload (Simulated as cover image settings since actual banner is removed/hidden in this layout) */}
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-gray-400">
                                            <Camera size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Profile Banner</div>
                                            <div className="text-xs text-gray-500">Used in search cards and previews</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => bannerInputRef.current.click()}
                                        className="text-xs font-bold text-[#FFD700] hover:text-[#ffea7d] transition-colors px-3 py-1.5 bg-[#FFD700]/10 rounded-lg"
                                    >
                                        Change
                                    </button>
                                     <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                                </div>

                                <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        className="text-red-500 hover:text-red-400 text-sm font-bold hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <Shield size={14} /> Delete Account
                                    </button>

                                    <div className="flex gap-3">
                                         <button 
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={savingProfile}
                                            className="bg-[#FFD700] hover:bg-[#ffea7d] text-black px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-yellow-900/20 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Tabs Header */}
                        <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-black/20">
                            {[
                                { id: 'overview', label: 'Overview', icon: Layout },
                                ...(isOwnProfile ? [{ id: 'referral', label: 'Referral', icon: Gift }] : [])
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab.id 
                                            ? 'bg-white/10 text-white shadow-lg' 
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            
                            {activeTab === 'overview' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                                    {/* Stats Grid (More detailed) */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Level', value: Math.floor((profileUser.profile?.xp || 0) / 1000) + 1, icon: Crown, color: 'text-purple-400' },
                                            { label: 'Total XP', value: profileUser.profile?.xp?.toLocaleString() || 0, icon: Star, color: 'text-[#FFD700]' },
                                            { label: 'Followers', value: profileUser.followers_count || 0, icon: Users, color: 'text-blue-400' },
                                             { label: 'Following', value: profileUser.following_count || 0, icon: MapPin, color: 'text-green-400' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-col gap-2 hover:bg-white/5 transition-colors">
                                                <div className={`p-2 w-fit rounded-lg bg-white/5 ${stat.color}`}>
                                                    <stat.icon size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-xl font-black text-white">{stat.value}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{stat.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Coding Stats (Moved from Coding Tab) */}
                                    {(profileUser.profile?.github_username || profileUser.profile?.leetcode_username) && (
                                        <div className="w-full">
                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                                {/* GitHub Calendar */}
                                                {profileUser.profile?.github_username && (
                                                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 overflow-hidden flex flex-col justify-center">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                                <Github size={16} />
                                                                GitHub Activity
                                                            </div>
                                                            <a 
                                                                href={`https://github.com/${profileUser.profile.github_username}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-400 hover:underline"
                                                            >
                                                                @{profileUser.profile.github_username}
                                                            </a>
                                                        </div>
                                                        <div className="flex justify-center transform scale-100 origin-center overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&_*::-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none]">
                                                            <GitHubCalendar 
                                                                username={profileUser.profile.github_username} 
                                                                colorScheme="dark"
                                                                fontSize={10}
                                                                blockSize={5.5}
                                                                blockMargin={2}
                                                                theme={{
                                                                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* LeetCode Stats Card */}
                                                {profileUser.profile?.leetcode_username && (
                                                    <div className="bg-[#121212] border border-white/5 rounded-3xl p-4 flex flex-col relative overflow-hidden h-full justify-center">
                                                        <div className="flex items-center justify-between mb-3 relative z-10">
                                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                                <Code size={16} className="text-orange-500" />
                                                                LeetCode Stats
                                                            </div>
                                                            <a 
                                                                href={`https://leetcode.com/${profileUser.profile.leetcode_username}`}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-orange-400 hover:underline"
                                                            >
                                                                @{profileUser.profile.leetcode_username}
                                                            </a>
                                                        </div>

                                                        <div className="flex items-center justify-center relative z-10">
                                                            <img 
                                                                src={`https://leetcard.jacoblin.cool/${profileUser.profile.leetcode_username}?theme=dark&font=Inter`} 
                                                                alt="LeetCode Stats" 
                                                                className="w-full h-auto max-h-32 object-contain rounded-lg shadow-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Moved Tasks Section */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Completed Milestones</h3>
                                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                            {(() => {
                                                const levels = generateLevels();
                                                const currentXp = profileUser.profile?.xp || 0;
                                                const currentLevelId = Math.floor(currentXp / 1000) + 1;
                                                const completedLevels = levels.filter(l => l.id <= currentLevelId);
                                                
                                                if (completedLevels.length === 0) {
                                                    return (
                                                        <div className="col-span-full py-8 text-center text-gray-500 border border-white/5 rounded-2xl border-dashed">
                                                            <Trophy size={32} className="mx-auto mb-2 opacity-20" />
                                                            <p className="font-medium text-xs">No tasks completed yet.</p>
                                                        </div>
                                                    );
                                                }

                                                return completedLevels.map((level) => (
                                                    <div key={level.id} className="bg-[#121212] border border-white/5 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center transition-all hover:border-[#FFD700]/30 hover:-translate-y-1 group">
                                                        <div className="w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform text-white/50 group-hover:text-[#FFD700]">
                                                            {level.icon && React.cloneElement(level.icon, { size: 14 })}
                                                        </div>
                                                        <div className="text-[9px] font-bold text-[#FFD700] uppercase tracking-wider">LEVEL {level.id}</div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'referral' && isOwnProfile && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <ReferralSection />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* User List Modal using Shadcn Dialog */}
            <Dialog open={!!listType} onOpenChange={(open) => !open && setListType(null)}>
                <DialogContent className="bg-[#121212] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-0">
                    <DialogHeader className="p-5 border-b border-white/5 bg-[#1a1a1a]">
                        <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
                             {listType === 'followers' ? <Users size={18} className="text-[#FFD700]"/> : <MapPin size={18} className="text-[#FFD700]"/>}
                            {listType === 'followers' ? 'Followers' : 'Following'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {listLoading ? (
                            <div className="p-8 flex justify-center"><Loader isLoading={true} /></div>
                        ) : userList.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No users found.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {userList.map(user => (
                                    <div key={user.username} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-colors group">
                                        <Link to={`/profile/${user.username}`} onClick={() => setListType(null)} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-zinc-500 font-bold">{user.username.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm">{user.first_name || user.username}</div>
                                                <div className="text-gray-500 text-xs text-left">@{user.username}</div>
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

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-[#121212] border border-white/10 text-white sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 flex items-center gap-2">
                            <Shield size={20} /> Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 pt-2">
                            Are you sure you want to delete your account? This action cannot be undone and you will lose all your progress and data.
                        </DialogDescription>
                    </DialogHeader>
                     <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteDialogOpen(false)}
                            className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                            Delete Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
