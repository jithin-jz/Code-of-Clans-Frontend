import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

// Components

import Loader from '../common/Loader';
import LevelModal from '../game/LevelModal';
import ProfilePanel from '../home/ProfilePanel';
import ChatDrawer from '../home/ChatDrawer';
import ShopButton from '../home/ShopButton';
import RightSideUI from '../home/RightSideUI';
import PlayButton from '../home/PlayButton';
import LevelMap from '../home/LevelMap';
import CheckInReward from '../home/CheckInReward';

// Data
import { generateLevels } from '../constants/levelData.jsx';

// Hooks


const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    // Audio Removed
    
    // State
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [isChatOpen, setChatOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Levels
    const levels = useMemo(() => {
        const initialLevels = generateLevels(25); // Spiral Logic expects 25
        
        if (user?.profile?.xp) {
            const userLevel = Math.floor(user.profile.xp / 1000) + 1;
            return initialLevels.map((lvl) => ({
                ...lvl,
                unlocked: lvl.id <= userLevel,
                stars: 0 // Default 0 stars -> will show as 3 empty small stars
            }));
        }
        return initialLevels;
    }, [user]);

    // Loading logic
    useEffect(() => {
        if (!isLoading) return;
        const timeout = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timeout);
    }, [isLoading]);



    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                setChatOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleLevelClick = (level) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (level.unlocked) {
            setSelectedLevel(level);
        }
    };

    return (
        <div className="h-screen relative select-none overflow-hidden bg-[#0a0a0a] text-white">
            <Loader isLoading={isLoading} />
            
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
                    backgroundSize: '40px 40px' 
                }} 
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

            <ProfilePanel user={user} />
            <ChatDrawer 
                isChatOpen={isChatOpen} 
                setChatOpen={setChatOpen} 
                user={user} 
            />
            <ShopButton />
            <RightSideUI 
                user={user} 
                handleLogout={handleLogout} 
                settingsOpen={settingsOpen} 
                setSettingsOpen={setSettingsOpen}
                checkInOpen={checkInOpen}
                setCheckInOpen={setCheckInOpen}
            />
            <PlayButton user={user} />
            
            <CheckInReward 
                isOpen={checkInOpen} 
                onClose={() => setCheckInOpen(false)}
            />
            
            {!isLoading && (
                <LevelMap 
                    levels={levels}
                    handleLevelClick={handleLevelClick}
                />
            )}

            {/* Level Modal */}
            {selectedLevel && <LevelModal selectedLevel={selectedLevel} onClose={() => setSelectedLevel(null)} />}
        </div>
    );
};

export default Home;

