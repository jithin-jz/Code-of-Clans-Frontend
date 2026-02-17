import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Shield, ChevronRight } from "lucide-react";

const ProfilePanel = ({ user }) => {
  return (
    <motion.div
      className="fixed left-6 top-5 z-30"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 22 }}
    >
      <Link to={user ? "/profile" : "/login"}>
        <div className="group min-w-[250px] rounded-2xl px-3 py-2.5 border border-white/10 bg-[#222222]/95 backdrop-blur-md hover:border-[#00af9b]/35 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/15 bg-[#303030] flex items-center justify-center">
                {user?.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-zinc-300" />
                )}
              </div>

              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-white">
                    {user?.username || "Guest"}
                  </p>
                  {user && (
                    <Shield
                      size={12}
                      className="text-[#f59e0b] fill-[#f59e0b]/20"
                    />
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {user ? "View profile" : "Sign in to continue"}
                </p>
              </div>
            </div>

            <ChevronRight
              size={15}
              className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProfilePanel;
