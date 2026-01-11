import { useState, useEffect, useRef, useCallback } from 'react';

// Single source of truth for audio state
export const useAudio = () => {
    // Initialize state from localStorage
    const [isBgmMuted, setIsBgmMuted] = useState(() => {
        return localStorage.getItem('bgmMuted') === 'true';
    });
    const [isSfxMuted, setIsSfxMuted] = useState(() => {
        return localStorage.getItem('sfxMuted') === 'true';
    });
    
    const bgmRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        // Initialize Audio Context for synthesized SFX
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // Initialize BGM
        bgmRef.current = new Audio('/sounds/bgm.mp3');
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.3;

        // Cleanup
        return () => {
            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Handle BGM Playback
    useEffect(() => {
        const bgm = bgmRef.current;
        if (!bgm) return;

        const playAudio = async () => {
            try {
                await bgm.play();
            } catch (error) {
                // Ignore "The play() request was interrupted by a call to pause()"
                if (error.name !== 'AbortError') {
                    console.log("BGM Playback prevented:", error);
                    // Add fallback for autoplay policy
                    const startAudio = () => {
                         bgm.play().catch(e => console.log("Retrying BGM", e));
                         window.removeEventListener('click', startAudio);
                         window.removeEventListener('keydown', startAudio);
                    };
                    window.addEventListener('click', startAudio);
                    window.addEventListener('keydown', startAudio);
                }
            }
        };

        if (isBgmMuted) {
            bgm.pause();
        } else {
            playAudio();
        }
    }, [isBgmMuted]);

    const playClick = useCallback(() => {
        if (isSfxMuted || !audioContextRef.current) return;

        // Resume context if suspended (browser policy)
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        try {
            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Click Sound Synthesis (High pitched short beep)
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio synthesis failed", e);
        }
    }, [isSfxMuted]);

    const toggleBgm = () => {
        setIsBgmMuted(prev => {
            const newValue = !prev;
            localStorage.setItem('bgmMuted', newValue);
            return newValue;
        });
    };

    const toggleSfx = () => {
        setIsSfxMuted(prev => {
            const newValue = !prev;
            localStorage.setItem('sfxMuted', newValue);
            return newValue;
        });
    };

    return { isBgmMuted, isSfxMuted, toggleBgm, toggleSfx, playClick };
};
