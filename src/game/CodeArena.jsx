import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, ArrowLeft, Loader2, Save, Bot, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import useAIStore from '../stores/useAIStore';
import ReactMarkdown from 'react-markdown';

const CodeArena = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState('task'); // 'task' or 'ai'
    const [hint, setHint] = useState(null);
    const { generateHint, loading: aiLoading } = useAIStore();
    const [isPyodideReady, setPyodideReady] = useState(false);
    const pyodideRef = useRef(null);
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
                setHint(null);
            } catch (error) {
                console.error("Failed to load challenge:", error);
                setOutput([{ type: 'error', content: "Failed to load challenge data." }]);
            }
        };
        fetchChallenge();
    }, [id]);

    // Load Pyodide (Same as before)
    useEffect(() => {
        const loadPyodide = async () => {
            try {
                if (window.pyodide) {
                    pyodideRef.current = window.pyodide;
                    setPyodideReady(true);
                    return;
                }
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
                script.async = true;
                script.onload = async () => {
                    try {
                        const pyodide = await window.loadPyodide();
                        pyodideRef.current = pyodide;
                        setPyodideReady(true);
                        console.log("Pyodide loaded");
                    } catch (err) {
                        console.error("Failed to initialize Pyodide:", err);
                    }
                };
                document.body.appendChild(script);
            } catch (error) {
                console.error("Error loading Pyodide script:", error);
            }
        };
        loadPyodide();
    }, []);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const runCode = async () => {
        if (!pyodideRef.current || isRunning || !challenge) return;
        
        setIsRunning(true);
        setOutput([]); 
        try {
            // Hijack stdout
            pyodideRef.current.setStdout({ batched: (msg) => {
                setOutput(prev => [...prev, { type: 'log', content: msg }]);
            }});
            
            // Run User Code
            await pyodideRef.current.runPythonAsync(code);

            // Run Test Code (Hidden assertion)
            if (challenge.test_code) {
                await pyodideRef.current.runPythonAsync(challenge.test_code);
                // If assertions pass, we get here
                setOutput(prev => [...prev, { type: 'success', content: "✅ Tests Passed!" }]);
                
                // Submit to Backend
                const { challengesApi } = await import('../services/challengesApi');
                const result = await challengesApi.submit(id, { passed: true });
                
                if (result.status === 'completed' || result.status === 'already_completed') {
                    const starText = "⭐".repeat(result.stars || 0);
                    setOutput(prev => [...prev, { type: 'success', content: `🎉 Challenge Completed! ${starText}` }]);
                    if (result.xp_earned > 0) {
                         setOutput(prev => [...prev, { type: 'success', content: `💪 XP Earned: +${result.xp_earned}` }]);
                    }
                    
                    // Trigger Completion Modal
                    setTimeout(() => {
                        setCompletionData(result);
                    }, 500); // 500ms delay for effect
                }
            } else {
                 setOutput(prev => [...prev, { type: 'log', content: "⚠️ No tests defined. Code ran successfully." }]);
            }
            
        } catch (error) {
            setOutput(prev => [...prev, { type: 'error', content: `❌ ${error.toString()}` }]);
        } finally {
            setIsRunning(false);
        }
    };

    if (!challenge) return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden relative">
            {/* Completion Modal */}
            {completionData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                     <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
                     >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-purple-500/5 to-blue-500/10 pointer-events-none" />
                        
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
                                <Button 
                                    onClick={() => {
                                        if (completionData.next_level_slug) {
                                            navigate(`/level/${completionData.next_level_slug}`);
                                            // Reset state for next level (optional, but navigation handles remount)
                                            setCompletionData(null); 
                                        } else {
                                             navigate('/');
                                        }
                                    }}
                                    className="w-full py-6 font-bold text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center gap-2"
                                >
                                    {completionData.next_level_slug ? (
                                        <>Next Level <ArrowLeft className="rotate-180" /></>
                                    ) : (
                                        <>Return to Map <ArrowLeft /></>
                                    )}
                                </Button>
                                
                                <Button 
                                    variant="ghost" 
                                    onClick={() => navigate('/')}
                                    className="w-full text-gray-400 hover:text-white"
                                >
                                    Return to Map
                                </Button>
                            </div>
                        </div>
                     </motion.div>
                </div>
            )}

            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#121212]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="text-gray-400" />
                    </Button>
                    <h1 className="font-bold text-lg">{challenge.title}</h1>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
                        <div className={`w-2 h-2 rounded-full ${isPyodideReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                        {isPyodideReady ? 'Env Ready' : 'Loading...'}
                    </div>
                    <Button 
                        size="sm" 
                        onClick={runCode} 
                        disabled={!isPyodideReady || isRunning}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                        {isRunning ? <Loader2 className="animate-spin w-4 h-4" /> : <><Play className="w-4 h-4 mr-2" /> Run / Submit</>}
                    </Button>
                </div>
            </div>
            {/* removed AIDrawer */}
            {/* Main Content - Split Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Editor */}
                <div className="flex-1 border-r border-white/10 flex flex-col">
                     <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        onMount={handleEditorDidMount}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                        }}
                     />
                </div>
                {/* Right: Output/Task */}
                {/* Right: Output/Task/AI */}
                <div className="w-1/3 bg-[#121212] flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button 
                            onClick={() => setActiveTab('task')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'task' ? 'text-white border-b-2 border-purple-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Task
                        </button>
                        <button 
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'ai' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : 'text-gray-500 hover:text-purple-400/70'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Sparkles size={14} /> AI Hints
                            </div>
                        </button>
                    </div>

                    <div className="h-1/2 overflow-y-auto relative">
                        {activeTab === 'task' ? (
                            <div className="p-6">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Task Description</h2>
                                    <div className="prose prose-invert prose-sm">
                                       <ReactMarkdown>{challenge.description}</ReactMarkdown>
                                    </div>
                            </div>
                        ) : (
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto mb-4">
                                    {!hint ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                            <Bot size={48} className="text-purple-500/30 mb-4" />
                                            <p className="text-gray-400 text-sm max-w-[200px]">
                                                Stuck? Ask the AI for a hint based on your current code.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold text-xs uppercase tracking-wider">
                                                <Sparkles size={12} /> AI Hint
                                            </div>
                                            <div className="prose prose-invert prose-sm text-sm text-gray-200">
                                                <ReactMarkdown>{hint}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <Button 
                                    onClick={async () => {
                                        try {
                                            const { challengesApi } = await import('../services/challengesApi');
                                            // Deduct XP
                                            await challengesApi.purchaseAIHint(id);
                                            
                                            // Generate Hint
                                            const taskDesc = challenge.description;
                                            const result = await generateHint(taskDesc, code);
                                            setHint(result);
                                            setOutput(prev => [...prev, { type: 'success', content: "💡 Hint Unlocked (-10 XP)" }]);
                                        } catch (error) {
                                            if (error.response?.status === 400) {
                                                setOutput(prev => [...prev, { type: 'error', content: "❌ Insufficient XP for Hint (Cost: 10 XP)" }]);
                                            } else {
                                                console.error(error);
                                            }
                                        }
                                    }}
                                    disabled={aiLoading}
                                    className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 border-0"
                                >
                                    {aiLoading ? (
                                        <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Analyzing Code...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> Get Hint (10 XP)</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 flex flex-col bg-[#0a0a0a] border-t border-white/10">
                        <div className="px-4 py-2 border-b border-white/10 bg-[#1a1a1a]">
                            <span className="text-xs font-bold text-gray-500 uppercase">Console Output</span>
                        </div>
                        <div className="flex-1 p-4 font-mono text-sm overflow-y-auto font-['Fira_Code']">
                            {output.length === 0 && <span className="text-gray-600 italic">Run your code to see output...</span>}
                            {output.map((line, i) => (
                                <div key={i} className={`mb-1 ${line.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                                    {line.type === 'error' ? '❌ ' : '> '}
                                    {line.content}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CodeArena;