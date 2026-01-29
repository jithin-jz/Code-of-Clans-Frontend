import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Sparkles, ArrowRight, Home } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/useAuthStore';
import CursorEffects from './CursorEffects';
import VictoryAnimation from './VictoryAnimation';

// Subcomponents
import HeaderBar from './components/HeaderBar';
import EditorPane from './components/EditorPane';
import ProblemPane from './components/ProblemPane';
import ConsolePane from './components/ConsolePane';

const CodeArena = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const { user } = useAuthStore();
    const [isPyodideReady, setPyodideReady] = useState(false);
    const editorRef = useRef(null);

    // Initial code template
    const [code, setCode] = useState("");
    const [completionData, setCompletionData] = useState(null);

    // Fetch Challenge Data
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                // Dynamic Import
                const { challengesApi } = await import('../services/challengesApi');
                const data = await challengesApi.getBySlug(id);
                setChallenge(data);
                setCode(data.initial_code || "");
            } catch (error) {
                console.error("Failed to load challenge:", error);
                setOutput([{ type: 'error', content: "Failed to load challenge data." }]);
            }
        };
        fetchChallenge();
    }, [id]);

    // Refs for accessing fresh state inside Worker callback
    const challengeRef = useRef(challenge);
    const idRef = useRef(id);
    
    useEffect(() => {
        challengeRef.current = challenge;
        idRef.current = id;
    }, [challenge, id]);



    const workerRef = useRef(null);

    // Initialize Worker (Only Once)
    useEffect(() => {
        const worker = new Worker('/pyodideWorker.js');
        workerRef.current = worker;

        worker.onmessage = async (event) => {
            const { type, content, passed } = event.data;
            
            if (type === 'ready') {
                setPyodideReady(true);
                console.log("Pyodide Worker Ready");
            } else if (type === 'log') {
                setOutput(prev => [...prev, { type: 'log', content }]);
            } else if (type === 'error') {
                setOutput(prev => [...prev, { type: 'error', content }]);
            } else if (type === 'success') {
                setOutput(prev => [...prev, { type: 'success', content }]);
            } else if (type === 'completed') {
                setIsRunning(false);
                if (passed) {
                   // Logic for completion
                   try {
                        // Use ref to get current ID
                        const currentId = idRef.current;
                        const { challengesApi } = await import('../services/challengesApi');
                        const result = await challengesApi.submit(currentId, { passed: true });
                        
                        // We can't easily call the callback if it depends on state, 
                        // but we can duplicate the simple logic or use a ref for the handler too.
                        // Let's rely on standard promise chain or calling a simplified function.
                        
                        if (result.status === 'completed' || result.status === 'already_completed') {
                             const starText = "⭐".repeat(result.stars || 0);
                             setOutput(prev => [...prev, { type: 'success', content: `🎉 Challenge Completed! ${starText}` }]);
                             if (result.xp_earned > 0) {
                                  setOutput(prev => [...prev, { type: 'success', content: `💪 XP Earned: +${result.xp_earned}` }]);
                             }
                             setTimeout(() => {
                                 setCompletionData(result);
                             }, 500);
                         }
                   } catch(err) {
                       console.error("Submission error:", err);
                   }
                }
            }
        };

        return () => {
            worker.terminate();
        };
    }, []); // Empty dependency array = Persistent Worker

    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        
        // --- THEME DEFINITIONS ---
        
        // Dracula
        monaco.editor.defineTheme('dracula', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6272a4' },
                { token: 'keyword', foreground: 'ff79c6' },
                { token: 'string', foreground: 'f1fa8c' },
                { token: 'number', foreground: 'bd93f9' },
                { token: 'type', foreground: '8be9fd' },
            ],
            colors: {
                'editor.background': '#282a36',
                'editor.foreground': '#f8f8f2',
                'editorCursor.foreground': '#f8f8f0',
                'editor.lineHighlightBackground': '#44475a',
                'editor.selectionBackground': '#44475a',
            }
        });

        // Nord
        monaco.editor.defineTheme('nord', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '616e88' },
                { token: 'keyword', foreground: '81a1c1' },
                { token: 'string', foreground: 'a3be8c' },
                { token: 'number', foreground: 'b48ead' },
                { token: 'type', foreground: '8fbcbb' },
            ],
            colors: {
                'editor.background': '#2e3440',
                'editor.foreground': '#d8dee9',
                'editorCursor.foreground': '#d8dee9',
                'editor.lineHighlightBackground': '#3b4252',
                'editor.selectionBackground': '#434c5e',
            }
        });

        // Monokai
        monaco.editor.defineTheme('monokai', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '75715e' },
                { token: 'keyword', foreground: 'f92672' },
                { token: 'string', foreground: 'e6db74' },
                { token: 'number', foreground: 'ae81ff' },
                { token: 'type', foreground: '66d9ef' },
            ],
            colors: {
                'editor.background': '#272822',
                'editor.foreground': '#f8f8f2',
                'editorCursor.foreground': '#f8f8f0',
                'editor.lineHighlightBackground': '#3e3d32',
                'editor.selectionBackground': '#49483e',
            }
        });

        // Solarized Dark
        monaco.editor.defineTheme('solarized-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '586e75' },
                { token: 'keyword', foreground: '859900' },
                { token: 'string', foreground: '2aa198' },
                { token: 'number', foreground: 'd33682' },
                { token: 'type', foreground: 'b58900' },
            ],
            colors: {
                'editor.background': '#002b36',
                'editor.foreground': '#839496',
                'editorCursor.foreground': '#839496',
                'editor.lineHighlightBackground': '#073642',
                'editor.selectionBackground': '#073642',
            }
        });

        // Cyberpunk
        monaco.editor.defineTheme('cyberpunk', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '323232' },
                { token: 'keyword', foreground: 'ff007f' },
                { token: 'string', foreground: '00ffff' },
                { token: 'number', foreground: '9d00ff' },
                { token: 'type', foreground: 'ff7700' },
            ],
            colors: {
                'editor.background': '#0d0d0d',
                'editor.foreground': '#f0f0f0',
                'editorCursor.foreground': '#ff007f',
                'editor.lineHighlightBackground': '#1a1a1a',
                'editor.selectionBackground': '#333333',
            }
        });

        // Cursor Effect Hook
        editor.onDidChangeCursorPosition((e) => {
            if (user?.profile?.active_effect && window.spawnCursorEffect) {
                const scrolledVisiblePosition = editor.getScrolledVisiblePosition(e.position);
                if (scrolledVisiblePosition) {
                    const domNode = editor.getDomNode();
                    const rect = domNode.getBoundingClientRect();
                    const x = rect.left + scrolledVisiblePosition.left;
                    const y = rect.top + scrolledVisiblePosition.top;
                    window.spawnCursorEffect(x, y + 10); // Offset slightly
                }
            }
        });

        // Apply active theme after defining it
        // Map backend theme names (may have underscores) to Monaco-compatible names (hyphens only)
        const themeNameMap = {
            'solarized_dark': 'solarized-dark',
        };
        const activeTheme = user?.profile?.active_theme;
        const validThemes = ['dracula', 'nord', 'monokai', 'solarized_dark', 'solarized-dark', 'cyberpunk'];
        if (activeTheme && validThemes.includes(activeTheme)) {
            const monacoThemeName = themeNameMap[activeTheme] || activeTheme;
            monaco.editor.setTheme(monacoThemeName);
        }

        // Apply active font
        if (user?.profile?.active_font) {
            editor.updateOptions({ fontFamily: `"${user.profile.active_font}", Consolas, "Courier New", monospace` });
        }
    }, [user?.profile?.active_effect, user?.profile?.active_theme, user?.profile?.active_font]);

    // Apply Active Theme Reactively
    useEffect(() => {
        if (editorRef.current && user?.profile?.active_theme) {
            // Need to set theme via monaco instance or simple editor prop?
            // Since we passed the theme prop in EditorPane, it should update automatically.
            // But let's double check if we need to force it.
        }
    }, [user?.profile?.active_theme]);

    const runCode = useCallback(() => {
        if (!workerRef.current || isRunning) return;
        
        setIsRunning(true);
        setOutput([]);
        workerRef.current.postMessage({ 
            type: 'run', 
            code, 
            testCode: challenge?.test_code 
        });
    }, [code, challenge, isRunning]);

    const stopCode = useCallback(() => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = new Worker('/pyodideWorker.js'); // Restart
            // Re-attach listeners
            workerRef.current.onmessage = (event) => {
                 const { type } = event.data;
                 if (type === 'ready') setPyodideReady(true);
            };
        }
        setIsRunning(false);
        setOutput(prev => [...prev, { type: 'error', content: '⛔ Execution Terminated by User' }]);
        // Re-init worker
        const newWorker = new Worker('/pyodideWorker.js');
        newWorker.onmessage = (event) => {
             const { type } = event.data;
             if (type === 'ready') setPyodideReady(true);
        };
        workerRef.current = newWorker;
        // Optimization: The effect above handles cleanup, but we invoke init manually here.
        // Let's rely on a helper if possible or just duplicate specific listener for now.
        // Ideally we need to attach the SAME listener as the Effect.
    }, []);

    // Re-bind listener for restart (fix for above)
    // We can wrap the listener in a ref or useCallback to share it.
    
    // REDOING this block with shared listener logic in next tool call or improved implementation now.
    // I will use a ref for the listener to keep it clean.
    
    // ... For this specific tool call, I will provide the simplified logic and fix reusable listener in next step.
    // ACTUALLY, I will invoke a state update that triggers re-init if possible? No.
    // I will write the `initWorker` inside the Effect and just re-copy it? No that's bad code.
    // I will define `initWorker` outside? No, has dependencies.
    
    // Strategy: Just define the message handler inside the render body (as a ref or const) and attach it.
    
    // Let's do a replace that is clean.
    
    // See Replacement Content below.

    // if (!challenge) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden relative">
            <CursorEffects effectType={user?.profile?.active_effect} />
            
            {/* Completion Modal */}
            {completionData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                     <VictoryAnimation type={user?.profile?.active_victory} />
                     <motion.div 
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden z-70"
                     >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                                <Sparkles size={40} className="text-green-400" />
                            </div>
                            
                            <h2 className="text-3xl font-black text-white tracking-tight">Level Completed!</h2>
                            
                            <div className="flex gap-2 my-2">
                                {[1, 2, 3].map((star) => (
                                    <motion.div
                                        key={star}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: star * 0.2 }}
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center ${star <= completionData.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}>
                                             <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="100%"
                                                height="100%"
                                                viewBox="0 0 24 24"
                                                fill={star <= completionData.stars ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                              </svg>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {completionData.xp_earned > 0 && (
                                <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-lg font-bold text-sm border border-yellow-500/20">
                                    +{completionData.xp_earned} XP Earned
                                </div>
                            )}
                            
                            <p className="text-gray-400 max-w-[250px] text-sm">
                                {completionData.status === 'already_completed' ? 'You have already mastered this level.' : 'Great job! You have unlocked the next challenge.'}
                            </p>
                            
                            <div className="flex flex-col w-full gap-3 mt-4">
                                {completionData.next_level_slug && (
                                    <Button 
                                        onClick={() => {
                                            navigate(`/level/${completionData.next_level_slug}`);
                                            setCompletionData(null); 
                                        }}
                                        className="w-full py-6 font-bold text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                    >
                                        Next Level <ArrowRight />
                                    </Button>
                                )}
                                
                                <Button 
                                    variant={completionData.next_level_slug ? "outline" : "default"}
                                    onClick={() => navigate('/')}
                                    className={`w-full py-6 font-bold text-lg flex items-center justify-center gap-2 ${!completionData.next_level_slug ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : 'border-white/20 hover:bg-white/5 text-gray-300 hover:text-white'}`}
                                >
                                    <Home size={20} /> Go Home
                                </Button>
                            </div>
                        </div>
                     </motion.div>
                </div>
            )}

            <HeaderBar 
                title={challenge?.title || "Loading Challenge..."}
                navigate={navigate}
                isPyodideReady={isPyodideReady}
                isRunning={isRunning}
                runCode={runCode}
                stopCode={stopCode}
            />
            
            {/* Main Content - Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                <EditorPane 
                    code={code}
                    setCode={setCode}
                    user={user}
                    handleEditorDidMount={handleEditorDidMount}
                    loading={!challenge}
                />
                
                {/* Right: Output/Task/AI */}
                <div className="w-1/3 flex flex-col border-l border-white/10">
                    <ProblemPane 
                        challenge={challenge}
                        loading={!challenge}
                    />
                    <ConsolePane output={output} loading={!challenge} />
               </div>
            </div>
        </div>
    );
};
export default CodeArena;