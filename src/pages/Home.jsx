import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

// Components
import Loader from '../components/common/Loader';
import { LevelModal } from '../components/game';
import ProfilePanel from '../components/home/ProfilePanel';
import ChatDrawer from '../components/home/ChatDrawer';
import ShopButton from '../components/home/ShopButton';
import RightSideUI from '../components/home/RightSideUI';
import PlayButton from '../components/home/PlayButton';
import LevelMap from '../components/home/LevelMap';

// Data
import { levels, pathPositions, decorations, snowflakePositions } from '../constants/levelData.jsx';

// Hooks
import { useAudio } from '../hooks/useAudio';

const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { isBgmMuted, isSfxMuted, toggleBgm, toggleSfx, playClick } = useAudio(); // Audio Hook
    
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [isChatOpen, setChatOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const scrollRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    // Loading logic
    useEffect(() => {
        if (!isLoading) return;
        const timeout = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    // Scroll to bottom on mount
    useEffect(() => {
        if (!isLoading && scrollRef.current) {
            setTimeout(() => {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        }
    }, [isLoading]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleLevelClick = (level) => {
        playClick(); // SFX
        if (!user) {
            navigate('/login');
            return;
        }
        if (level.unlocked) {
            setSelectedLevel(level);
        }
    };

    return (
        <div className="h-screen relative select-none overflow-hidden" style={{ backgroundColor: '#3d8a24' }}>
            <Loader isLoading={isLoading} />
            
            {/* Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none" 
                style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} 
            />

            <div onClick={playClick}>
                <ProfilePanel user={user} />
            </div>
            
            <div onClick={playClick}>
                <ChatDrawer 
                    isChatOpen={isChatOpen} 
                    setChatOpen={setChatOpen} 
                    user={user} 
                />
            </div>
            
            <div onClick={playClick}>
                <ShopButton />
            </div>
            
            <div onClick={playClick}>
                <RightSideUI 
                    user={user} 
                    handleLogout={handleLogout} 
                    settingsOpen={settingsOpen} 
                    setSettingsOpen={setSettingsOpen}
                    isBgmMuted={isBgmMuted}
                    isSfxMuted={isSfxMuted}
                    toggleBgm={toggleBgm}
                    toggleSfx={toggleSfx}
                />
            </div>
            
            <div onClick={playClick}>
                <PlayButton />
            </div>
            
            <LevelMap 
                scrollRef={scrollRef}
                levels={levels}
                pathPositions={pathPositions}
                decorations={decorations}
                snowflakePositions={snowflakePositions}
                handleLevelClick={handleLevelClick}
            />

            {/* Level Modal */}
            {selectedLevel && <LevelModal selectedLevel={selectedLevel} onClose={() => setSelectedLevel(null)} />}
        </div>
    );
};

export default Home;

