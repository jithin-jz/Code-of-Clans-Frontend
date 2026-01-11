import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AudioController = ({ isMuted, toggleMute }) => {
    return (
        <button 
            onClick={toggleMute}
            className="fixed top-4 right-20 z-50 p-3 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-xl text-white transition-all border border-white/10"
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
    );
};

export default AudioController;
