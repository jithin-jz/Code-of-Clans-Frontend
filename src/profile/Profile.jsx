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
  Loader2,
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
    const token = localStorage.getItem("access_token");
    if (token && !isConnected) {
      connect(token);
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
      notify.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) return navigate("/login");
    try {
      const data = await followUser(profileUser.username);
      setProfileUser((prev) => ({
        ...prev,
        is_following: data.is_following,
        followers_count: data.follower_count,
      }));
    } catch (error) {
      console.error("Failed to toggle follow", error);
    }
  };

  const handleListFollowToggle = async (targetUsername) => {
    if (!currentUser) return;
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
      if (targetUsername === profileUser.username) {
        setProfileUser((prev) => ({
          ...prev,
          is_following: data.is_following,
          followers_count: data.follower_count,
        }));
      }
    } catch (error) {
      console.error("Failed to toggle follow in list", error);
    }
  };

  const handleFollowSuggested = async (suggestedUsername) => {
    if (!currentUser) return navigate("/login");
    try {
      await followUser(suggestedUsername);
      setSuggestedUsers((prev) =>
        prev.filter((u) => u.username !== suggestedUsername),
      );
    } catch (error) {
      console.error("Failed to follow", error);
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
      notify.success(`Referral redeemed! +${result.xp_awarded} XP`);
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
      <div className="h-screen w-full bg-[#09090b] text-white flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <Users size={40} className="text-zinc-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">User Not Found</h1>
          <p className="text-zinc-500 mb-6 text-sm">
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
    <div className="h-screen w-full bg-[#09090b]">
      <ProfileSkeleton />
    </div>
  ) : (
    <div className="h-screen bg-[#09090b] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#09090b] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-base font-semibold">Profile</h1>
            </div>
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <Settings size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-10 w-10 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto no-scrollbar px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-4">
              {/* Profile Card */}
              <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
                {/* Banner Image */}
                <div className="h-32 bg-zinc-800/50 relative">
                  {profileUser?.profile?.banner_url ? (
                    <img
                      src={profileUser.profile.banner_url}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-r from-zinc-800 to-zinc-900" />
                  )}
                  {/* Avatar (Absolute positioned) */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <Avatar className="w-24 h-24 border-4 border-[#09090b]">
                      <AvatarImage
                        src={profileUser?.profile?.avatar_url}
                        alt={profileUser?.username}
                      />
                      <AvatarFallback className="bg-zinc-800 text-zinc-400 text-2xl">
                        {profileUser?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <>
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {uploadingAvatar ? (
                            <Loader2 size={14} className="animate-spin" />
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
                    {profileUser?.first_name || profileUser?.username}
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
                      <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
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
                      <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        Following
                      </div>
                    </button>
                  </div>

                  {/* Action Button */}
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      className={`w-full h-10 font-bold ${
                        profileUser?.is_following
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
                <Card className="bg-zinc-900/50 border-white/5">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Gift size={14} className="text-zinc-500" /> Referral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Copy Code */}
                    <div className="flex items-center justify-between bg-zinc-800/50 p-2.5 rounded-lg border border-white/5">
                      <code className="text-sm font-mono text-white px-1">
                        {currentUser.profile.referral_code}
                      </code>
                      <button
                        onClick={handleCopyReferral}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
                      >
                        {copied ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    {/* Redeem Input */}
                    {!currentUser.profile.is_referred && (
                      <div>
                        <h4 className="text-xs text-zinc-500 font-medium mb-2 uppercase tracking-wide">
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
                            className="flex-1 min-w-0 bg-zinc-800/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 placeholder-zinc-600"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isRedeeming || !referralCodeInput}
                            className="bg-zinc-800 text-white hover:bg-zinc-700 shrink-0"
                          >
                            {isRedeeming ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Go"
                            )}
                          </Button>
                        </form>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-4">
              {isEditing && isOwnProfile ? (
                /* Edit Form */
                <Card className="bg-zinc-900/50 border-white/5">
                  <CardHeader className="p-4 border-b border-white/5">
                    <CardTitle className="text-sm font-medium">
                      Edit Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            username: e.target.value,
                          })
                        }
                        className="w-full bg-zinc-800/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        className="w-full bg-zinc-800/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 min-h-[80px] resize-none"
                        placeholder="Write something about yourself..."
                      />
                    </div>

                    {/* Banner Upload */}
                    <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Camera size={16} className="text-zinc-500" />
                        <span className="text-sm text-zinc-400">
                          Profile Banner
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={uploadingBanner}
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-xs text-zinc-500 hover:text-white"
                      >
                        {uploadingBanner ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Change"
                        )}
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
                          className="text-zinc-500 hover:text-white text-sm"
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
                    <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5">
                      <button className="px-4 py-1.5 text-sm font-medium bg-zinc-800 text-white rounded-md shadow-sm">
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
            <div className="lg:col-span-1 space-y-6">
              {isOwnProfile && suggestedUsers.length > 0 && (
                <Card className="bg-zinc-900/50 border-white/5 sticky top-4 shadow-xl overflow-hidden">
                  <CardHeader className="py-3 px-4 border-b border-white/5 bg-zinc-900/50">
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
                            <div className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
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
                          className="text-xs font-medium text-blue-400 hover:text-white hover:bg-blue-500/10 h-8 px-3 rounded-lg"
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
          showClose={false}
          className="bg-zinc-900 border border-white/10 max-w-sm rounded-xl p-0"
        >
          <DialogHeader className="p-4 border-b border-white/5">
            <DialogTitle className="text-white text-sm font-medium">
              {listType === "followers" ? "Followers" : "Following"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {listLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500 mx-auto" />
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
                        <AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
                          {user.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.first_name || user.username}
                        </div>
                        <div className="text-xs text-zinc-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    {currentUser && user.username !== currentUser.username && (
                      <Button
                        size="sm"
                        variant={user.is_following ? "secondary" : "default"}
                        className={`h-8 text-xs ${user.is_following ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-white text-black hover:bg-zinc-200"}`}
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
        <DialogContent className="bg-zinc-900 border border-white/10 text-white rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" /> Delete Account
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm mt-2">
              This action cannot be undone. You will lose all your data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
              className="text-zinc-400 hover:text-white text-sm"
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
