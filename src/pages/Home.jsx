import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useAuthStore from "../stores/useAuthStore";
import useChallengesStore from "../stores/useChallengesStore";

// Components
import HomeSkeleton from "./HomeSkeleton";
import LevelModal from "../game/LevelModal";
import ProfilePanel from "../home/ProfilePanel";
import ChatDrawer from "../home/ChatDrawer";
import LeaderboardDrawer from "../home/LeaderboardDrawer";
import ShopButton from "../home/ShopButton";
import RightSideUI from "../home/RightSideUI";
import NotificationDrawer from "../home/NotificationDrawer";

import LevelMap from "../home/LevelMap";
import CheckInReward from "../home/CheckInReward";
import { checkInApi } from "../services/checkInApi";
import { challengesApi } from "../services/challengesApi";
import CertificateModal from "../components/CertificateModal";

// Data
import { ICONS, generateLevels } from "../constants/levelData.jsx";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Use centralized challenges store
  const {
    challenges: apiLevels,
    isLoading,
    fetchChallenges,
  } = useChallengesStore();

  // Local UI State
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [hasUnclaimedReward, setHasUnclaimedReward] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [userCertificate, setUserCertificate] = useState(null);

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

  // Fetch levels when user is authenticated
  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user, fetchChallenges]);

  // Check certificate eligibility when challenges are loaded
  useEffect(() => {
    const checkCertificate = async () => {
      if (!user || !apiLevels || apiLevels.length === 0) return;

      try {
        const eligibility = await challengesApi.checkCertificateEligibility();

        // If eligible and has certificate, try to fetch it
        if (eligibility.has_certificate) {
          const certData = await challengesApi.getMyCertificate();
          setUserCertificate(certData);

          // Auto-show modal if they just earned it (check local storage to avoid annoying repeated shows)
          const shownKey = `cert_shown_${user.id}`;
          if (!localStorage.getItem(shownKey)) {
            setCertificateModalOpen(true);
            localStorage.setItem(shownKey, "true");
          }
        }
      } catch (error) {
        console.error("Failed to check certificate:", error);
      }
    };

    checkCertificate();
  }, [user, apiLevels]);

  // Initialize Levels (Merge Visuals with API Data)
  const levels = useMemo(() => {
    // If no levels from API, provide fallback for background
    if (!apiLevels || apiLevels.length === 0) {
      return generateLevels(54).map((l) => ({
        ...l,
        status: l.id === 1 ? "UNLOCKED" : "LOCKED",
        unlocked: l.id === 1,
        completed: false,
      }));
    }

    // Unified Processing for ALL Levels
    // const visualPositions = generateLevels(Math.max(53, maxOrder));

    // We trust the API to return the correct order.
    // We map them to visuals dynamically.

    // Sort API levels by order
    const sortedApiLevels = [...apiLevels].sort((a, b) => a.order - b.order);

    return sortedApiLevels.map((apiData) => {
      const isCertificate = apiData.order === 54;
      return {
        id: apiData.order,
        order: apiData.order,
        name: isCertificate
          ? "Professional Certificate"
          : `Level ${apiData.order}`,
        slug: apiData.slug,
        icon: ICONS[(apiData.order - 1) % ICONS.length],
        stars: apiData.stars || 0,
        status: apiData.status,
        unlocked:
          apiData.status === "UNLOCKED" || apiData.status === "COMPLETED",
        completed: apiData.status === "COMPLETED",
        type: isCertificate ? "CERTIFICATE" : "LEVEL",
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
      if (level.order === 54) {
        setCertificateModalOpen(true);
      } else {
        setSelectedLevel(level);
      }
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
            <NotificationDrawer
              isOpen={isNotificationOpen}
              onClose={() => setNotificationOpen(false)}
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
              setNotificationOpen={setNotificationOpen}
              hasUnclaimedReward={hasUnclaimedReward}
            />
            <CheckInReward
              isOpen={checkInOpen}
              onClose={() => setCheckInOpen(false)}
              onClaim={() => setHasUnclaimedReward(false)}
            />

            <LevelMap
              user={user}
              levels={levels}
              handleLevelClick={handleLevelClick}
              isLeaderboardOpen={isLeaderboardOpen}
              isNotificationOpen={isNotificationOpen}
            />

            {/* Level Modal */}
            {selectedLevel && (
              <LevelModal
                selectedLevel={selectedLevel}
                onClose={() => setSelectedLevel(null)}
              />
            )}

            {/* Certificate Modal */}
            <CertificateModal
              isOpen={certificateModalOpen}
              onClose={() => setCertificateModalOpen(false)}
              certificate={userCertificate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
