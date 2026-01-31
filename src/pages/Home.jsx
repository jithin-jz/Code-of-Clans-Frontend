import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { generateLevels } from "../constants/levelData.jsx";

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
    const visualLevels = generateLevels(); // 53 Levels + 1 Certificate

    return visualLevels.map((visual) => {
      // Find matching API data by order
      const apiData = apiLevels.find((l) => l.order === visual.id);

      // Certificate Special Case (Last Node)
      if (visual.type === 'CERTIFICATE') {
          // Check if all 53 levels are completed
          const allCompleted = apiLevels.length >= 53 && apiLevels.every(l => l.status === 'COMPLETED');
          return {
              ...visual,
              unlocked: allCompleted, 
              completed: false, // We'll fetch actual cert status later
              type: 'CERTIFICATE'
          };
      }

      if (apiData) {
        return {
          ...visual,
          ...apiData,
          unlocked: apiData.status === "UNLOCKED" || apiData.status === "COMPLETED",
          completed: apiData.status === "COMPLETED",
          stars: apiData.stars || 0,
          slug: apiData.slug,
          type: 'LEVEL'
        };
      }

      // Default Fallback (Locked)
      return {
        ...visual,
        unlocked: false,
        stars: 0,
        type: 'LEVEL'
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

  if (isLoading) {
    return <HomeSkeleton />;
  }

  const handleLevelClick = async (level) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (level.type === 'CERTIFICATE') {
        if (level.unlocked) {
             const { challengesApi } = await import("../services/challengesApi");
             try {
                 await challengesApi.claimCertificate(); 
                 // navigate('/certificate/view/' + cert.id);
                 alert("Certificate Claimed! (View Page WIP)"); 
             } catch (e) {
                 if(e.response && e.response.status === 400 && e.response.data.error === 'Certificate already claimed') {
                     alert("You already have this certificate!");
                 } else {
                     alert("Complete all levels first!");
                 }
             }
        }
        return;
    }

    if (level.unlocked) {
      setSelectedLevel(level);
    }
  };

  return (
    <div className="h-screen relative select-none overflow-hidden bg-[#0a0a0a] text-white">
      {/* Background Texture */}

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

      <LevelMap levels={levels} handleLevelClick={handleLevelClick} isLeaderboardOpen={isLeaderboardOpen} />

      {/* Level Modal */}
      {selectedLevel && (
        <LevelModal
          selectedLevel={selectedLevel}
          onClose={() => setSelectedLevel(null)}
        />
      )}
    </div>
  );
};

export default Home;
