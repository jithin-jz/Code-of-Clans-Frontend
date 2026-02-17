import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  LogOut,
  Camera,
  Shield,
  Calendar,
  Edit3,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";

const IdentityCard = ({
  profileUser,
  isOwnProfile,
  isEditing,
  setIsEditing,
  uploadingAvatar,
  handleImageUpload,
  handleLogout,
  handleFollowToggle,
  fetchUserList,
  loading,
}) => {
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden bg-[#121212] rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center h-[600px] animate-pulse">
         <div className="absolute inset-x-0 top-0 h-40 bg-white/5"></div>
         <div className="relative z-10 mt-20 w-32 h-32 rounded-3xl bg-white/10 border-2 border-white/5"></div>
         <div className="mt-4 h-6 w-48 bg-white/10 rounded-lg"></div>
         <div className="mt-6 w-full px-6 flex gap-2">
            <div className="h-16 flex-1 bg-white/5 rounded-2xl"></div>
            <div className="h-16 flex-1 bg-white/5 rounded-2xl"></div>
         </div>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
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
          <div className="w-full h-full bg-linear-to-br from-[#1f1f1f]/40 via-[#1a1a1a]/40 to-[#121212]"></div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#121212] via-[#121212]/80 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center h-full">
        {/* Navigation */}
        <div className="absolute top-[-10px] left-[-10px]">
          <button
            onClick={() => navigate("/home")}
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
              <LogOut
                size={18}
                className="text-red-400 group-hover:text-red-300"
              />
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
              src={
                profileUser.profile?.avatar_url ||
                "https://github.com/shadcn.png"
              }
              alt="Avatar"
              className="w-full h-full object-cover rounded-[20px]"
              onError={(e) => {
                e.target.style.border = "2px solid red";
              }}
            />

            {isOwnProfile && (
              <div
                onClick={() => avatarInputRef.current.click()}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 rounded-[20px]"
              >
                <Camera className="text-white drop-shadow-md" size={24} />
              </div>
            )}
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "avatar")}
            />
          </div>

          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-[#121212] p-1 rounded-xl">
            <div className="bg-[#ffa116] w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-xs shadow-lg shadow-[#ffa116]/20">
              {Math.floor((profileUser.profile?.xp || 0) / 1000) + 1}
            </div>
          </div>
        </div>

        {/* Name & Handle */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            {profileUser.first_name || profileUser.username}
            <Shield size={16} className="text-[#ffa116] fill-[#ffa116]/20" />
          </h1>
        </div>

        {/* Follow Stats */}
        <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden w-full mb-6 border border-white/5 shrink-0">
          <button
            onClick={() => fetchUserList("followers")}
            className="p-3 hover:bg-white/5 transition-colors text-center group"
          >
            <div className="text-lg font-bold text-white group-hover:text-[#ffa116] transition-colors">
              {profileUser.followers_count || 0}
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Followers
            </div>
          </button>
          <button
            onClick={() => fetchUserList("following")}
            className="p-3 hover:bg-white/5 transition-colors text-center group"
          >
            <div className="text-lg font-bold text-white group-hover:text-[#ffa116] transition-colors">
              {profileUser.following_count || 0}
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Following
            </div>
          </button>
        </div>

        {/* Bio */}
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
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                isEditing
                  ? "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  : "bg-[#ffa116] text-black hover:bg-[#ff8f00]"
              )}
            >
              {isEditing ? (
                <>
                  <X size={16} /> Cancel Editing
                </>
              ) : (
                <>
                  <Edit3 size={16} /> Edit Profile
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                profileUser.is_following
                  ? "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  : "bg-[#ffa116] text-white hover:bg-[#ff8f00]"
              )}
            >
              {profileUser.is_following ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 w-full flex justify-center shrink-0">
          <div className="text-xs text-gray-600 flex items-center gap-2 font-medium">
            <Calendar size={12} />
            Joined{" "}
            {profileUser.date_joined ? new Date(profileUser.date_joined).toLocaleDateString(
              undefined,
              {
                month: "short",
                year: "numeric",
              }
            ) : "Unknown"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(IdentityCard);
