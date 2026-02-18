import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { toast } from "sonner";
import useAuthStore from "../stores/useAuthStore";
import useChallengesStore from "../stores/useChallengesStore";

// Components
import HomeSkeleton from "./HomeSkeleton";
import LevelModal from "../game/LevelModal";
import {
  ChatDrawer,
  LeaderboardDrawer,
  HomeTopNav,
  NotificationDrawer,
  ChallengeMap,
  DailyCheckInModal,
} from "../home";
import { checkInApi } from "../services/checkInApi";
import { challengesApi } from "../services/challengesApi";
import CertificateModal from "../components/CertificateModal";

// Data
import { ICONS, generateLevels } from "../constants/levelData.jsx";

const CERTIFICATE_SLUG = "certificate";

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
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [hasUnclaimedReward, setHasUnclaimedReward] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [userCertificate, setUserCertificate] = useState(null);
  const [isCertificateLoading, setIsCertificateLoading] = useState(false);

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

        // Fetch/create certificate once user is eligible.
        if (eligibility.has_certificate || eligibility.eligible) {
          const certData = await challengesApi.getMyCertificate();
          if (certData) {
            setUserCertificate(certData);
          }

          // Auto-show modal if they just earned it (check local storage to avoid annoying repeated shows)
          const shownKey = `cert_shown_${user.id}`;
          if (certData && !localStorage.getItem(shownKey)) {
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
      return generateLevels(60).map((l) => ({
        ...l,
        status: l.id === 1 ? "UNLOCKED" : "LOCKED",
        unlocked: l.id === 1,
        completed: false,
      }));
    }

    // Sort API levels by order
    const sortedApiLevels = [...apiLevels].sort((a, b) => a.order - b.order);
    const totalChallengeLevels = sortedApiLevels.length;
    const finalChallenge = sortedApiLevels[totalChallengeLevels - 1];
    const isFinalChallengeCompleted = finalChallenge?.status === "COMPLETED";
    const certificateOrder = totalChallengeLevels + 1;
    const levelsWithCert = [...sortedApiLevels];

    // Manually append certificate entry if it doesn't exist in API payload.
    if (
      totalChallengeLevels > 0 &&
      !levelsWithCert.find((l) => l.slug === CERTIFICATE_SLUG || l.type === "CERTIFICATE")
    ) {
      levelsWithCert.push({
        id: CERTIFICATE_SLUG,
        order: certificateOrder,
        slug: CERTIFICATE_SLUG,
        title: "Professional Certificate",
        description: "Proof of your mastery",
        stars: 0,
        status: isFinalChallengeCompleted ? "UNLOCKED" : "LOCKED",
        xp_reward: 0,
        type: "CERTIFICATE",
        required_levels: totalChallengeLevels,
        unlock_message: `Unlock after completing all ${totalChallengeLevels} levels`,
      });
    }

    return levelsWithCert.map((apiData) => {
      const isCertificate =
        apiData.slug === CERTIFICATE_SLUG || apiData.type === "CERTIFICATE";
      return {
        id: isCertificate ? CERTIFICATE_SLUG : apiData.order,
        order: apiData.order,
        name: isCertificate
          ? "Professional Certificate"
          : `Level ${apiData.order}`,
        slug: apiData.slug,
        icon: ICONS[(apiData.order - 1) % ICONS.length],
        stars: apiData.stars || 0,
        status: apiData.status,
        unlocked:
          apiData.status === "UNLOCKED" ||
          apiData.status === "COMPLETED" ||
          (isCertificate && isFinalChallengeCompleted),
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
      const isCertificate =
        level.slug === CERTIFICATE_SLUG || level.type === "CERTIFICATE";
      if (isCertificate) {
        if (userCertificate) {
          setCertificateModalOpen(true);
          return;
        }

        setIsCertificateLoading(true);
        try {
          const certData = await challengesApi.getMyCertificate();
          if (certData) {
            setUserCertificate(certData);
            setCertificateModalOpen(true);
          } else {
            toast.error("Certificate not available yet.");
          }
        } catch (error) {
          console.error("Failed to load certificate:", error);
          toast.error("Failed to load certificate.");
        } finally {
          setIsCertificateLoading(false);
        }
      } else {
        setSelectedLevel(level);
      }
    }
  };

  return (
    <div className="h-screen relative select-none overflow-hidden text-white bg-[#0b1119]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50"
          >
            <HomeSkeleton />
          </Motion.div>
        ) : (
          <Motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full relative"
          >
            <div className="absolute inset-0 pointer-events-none bg-[#0b1119]" />
            <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-[#101928] via-[#0d141f] to-[#0a0f17]" />
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
                backgroundSize: "52px 52px",
              }}
            />
            <div className="absolute top-0 left-[8%] w-[32rem] h-[32rem] rounded-full bg-[#2563eb]/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-8rem] right-[10%] w-[28rem] h-[28rem] rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none" />

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
            <HomeTopNav
              user={user}
              levels={levels}
              handleLogout={handleLogout}
              setChatOpen={setChatOpen}
              isChatOpen={isChatOpen}
              checkInOpen={checkInOpen}
              setCheckInOpen={setCheckInOpen}
              setLeaderboardOpen={setLeaderboardOpen}
              setNotificationOpen={setNotificationOpen}
              hasUnclaimedReward={hasUnclaimedReward}
              userCertificate={userCertificate}
            />
            <DailyCheckInModal
              isOpen={checkInOpen}
              onClose={() => setCheckInOpen(false)}
              onClaim={() => setHasUnclaimedReward(false)}
            />

            <ChallengeMap
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
              isLoading={isCertificateLoading}
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
