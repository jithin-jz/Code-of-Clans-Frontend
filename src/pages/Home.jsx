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

const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
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
            />
            
            <PlayButton />
            
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

