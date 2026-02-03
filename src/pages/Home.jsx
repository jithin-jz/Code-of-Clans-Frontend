import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../stores/useAuthStore";

// Components

// import Loader from '../common/Loader';
import HomeSkeleton from "./HomeSkeleton";
import LevelModal from "../game/LevelModal";
import ProfilePanel from "../home/ProfilePanel";
import ChatDrawer from "../home/ChatDrawer";
import LeaderboardDrawer from "../home/LeaderboardDrawer";
import ShopButton from "../home/ShopButton";
import RightSideUI from "../home/RightSideUI";

import LevelMap from "../home/LevelMap";
import CheckInReward from "../home/CheckInReward";
import { checkInApi } from "../services/checkInApi";

// Data
import { ICONS } from "../constants/levelData.jsx";

// Hooks
const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  // Audio Removed

  // State
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnclaimedReward, setHasUnclaimedReward] = useState(false);

  // Level Data State
  const [apiLevels, setApiLevels] = useState([]);

  // Check for daily reward status on mount
  useEffect(() => {
    const checkRewardStatus = async () => {
      if (!user) return;
      try {
        const data = await checkInApi.getCheckInStatus();
        // If not checked in today, show red dot
        setHasUnclaimedReward(!data.checked_in_today);
      } catch (error) {
        console.error("Failed to check reward status:", error);
      }
    };
    checkRewardStatus();
  }, [user]);

  // Fetch Levels
  useEffect(() => {
    const fetchLevels = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        // Dynamic Import to avoid circular dependency if any
        const { challengesApi } = await import("../services/challengesApi");
        const data = await challengesApi.getAll();
        setApiLevels(data);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLevels();
  }, [user]);

  // Initialize Levels (Merge Visuals with API Data)
  const levels = useMemo(() => {
    // Unified Processing for ALL Levels
    // const visualPositions = generateLevels(Math.max(53, maxOrder));

    // We trust the API to return the correct order.
    // We map them to visuals dynamically.

    // Sort API levels by order
    const sortedApiLevels = [...apiLevels].sort((a, b) => a.order - b.order);

    return sortedApiLevels.map((apiData) => {
      // Find matching position/visual config if it exists
      // visualPositions are 0-indexed in the array, but correspond to order 1..N
      // visualPositions[0] is usually Level 1 IF the generator returns sorted array?
      // Wait, generateLevels returns an array of objects with { id: 1, ... }

      // const visual = visualPositions.find((v) => v.id === apiData.order);

      // If we have a visual config (position), use it. otherwise null (Grid fallback handled in LevelMap?)
      // Note: LevelMap uses a grid layout in the screenshot, so positions might be ignored anyway?
      // Checking LevelMap code earlier: "Standard Grid Layout" ... "grid grid-cols-9".
      // It seems LevelMap IGNORES the x/y positions from generateLevels entirely and just uses CSS grid!
      // This makes things MUCH easier. We just need a flat list.

      return {
        id: apiData.order,
        order: apiData.order,
        name: `Level ${apiData.order}`,
        slug: apiData.slug,
        icon: ICONS[(apiData.order - 1) % ICONS.length],
        stars: apiData.stars || 0,
        status: apiData.status,
        unlocked:
          apiData.status === "UNLOCKED" || apiData.status === "COMPLETED",
        completed: apiData.status === "COMPLETED",
        type: "LEVEL",
        ...apiData,
      };
    });
  }, [apiLevels]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setChatOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setLeaderboardOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (user) {
          navigate("/profile");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
        e.preventDefault();
        if (user) {
          navigate("/shop");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (user) {
          navigate("/store");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLevelClick = async (level) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (level.unlocked) {
      setSelectedLevel(level);
    }
  };

  return (
    <div className="h-screen relative select-none overflow-hidden bg-[#0a0a0a] text-white">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50"
          >
            <HomeSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full relative"
          >
            {/* Background Texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

            <ProfilePanel user={user} />
            <ChatDrawer
              isChatOpen={isChatOpen}
              setChatOpen={setChatOpen}
              user={user}
            />
            <LeaderboardDrawer
              isLeaderboardOpen={isLeaderboardOpen}
              setLeaderboardOpen={setLeaderboardOpen}
            />
            <ShopButton />
            <RightSideUI
              user={user}
              handleLogout={handleLogout}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              checkInOpen={checkInOpen}
              setCheckInOpen={setCheckInOpen}
              setLeaderboardOpen={setLeaderboardOpen}
              hasUnclaimedReward={hasUnclaimedReward}
            />
            <CheckInReward
              isOpen={checkInOpen}
              onClose={() => setCheckInOpen(false)}
              onClaim={() => setHasUnclaimedReward(false)}
            />

            <LevelMap
              levels={levels}
              handleLevelClick={handleLevelClick}
              isLeaderboardOpen={isLeaderboardOpen}
            />

            {/* Level Modal */}
            {selectedLevel && (
              <LevelModal
                selectedLevel={selectedLevel}
                onClose={() => setSelectedLevel(null)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
