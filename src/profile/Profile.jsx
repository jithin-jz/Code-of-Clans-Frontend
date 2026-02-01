import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import { notify } from "../services/notification";
import {
  Camera,
  Shield,
  Layout,
  Gift,
  Github,
  Code,
  Users,
  MapPin,
} from "lucide-react";
import { authAPI } from "../services/api";
import Loader from "../common/Loader";
import ProfileSkeleton from "./ProfileSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import ReferralSection from "./ReferralSection";
import IdentityCard from "./components/IdentityCard";
import StatsGrid from "./components/StatsGrid";
import CodingStats from "./components/CodingStats";
import Milestones from "./components/Milestones";

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

  const { updateProfile, followUser } = useUserStore();

  const isOwnProfile =
    !username || (currentUser && username === currentUser.username);

  // Determine profileUser based on ownership
  const [profileUser, setProfileUser] = useState(
    isOwnProfile ? currentUser : null,
  );
  const [loading, setLoading] = useState(true);
  const [userNotFound, setUserNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    github_username: "",
    leetcode_username: "",
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // Banner upload state effectively unused in current UI but kept for logic consistency
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const bannerInputRef = useRef(null);

  const [listType, setListType] = useState(null); // 'followers' or 'following' or null
  const [userList, setUserList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Use authAPI to fetch profile
  const { getUserProfile, getFollowers, getFollowing } = authAPI;

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

  const fetchUserList = async (type) => {
    setListLoading(true);
    setUserList([]);
    setListType(type); // Open modal immediately
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
      // Ensure we have the latest data from the store
      setProfileUser(currentUser);
      setEditForm({
        username: currentUser?.username || "",
        bio: currentUser?.profile?.bio || "",
        github_username: currentUser?.profile?.github_username || "",
        leetcode_username: currentUser?.profile?.leetcode_username || "",
      });
      setLoading(false);
    } else if (username) {
      fetchProfile(username);
    }
  }, [username, currentUser, isOwnProfile, fetchProfile]);

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);

    try {
      const updatedUser = await updateProfile({ type, file }, true);
      if (isOwnProfile) {
        setProfileUser(updatedUser);
      }
    } catch (error) {
      console.error(`Failed to upload ${type}`, error);
      notify.error(`Failed to upload ${type}`);
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
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
      console.error("Failed to update profile", error);
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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
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

  // Removed blocking loader
  // if (loading && !profileUser) {
  //   return <Loader isLoading={true} />;
  // }

  // if (!profileUser) return null; // We still might need this if we have absolutely nothing, but better to show skeleton

  // User Not Found UI
  if (userNotFound) {
    return (
      <div className="h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Users size={48} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">User Not Found</h1>
          <p className="text-gray-400 mb-6">
            This user may have changed their username or doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#FFD700] hover:bg-[#FDB931] text-black rounded-xl font-bold transition-all hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="h-screen w-full"
        >
          <ProfileSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-screen w-full bg-[#050505] text-white font-sans overflow-hidden content-center p-4 md:p-6 flex justify-center gap-6 selection:bg-[#FFD700] selection:text-black"
        >
          {/* Left Panel - Identity & Actions */}
          <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
            <IdentityCard
              profileUser={profileUser || {}} // Pass empty object if null to safely render skeleton
              loading={loading} // Pass loading state
              isOwnProfile={isOwnProfile}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              uploadingAvatar={uploadingAvatar}
              handleImageUpload={handleImageUpload}
              handleLogout={handleLogout}
              handleFollowToggle={handleFollowToggle}
              fetchUserList={fetchUserList}
            />
          </div>

          {/* Right Panel - Content */}
          <div className="w-full max-w-3xl bg-[#121212]/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top right, rgba(255, 215, 0, 0.05), transparent 40%)",
              }}
            ></div>

            {isEditing && isOwnProfile ? (
              <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
                <div className="max-w-2xl mx-auto">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-[#FFD700] transition-colors min-h-[80px] resize-none"
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
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              github_username: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              leetcode_username: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors placeholder-white/20"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-gray-400">
                          <Camera size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            Profile Banner
                          </div>
                          <div className="text-xs text-gray-500">
                            Used in search cards and previews
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => bannerInputRef.current.click()}
                        className="text-xs font-bold text-[#FFD700] hover:text-[#ffea7d] transition-colors px-3 py-1.5 bg-[#FFD700]/10 rounded-lg"
                      >
                        Change
                      </button>
                      <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "banner")}
                      />
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
                          {savingProfile ? "Saving..." : "Save Changes"}
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
                    { id: "overview", label: "Overview", icon: Layout },
                    ...(isOwnProfile
                      ? [{ id: "referral", label: "Referral", icon: Gift }]
                      : []),
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-white/10 text-white shadow-lg"
                          : "text-gray-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <tab.icon size={16} /> {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                  {activeTab === "overview" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                      <StatsGrid
                        profileUser={profileUser || {}}
                        isOwnProfile={isOwnProfile}
                        loading={loading}
                      />
                      <CodingStats
                        profileUser={profileUser || {}}
                        loading={loading}
                      />
                      <Milestones
                        profileUser={profileUser || {}}
                        loading={loading}
                      />
                    </div>
                  )}

                  {activeTab === "referral" && isOwnProfile && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <ReferralSection />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User List Modal */}
          <Dialog
            open={!!listType}
            onOpenChange={(open) => !open && setListType(null)}
          >
            <DialogContent className="bg-[#121212] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-0">
              <DialogHeader className="p-5 border-b border-white/5 bg-[#1a1a1a]">
                <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
                  {listType === "followers" ? (
                    <Users size={18} className="text-[#FFD700]" />
                  ) : (
                    <MapPin size={18} className="text-[#FFD700]" />
                  )}
                  {listType === "followers" ? "Followers" : "Following"}
                </DialogTitle>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {listLoading ? (
                  <div className="p-8 flex flex-col gap-4">
                    <SkeletonBase className="h-12 w-full rounded-xl" />
                    <SkeletonBase className="h-12 w-full rounded-xl" />
                    <SkeletonBase className="h-12 w-full rounded-xl" />
                  </div>
                ) : userList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No users found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {userList.map((user) => (
                      <div
                        key={user.username}
                        onClick={() => {
                          setListType(null);
                          navigate(`/profile/${user.username}`);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                      >
                        <img
                          src={
                            user.avatar_url || "https://github.com/shadcn.png"
                          }
                          alt={user.username}
                          className="w-10 h-10 rounded-full bg-black/50 object-cover border border-white/10 group-hover:border-[#FFD700]"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-[#FFD700] transition-colors text-sm">
                            {user.first_name || user.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Account Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="bg-[#121212] border border-white/10 text-white rounded-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-500 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Delete Account
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-2">
                  Are you sure you want to delete your account? This action
                  cannot be undone and you will lose all progress.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 mt-4">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  Yes, Delete My Account
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Profile;
