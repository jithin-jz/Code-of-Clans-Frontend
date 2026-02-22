import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useChallengesStore from "../stores/useChallengesStore";
import {
    HomeTopNav,
    ChatDrawer,
    LeaderboardDrawer,
    NotificationDrawer,
    DailyCheckInModal,
    SiteFooter
} from "../home";
import { checkInApi } from "../services/checkInApi";

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { challenges: apiLevels, fetchChallenges } = useChallengesStore();

    const [isChatOpen, setChatOpen] = useState(false);
    const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [hasUnclaimedReward, setHasUnclaimedReward] = useState(false);

    // Hide nav on gameplay screens
    const hideNav = location.pathname.startsWith("/level/");

    useEffect(() => {
        if (user) {
            fetchChallenges();
        }
    }, [user, fetchChallenges]);

    useEffect(() => {
        const checkRewardStatus = async () => {
            if (!user) return;
            try {
                const data = await checkInApi.getCheckInStatus();
                setHasUnclaimedReward(!data.checked_in_today);
            } catch (error) {
                console.error("Failed to check reward status:", error);
            }
        };
        checkRewardStatus();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    // Keyboard Shortcuts — Global
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

    if (hideNav) return children;

    return (
        <div className="min-h-screen relative overflow-x-hidden w-full max-w-[100vw] bg-[#0a0f18] text-white selection:bg-[#38bdf8]/30">
            {/* Global Fixed Background - Deep & Premium */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0f18]" />

            {/* Minimal noise/texture overlay for glass look */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '150px 150px'
                }}
            />

            <div className="relative z-10">
                <HomeTopNav
                    user={user}
                    levels={apiLevels}
                    handleLogout={handleLogout}
                    setChatOpen={setChatOpen}
                    isChatOpen={isChatOpen}
                    checkInOpen={checkInOpen}
                    setCheckInOpen={setCheckInOpen}
                    setLeaderboardOpen={setLeaderboardOpen}
                    setNotificationOpen={setNotificationOpen}
                    notificationOpen={isNotificationOpen}
                    hasUnclaimedReward={hasUnclaimedReward}
                />

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

                <DailyCheckInModal
                    isOpen={checkInOpen}
                    onClose={() => setCheckInOpen(false)}
                    onClaim={() => setHasUnclaimedReward(false)}
                />

                <main className="pt-14">
                    {children}
                </main>

                {location.pathname === "/" && (
                    <div className="pb-16 sm:pb-0">
                        <SiteFooter />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainLayout;
