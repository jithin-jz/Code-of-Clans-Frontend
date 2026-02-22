import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import useChatStore from "../stores/useChatStore";
import { notify } from "../services/notification";
import {
  Camera,
  Shield,
  Github,
  Code,
  Users,
  MapPin,
  ArrowLeft,
  Copy,
  Check,
  UserPlus,
  LogOut,
  Settings,
  Gift,
  Plus,
} from "lucide-react";
import { authAPI } from "../services/api";
import ProfileSkeleton from "./ProfileSkeleton";
import CreatePostDialog from "../posts/CreatePostDialog";
import PostGrid from "../posts/PostGrid";
import ContributionGraph from "./components/ContributionGraph";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { SkeletonBase } from "../common/SkeletonPrimitives";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser, logout, deleteAccount } = useAuthStore();
  const { updateProfile, followUser, redeemReferral } = useUserStore();
  const { connect, isConnected } = useChatStore(); // Added

  const isOwnProfile =
    !username || (currentUser && username === currentUser.username);

  // Connect to chat for sharing functionality
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);
  const [profileUser, setProfileUser] = useState(
    isOwnProfile ? currentUser : null,
  );
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const [editForm, setEditForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false); // Added banner loading state
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Referral Redeem State
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [contributionData, setContributionData] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [listType, setListType] = useState(null);
  const [userList, setUserList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const { getUserProfile, getFollowers, getFollowing, getSuggestedUsers } =
    authAPI;

  const fetchProfile = useCallback(
    async (targetUsername) => {
      setLoading(true);
      setUserNotFound(false);
      try {
        const response = await getUserProfile(targetUsername);
        setProfileUser(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setUserNotFound(true);
      } finally {
        setLoading(false);
      }
    },
    [getUserProfile],
  );

  const fetchContributions = useCallback(async (targetUsername) => {
    setLoadingContributions(true);
    try {
      const { authAPI: api } = await import("../services/api");
      const response = await api.getContributionHistory(targetUsername);
      setContributionData(response.data);
    } catch (error) {
      console.error("Failed to fetch contributions", error);
    } finally {
      setLoadingContributions(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      if (getSuggestedUsers) {
        const response = await getSuggestedUsers();
        setSuggestedUsers(response.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
    }
  }, [getSuggestedUsers]);

  const fetchUserList = async (type) => {
    setListLoading(true);
    setUserList([]);
    setListType(type);
    try {
      const apiCall = type === "followers" ? getFollowers : getFollowing;
      const response = await apiCall(profileUser.username);
      setUserList(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      setEditForm({
        username: currentUser?.username || "",
        first_name: currentUser?.first_name || "",
        last_name: currentUser?.last_name || "",
        bio: currentUser?.profile?.bio || "",
      });
      setLoading(false);
      fetchSuggestions();
      if (currentUser?.username) {
        fetchContributions(currentUser.username);
      }
    } else if (username) {
      fetchProfile(username);
      fetchContributions(username);
    }
  }, [
    username,
    currentUser,
    isOwnProfile,
    fetchProfile,
    fetchSuggestions,
    fetchContributions,
  ]);

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);
    if (type === "banner") setUploadingBanner(true);

    try {
      const updatedUser = await updateProfile({ type, file }, true);
      if (isOwnProfile) setProfileUser(updatedUser);
      notify.success(
        `${type === "avatar" ? "Profile picture" : "Banner"} updated!`,
      );
    } catch (error) {
      console.error(error);
      notify.error(`Failed to upload ${type}`);
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      if (type === "banner") setUploadingBanner(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updatedUser = await updateProfile(editForm);
      setProfileUser(updatedUser);
      setIsEditing(false);
      notify.success("Profile updated!");
    } catch (error) {
      console.error(error);
      const apiError =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to update profile";
      notify.error(apiError);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) return navigate("/login");
    const targetUsername = profileUser?.username;
    if (!targetUsername) return;

    const previousProfile = profileUser;
    const nextIsFollowing = !previousProfile?.is_following;
    const nextFollowerCount = Math.max(
      0,
      (previousProfile?.followers_count || 0) + (nextIsFollowing ? 1 : -1),
    );

    setProfileUser((prev) =>
      prev
        ? {
          ...prev,
          is_following: nextIsFollowing,
          followers_count: nextFollowerCount,
        }
        : prev,
    );

    try {
      const data = await followUser(targetUsername);
      setProfileUser((prev) =>
        prev
          ? {
            ...prev,
            is_following: data.is_following,
            followers_count: data.follower_count,
          }
          : prev,
      );
    } catch (error) {
      console.error("Failed to toggle follow", error);
      setProfileUser(previousProfile);
      notify.error("Failed to update follow status.");
    }
  };

  const handleListFollowToggle = async (targetUsername) => {
    if (!currentUser) return;
    const previousList = userList;
    const previousProfile = profileUser;
    const targetUser = previousList.find((u) => u.username === targetUsername);
    const optimisticFollowState = targetUser
      ? !targetUser.is_following
      : null;

    if (optimisticFollowState !== null) {
      setUserList((prev) =>
        prev.map((u) =>
          u.username === targetUsername
            ? { ...u, is_following: optimisticFollowState }
            : u,
        ),
      );
    }

    if (targetUsername === previousProfile?.username) {
      setProfileUser((prev) =>
        prev
          ? {
            ...prev,
            is_following: !previousProfile?.is_following,
            followers_count: Math.max(
              0,
              (previousProfile?.followers_count || 0) +
              (previousProfile?.is_following ? -1 : 1),
            ),
          }
          : prev,
      );
    }

    try {
      const data = await followUser(targetUsername);
      setUserList((prev) =>
        prev.map((u) => {
          if (u.username === targetUsername) {
            return { ...u, is_following: data.is_following };
          }
          return u;
        }),
      );

      // Update main profile stats if we are following/unfollowing the displayed user
      if (targetUsername === profileUser?.username) {
        setProfileUser((prev) =>
          prev
            ? {
              ...prev,
              is_following: data.is_following,
              followers_count: data.follower_count,
            }
            : prev,
        );
      }
    } catch (error) {
      console.error("Failed to toggle follow in list", error);
      setUserList(previousList);
      if (targetUsername === previousProfile?.username) {
        setProfileUser(previousProfile);
      }
      notify.error("Failed to update follow status.");
    }
  };

  const handleFollowSuggested = async (suggestedUsername) => {
    if (!currentUser) return navigate("/login");
    const previousSuggestedUsers = suggestedUsers;
    setSuggestedUsers((prev) =>
      prev.filter((u) => u.username !== suggestedUsername),
    );

    try {
      await followUser(suggestedUsername);
    } catch (error) {
      console.error("Failed to follow", error);
      setSuggestedUsers(previousSuggestedUsers);
      notify.error("Failed to follow user.");
    }
  };

  const handleCopyReferral = () => {
    if (currentUser?.profile?.referral_code) {
      navigator.clipboard.writeText(currentUser.profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRedeemReferral = async (e) => {
    e.preventDefault();
    if (!referralCodeInput.trim()) return;

    setIsRedeeming(true);
    try {
      const result = await redeemReferral(referralCodeInput);
      const redeemerXp = result.redeemer_xp_awarded ?? result.xp_awarded;
      const referrerXp = result.referrer_xp_awarded ?? 100;
      notify.success(
        `Referral redeemed! You got +${redeemerXp} XP and your referrer got +${referrerXp} XP.`,
      );
      setReferralCodeInput("");
      // Update local user state immediately to reflect new XP and redeemed status
      // (Handled by store, but we might want to refresh visible UI if dependent)
    } catch (error) {
      notify.error("Failed to redeem: " + error.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate("/login");
    } catch (err) {
      notify.error(err.message);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (userNotFound) {
    return (
      <div className="h-screen w-full bg-[#0b1119] text-white flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-[#162338] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Users size={40} className="text-slate-500" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">User Not Found</h1>
          <p className="text-slate-400 mb-6 text-sm">
            This user may have changed their username or doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-white text-black hover:bg-zinc-200"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return loading ? (
    <div className="h-screen w-full bg-[#0b1119]">
      <ProfileSkeleton />
    </div>
  ) : (
    <div className="relative min-h-screen overflow-x-hidden w-full max-w-[100vw] pb-20 sm:pb-0 text-white flex flex-col">
      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-4 min-w-0">
              {/* Profile Card */}
              <Card className="bg-[#0f1b2e]/70 border-[#7ea3d9]/20 overflow-hidden">
                {/* Banner Image */}
                <div className="h-32 bg-[#162338]/40 relative">
                  {profileUser?.profile?.banner_url ? (
                    <img
                      src={profileUser.profile.banner_url}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-r from-[#162338] to-[#0f1b2e]" />
                  )}

                  {/* Profile Controls Overlay on Banner */}
                  <div className="absolute top-3 px-3 w-full flex items-center justify-between pointer-events-none">
                    <div className="pointer-events-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg transition-all"
                      >
                        <ArrowLeft size={16} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                      {isOwnProfile && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(!isEditing)}
                            className="h-8 w-8 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-lg transition-all"
                          >
                            <Settings size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="h-8 w-8 text-white/80 hover:text-red-400 bg-black/20 hover:bg-red-500/20 backdrop-blur-md rounded-lg transition-all"
                          >
                            <LogOut size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Avatar (Absolute positioned) */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <Avatar className="w-24 h-24 border-4 border-[#0b1119]">
                      <AvatarImage
                        src={profileUser?.profile?.avatar_url}
                        alt={profileUser?.username}
                      />
                      <AvatarFallback className="bg-[#162338] text-slate-300 text-2xl">
                        {profileUser?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <>
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-[#162338] border border-white/15 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {uploadingAvatar ? (
                            <SkeletonBase className="w-3.5 h-3.5 rounded-full bg-white/20" />
                          ) : (
                            <Camera size={14} />
                          )}
                        </button>
                        <input
                          type="file"
                          ref={avatarInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "avatar")}
                        />
                      </>
                    )}
                  </div>
                </div>

                <CardContent className="pt-16 pb-6 px-6 text-center">
                  {/* Name */}
                  <h2 className="text-xl font-bold text-white mb-1">
                    {[profileUser?.first_name, profileUser?.last_name]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || profileUser?.username}
                  </h2>
                  {/* Username Removed as requested */}
                  {/* <p className="text-sm text-zinc-500 mb-4">
                          @{profileUser?.username}
                        </p> */}

                  {/* Bio */}
                  {profileUser?.profile?.bio &&
                    profileUser.profile.bio !== "User" && (
                      <p className="text-sm text-zinc-400 mt-2 mb-6 max-w-[240px] mx-auto leading-relaxed">
                        {profileUser.profile.bio}
                      </p>
                    )}

                  {!profileUser?.profile?.bio && <div className="mb-4"></div>}

                  {/* Follow/Following Stats */}
                  <div className="flex items-center justify-center gap-8 mb-6 border-t border-white/5 pt-4">
                    <button
                      onClick={() => fetchUserList("followers")}
                      className="text-center group"
                    >
                      <div className="text-lg font-bold text-white group-hover:text-zinc-300 transition-colors">
                        {profileUser?.followers_count || 0}
                      </div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Followers
                      </div>
                    </button>
                    <button
                      onClick={() => fetchUserList("following")}
                      className="text-center group"
                    >
                      <div className="text-lg font-bold text-white group-hover:text-zinc-300 transition-colors">
                        {profileUser?.following_count || 0}
                      </div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Following
                      </div>
                    </button>
                  </div>

                  {/* Action Button */}
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      className={`w-full h-10 font-bold ${profileUser?.is_following
                        ? "bg-zinc-800 text-white hover:bg-zinc-700"
                        : "bg-white text-black hover:bg-zinc-200"
                        }`}
                    >
                      {profileUser?.is_following ? "Following" : "Follow"}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Referral Section - Optimized */}
              {isOwnProfile && currentUser?.profile?.referral_code && (
                <Card className="bg-[#0f1b2e]/70 border-[#7ea3d9]/20">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Gift size={14} className="text-slate-400" /> Referral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Copy Code */}
                    <div className="flex items-center justify-between bg-[#162338]/50 p-2.5 rounded-lg border border-white/10">
                      <code className="text-sm font-mono text-white px-1">
                        {currentUser.profile.referral_code}
                      </code>
                      <button
                        onClick={handleCopyReferral}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white"
                      >
                        {copied ? (
                          <Check size={14} className="text-[#00af9b]" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    {/* Redeem Input */}
                    {!currentUser.profile.is_referred && (
                      <div>
                        <h4 className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
                          Redeem Code
                        </h4>
                        <form
                          onSubmit={handleRedeemReferral}
                          className="flex gap-2 w-full"
                        >
                          <input
                            type="text"
                            value={referralCodeInput}
                            onChange={(e) =>
                              setReferralCodeInput(e.target.value)
                            }
                            placeholder="Enter code"
                            className="flex-1 min-w-0 bg-[#162338]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 placeholder-slate-500"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isRedeeming || !referralCodeInput}
                            className="bg-[#162338] text-white hover:bg-[#1b2a40] shrink-0"
                          >
                            {isRedeeming ? "..." : "Go"}
                          </Button>
                        </form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-4 min-w-0">
              {isEditing && isOwnProfile ? (
                /* Edit Form */
                <Card className="bg-[#0f1b2e]/70 border-[#7ea3d9]/20">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-medium">
                      Edit Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400">First Name</label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full bg-[#162338]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400">Last Name</label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full bg-[#162338]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            username: e.target.value,
                          })
                        }
                        className="w-full bg-[#162338]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        className="w-full bg-[#162338]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 min-h-[80px] resize-none"
                        placeholder="Write something about yourself..."
                      />
                    </div>

                    {/* Banner Upload */}
                    <div className="flex items-center justify-between p-3 bg-[#162338]/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Camera size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-300">
                          Profile Banner
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={uploadingBanner}
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-xs text-slate-300 hover:text-white"
                      >
                        {uploadingBanner ? "Saving..." : "Change"}
                      </Button>
                      <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "banner")}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        <Shield size={14} className="mr-1" />
                        Delete Account
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setIsEditing(false)}
                          className="text-slate-300 hover:text-white text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="bg-white text-black hover:bg-zinc-200 text-sm"
                        >
                          {savingProfile ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Main Content Area */
                <div className="space-y-6">
                  {/* Tabs / Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex bg-[#0f1b2e]/70 p-1 rounded-lg border border-white/10">
                      <button className="px-4 py-1.5 text-sm font-medium bg-[#162338] text-white rounded-md shadow-sm">
                        Posts
                      </button>
                      {/* Future: Saved Tab */}
                    </div>

                    {isOwnProfile && (
                      <Button
                        onClick={() => setCreatePostOpen(true)}
                        size="sm"
                        className="bg-white text-black hover:bg-zinc-200 gap-2"
                      >
                        <Plus size={16} />
                        Create Post
                      </Button>
                    )}
                  </div>

                  {/* Contribution Graph */}
                  <ContributionGraph
                    data={contributionData}
                    loading={loadingContributions}
                  />

                  {/* Posts Grid */}
                  <PostGrid
                    username={profileUser?.username || username}
                    refreshTrigger={refreshPosts}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Suggestions */}
            <div className="lg:col-span-1 space-y-6 min-w-0">
              {isOwnProfile && suggestedUsers.length > 0 && (
                <Card className="bg-[#0f1b2e]/70 border-[#7ea3d9]/20 sticky top-4 shadow-xl overflow-hidden">
                  <CardHeader className="py-3 px-4 border-b border-white/10 bg-[#0f1b2e]/70">
                    <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center h-6">
                      Suggested for you
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {suggestedUsers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between group"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => navigate(`/profile/${user.username}`)}
                        >
                          <Avatar className="w-10 h-10 shrink-0 border border-white/10 shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-medium">
                              {user.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <div className="text-sm font-semibold text-white truncate group-hover:text-[#00af9b] transition-colors">
                              {user.username}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              Suggested for you
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowSuggested(user.username);
                          }}
                          variant="ghost"
                          className="text-xs font-medium text-[#00af9b] hover:text-white hover:bg-[#00af9b]/10 h-8 px-3 rounded-lg"
                        >
                          Follow
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onPostCreated={() => setRefreshPosts((prev) => prev + 1)}
      />

      {/* User List Modal */}
      <Dialog
        open={!!listType}
        onOpenChange={(open) => !open && setListType(null)}
      >
        <DialogContent
          hideOverlay
          showClose={false}
          className="bg-[#0f1b2e] border border-white/15 max-w-sm rounded-xl p-0"
        >
          <DialogHeader className="p-4 border-b border-white/5">
            <DialogTitle className="text-white text-sm font-medium">
              {listType === "followers" ? "Followers" : "Following"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {listLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <SkeletonBase className="w-9 h-9 rounded-full" />
                      <div className="space-y-2 w-full">
                        <SkeletonBase className="h-3 w-24 rounded" />
                        <SkeletonBase className="h-2.5 w-16 rounded" />
                      </div>
                    </div>
                    <SkeletonBase className="h-8 w-16 rounded-md" />
                  </div>
                ))}
              </div>
            ) : userList.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No users found.
              </div>
            ) : (
              <div>
                {userList.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => {
                        setListType(null);
                        navigate(`/profile/${user.username}`);
                      }}
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          src={user.avatar_url}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-[#162338] text-slate-300 text-sm">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.first_name || user.username}
                        </div>
                        <div className="text-xs text-slate-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    {currentUser && user.username !== currentUser.username && (
                      <Button
                        size="sm"
                        variant={user.is_following ? "secondary" : "default"}
                        className={`h-8 text-xs ${user.is_following ? "bg-[#162338] text-slate-300 hover:bg-[#1b2a40]" : "bg-white text-black hover:bg-slate-200"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleListFollowToggle(user.username);
                        }}
                      >
                        {user.is_following ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0f1b2e] border border-white/15 text-white rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" /> Delete Account
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-2">
              This action cannot be undone. You will lose all your data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-slate-300 hover:text-white text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Profile;
