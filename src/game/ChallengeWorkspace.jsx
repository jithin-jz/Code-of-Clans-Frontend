import React, { useState, useEffect, useRef, useCallback } from "react";
import { BookOpen, Code2, Bot } from "lucide-react";
import { Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import useAuthStore from "../stores/useAuthStore";
import { motion as Motion } from "framer-motion";
import CursorEffects from "./CursorEffects";
import VictoryAnimation from "./VictoryAnimation";
import ChallengeWorkspaceSkeleton from "./ChallengeWorkspaceSkeleton";
import { generateLocalCodeReview } from "../utils/localCodeReview";

// Subcomponents
import HeaderBar from "./components/HeaderBar";
import EditorPane from "./components/EditorPane";
import ProblemPane from "./components/ProblemPane";
import ConsolePane from "./components/ConsolePane";
import AIAssistantPane from "./components/AIAssistantPane";

const MOBILE_TABS = [
  { id: "problem", label: "Problem", Icon: BookOpen },
  { id: "code", label: "Code", Icon: Code2 },
  { id: "ai", label: "AI", Icon: Bot },
];

const ChallengeWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuthStore();
  const [isPyodideReady, setPyodideReady] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Initial code template
  const [code, setCode] = useState("");
  const [completionData, setCompletionData] = useState(null);
  const [mobileTab, setMobileTab] = useState("problem");

  // AI Hint State
  const [hint, setHint] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [review, setReview] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const handleGetHint = async () => {
    if (!challenge || !code) return;
    setIsHintLoading(true);
    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.getAIHint(challenge.slug, {
        user_code: code,
        hint_level: hintLevel,
      });
      setHint(data.hint);
      setHintLevel((prev) => Math.min(prev + 1, 3));
    } catch (err) {
      console.error("Hint Error:", err);
      const errorMsg =
        err.response?.data?.error || "AI Assistant is currently unavailable.";
      setOutput((prev) => [
        ...prev,
        { type: "error", content: `🤖 AI Assistant: ${errorMsg}` },
      ]);
    } finally {
      setIsHintLoading(false);
    }
  };

  const handlePurchaseAIAssist = async () => {
    if (!challenge) return;
    setIsHintLoading(true);
    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.purchaseAIHint(challenge.slug);

      // Update local state to reflect purchase
      setChallenge((prev) => ({
        ...prev,
        ai_hints_purchased: data.hints_purchased,
      }));

      // Update User XP locally
      if (data.remaining_xp !== undefined) {
        const { setUser } = useAuthStore.getState();
        setUser({
          ...user,
          profile: {
            ...user.profile,
            xp: data.remaining_xp,
          },
        });
      }

      setOutput((prev) => [
        ...prev,
        {
          type: "success",
          content:
            data.message ||
            `🔓 AI Hint Level ${data.hints_purchased} Unlocked!`,
        },
        {
          type: "log",
          content: `XP Remaining: ${data.remaining_xp}`,
        },
      ]);

      // Automatically fetch the hint after successful purchase (single-click UX)
      if (code) {
        try {
          const hintData = await challengesApi.getAIHint(challenge.slug, {
            user_code: code,
            hint_level: data.hints_purchased,
          });
          setHint(hintData.hint);
          setHintLevel(Math.min(data.hints_purchased + 1, 3));
          setOutput((prev) => [
            ...prev,
            {
              type: "success",
              content: "🤖 AI Hint Generated!",
            },
          ]);
          toast.success("AI Hint Generated!", {
            description: `Hint Level ${data.hints_purchased} unlocked successfully`,
          });
        } catch (hintErr) {
          console.error("Hint generation error:", hintErr);
          setOutput((prev) => [
            ...prev,
            {
              type: "error",
              content:
                "⚠️ Hint unlocked but generation failed. Click 'Receive Intelligence' to retry.",
            },
          ]);
          toast.error("Hint Generation Failed", {
            description: "Click 'Receive Intelligence' to retry",
          });
        }
      }
    } catch (err) {
      console.error("Purchase Error:", err);

      const errorResponse = err.response?.data;

      if (err.response?.status === 402 && errorResponse) {
        // Insufficient XP - Show detailed message
        setOutput((prev) => [
          ...prev,
          {
            type: "error",
            content: `❌ ${errorResponse.error}: ${errorResponse.detail || "Insufficient XP"}`,
          },
          {
            type: "log",
            content: `💰 Your XP: ${errorResponse.current_xp} | Required: ${errorResponse.required_xp} | Short by: ${errorResponse.shortage} XP`,
          },
          {
            type: "log",
            content: `💡 Tip: ${errorResponse.how_to_earn || "Complete challenges to earn XP"}`,
          },
        ]);
        toast.error("Insufficient XP", {
          description: `You need ${errorResponse.shortage} more XP. Complete challenges to earn XP!`,
        });
      } else if (
        err.response?.status === 400 &&
        errorResponse?.error === "Maximum AI hints reached"
      ) {
        // Max hints reached
        setOutput((prev) => [
          ...prev,
          {
            type: "error",
            content: `⚠️ ${errorResponse.detail}`,
          },
        ]);
        toast.warning("Maximum Hints Reached", {
          description: "You've used all 3 AI hints for this challenge",
        });
      } else {
        // Generic error
        const errorMsg =
          errorResponse?.error || "Failed to purchase AI Assistance.";
        setOutput((prev) => [
          ...prev,
          { type: "error", content: `❌ Error: ${errorMsg}` },
        ]);
        toast.error("Purchase Failed", {
          description: errorMsg,
        });
      }
    } finally {
      setIsHintLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!challenge || !code?.trim()) return;
    setIsReviewLoading(true);
    try {
      const { challengesApi } = await import("../services/challengesApi");
      const data = await challengesApi.aiAnalyze(challenge.slug, code);
      const reviewText =
        data?.review ||
        data?.analysis ||
        data?.feedback ||
        data?.result ||
        data?.message ||
        (typeof data === "string" ? data : "");

      if (!reviewText) {
        setReview("AI review generated, but response was empty.");
        return;
      }
      setReview(reviewText);
      toast.success("AI Review Ready");
    } catch (err) {
      const statusCode = err?.response?.status;
      if (statusCode === 404) {
        const fallbackReview = generateLocalCodeReview({ code, challenge });
        setReview(fallbackReview);
        toast.info("Using Local Review", {
          description: "Backend review endpoint is unavailable.",
        });
      } else {
        console.error("AI Review Error:", err);
        const errorMsg =
          err.response?.data?.error || "AI review is currently unavailable.";
        toast.error("AI Review Failed", { description: errorMsg });
        setOutput((prev) => [
          ...prev,
          { type: "error", content: `🤖 AI Review: ${errorMsg}` },
        ]);
      }
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Fetch Challenge Data
  useEffect(() => {
    const fetchChallenge = async () => {
      setIsLoadingChallenge(true);
      try {
        // Reset AI state on challenge change
        setHint("");
        setHintLevel(1);
        setReview("");

        // Dynamic Import
        const { challengesApi } = await import("../services/challengesApi");
        const data = await challengesApi.getBySlug(id);
        setChallenge(data);
        setCode(data.initial_code || "");
      } catch (error) {
        console.error("Failed to load challenge:", error);
        setChallenge(null);
        setCode("");
        // Check if it's a 404 error
        if (error.response?.status === 404 || error.message?.includes("404")) {
          setOutput([
            {
              type: "error",
              content:
                "Challenge not found. It may still be generating or doesn't exist.",
            },
            { type: "log", content: "Redirecting to dashboard..." },
          ]);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setOutput([
            {
              type: "error",
              content: "Failed to load challenge. Please try again.",
            },
          ]);
        }
      } finally {
        setIsLoadingChallenge(false);
      }
    };
    fetchChallenge();
  }, [id, navigate]);

  // Refs for accessing fresh state inside Worker callback
  const challengeRef = useRef(challenge);
  const idRef = useRef(id);

  useEffect(() => {
    challengeRef.current = challenge;
    idRef.current = id;
  }, [challenge, id]);

  const workerRef = useRef(null);

  const onWorkerMessage = useCallback(async (event) => {
    const { type, content, passed } = event.data;

    if (type === "ready") {
      setPyodideReady(true);
    } else if (type === "log") {
      setOutput((prev) => [...prev, { type: "log", content }]);
    } else if (type === "error") {
      setOutput((prev) => [...prev, { type: "error", content }]);
    } else if (type === "success") {
      setOutput((prev) => [...prev, { type: "success", content }]);
    } else if (type === "completed") {
      setIsRunning(false);
      if (passed) {
        try {
          const currentId = idRef.current;
          const { challengesApi } = await import("../services/challengesApi");
          const result = await challengesApi.submit(currentId, {
            passed: true,
          });

          if (result.xp_earned && result.xp_earned > 0) {
            const { setUser } = useAuthStore.getState();
            const currentUser = useAuthStore.getState().user;
            if (currentUser) {
              setUser({
                ...currentUser,
                profile: {
                  ...currentUser.profile,
                  xp: (currentUser.profile.xp || 0) + result.xp_earned,
                },
              });
            }
          }

          if (
            result.status === "completed" ||
            result.status === "already_completed"
          ) {
            const starText = "⭐".repeat(result.stars || 0);
            setOutput([
              {
                type: "success",
                content: `🎉 Challenge Completed! ${starText}`,
              },
            ]);
            if (result.xp_earned > 0) {
              setOutput((prev) => [
                ...prev,
                {
                  type: "success",
                  content: `💪 XP Earned: +${result.xp_earned}`,
                },
              ]);
            }
            setCompletionData(result);
          }
        } catch (err) {
          console.error("Submission error:", err);
        }
      }
    }
  }, []);

  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    const worker = new Worker(`/pyodideWorker.js?v=${Date.now()}`);
    worker.onmessage = onWorkerMessage;
    workerRef.current = worker;
    setPyodideReady(false);
  }, [onWorkerMessage]);

  // Initialize Worker
  useEffect(() => {
    initWorker();
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, [initWorker]);

  const applyEditorPreferences = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const themeNameMap = {
      solarized_dark: "solarized-dark",
    };

    const activeTheme = user?.profile?.active_theme;
    const validThemes = [
      "dracula",
      "nord",
      "monokai",
      "solarized_dark",
      "solarized-dark",
      "cyberpunk",
    ];

    if (activeTheme && validThemes.includes(activeTheme)) {
      const monacoThemeName = themeNameMap[activeTheme] || activeTheme;
      monaco.editor.setTheme(monacoThemeName);
    } else {
      monaco.editor.setTheme("vs-dark");
    }

    const fontAliasMap = {
      // Store item name may differ from actual webfont family.
      "Comic Code": "Comic Neue",
    };

    const selectedFont = user?.profile?.active_font || "Fira Code";
    const resolvedFont = fontAliasMap[selectedFont] || selectedFont;
    const fontFamily = resolvedFont
      ? `"${resolvedFont}", 'Fira Code', 'JetBrains Mono', Consolas, monospace`
      : "'Fira Code', 'JetBrains Mono', Consolas, monospace";

    const applyFont = () => {
      editor.updateOptions({ fontFamily });
      // Ensure Monaco recalculates glyph metrics when font changes dynamically.
      monaco.editor.remeasureFonts();
      editor.layout();
    };

    // Wait for the selected font to be available before applying.
    if (document.fonts?.load && resolvedFont) {
      document.fonts.load(`14px "${resolvedFont}"`).finally(applyFont);
    } else {
      applyFont();
    }
  }, [user?.profile?.active_theme, user?.profile?.active_font]);

  const handleEditorDidMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // --- THEME DEFINITIONS ---

      // Dracula
      monaco.editor.defineTheme("dracula", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6272a4" },
          { token: "keyword", foreground: "ff79c6" },
          { token: "string", foreground: "f1fa8c" },
          { token: "number", foreground: "bd93f9" },
          { token: "type", foreground: "8be9fd" },
        ],
        colors: {
          "editor.background": "#282a36",
          "editor.foreground": "#f8f8f2",
          "editorCursor.foreground": "#f8f8f0",
          "editor.lineHighlightBackground": "#44475a",
          "editor.selectionBackground": "#44475a",
        },
      });

      // Nord
      monaco.editor.defineTheme("nord", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "616e88" },
          { token: "keyword", foreground: "81a1c1" },
          { token: "string", foreground: "a3be8c" },
          { token: "number", foreground: "b48ead" },
          { token: "type", foreground: "8fbcbb" },
        ],
        colors: {
          "editor.background": "#2e3440",
          "editor.foreground": "#d8dee9",
          "editorCursor.foreground": "#d8dee9",
          "editor.lineHighlightBackground": "#3b4252",
          "editor.selectionBackground": "#434c5e",
        },
      });

      // Monokai
      monaco.editor.defineTheme("monokai", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "75715e" },
          { token: "keyword", foreground: "f92672" },
          { token: "string", foreground: "e6db74" },
          { token: "number", foreground: "ae81ff" },
          { token: "type", foreground: "66d9ef" },
        ],
        colors: {
          "editor.background": "#272822",
          "editor.foreground": "#f8f8f2",
          "editorCursor.foreground": "#f8f8f0",
          "editor.lineHighlightBackground": "#3e3d32",
          "editor.selectionBackground": "#49483e",
        },
      });

      // Solarized Dark
      monaco.editor.defineTheme("solarized-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "586e75" },
          { token: "keyword", foreground: "859900" },
          { token: "string", foreground: "2aa198" },
          { token: "number", foreground: "d33682" },
          { token: "type", foreground: "b58900" },
        ],
        colors: {
          "editor.background": "#002b36",
          "editor.foreground": "#839496",
          "editorCursor.foreground": "#839496",
          "editor.lineHighlightBackground": "#073642",
          "editor.selectionBackground": "#073642",
        },
      });

      // Cyberpunk
      monaco.editor.defineTheme("cyberpunk", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "323232" },
          { token: "keyword", foreground: "ff007f" },
          { token: "string", foreground: "00ffff" },
          { token: "number", foreground: "9d00ff" },
          { token: "type", foreground: "ff7700" },
        ],
        colors: {
          "editor.background": "#0d0d0d",
          "editor.foreground": "#f0f0f0",
          "editorCursor.foreground": "#ff007f",
          "editor.lineHighlightBackground": "#1a1a1a",
          "editor.selectionBackground": "#333333",
        },
      });

      // Cursor Effect Hook
      editor.onDidChangeCursorPosition((e) => {
        if (user?.profile?.active_effect && window.spawnCursorEffect) {
          const scrolledVisiblePosition = editor.getScrolledVisiblePosition(
            e.position,
          );
          if (scrolledVisiblePosition) {
            const domNode = editor.getDomNode();
            const rect = domNode.getBoundingClientRect();
            const x = rect.left + scrolledVisiblePosition.left;
            const y = rect.top + scrolledVisiblePosition.top;
            window.spawnCursorEffect(x, y + 10); // Offset slightly
          }
        }
      });

      // Apply profile theme/font immediately on mount.
      applyEditorPreferences();
    },
    [
      user?.profile?.active_effect,
      applyEditorPreferences,
    ],
  );

  // Apply active theme/font reactively when profile settings change.
  useEffect(() => {
    applyEditorPreferences();
  }, [applyEditorPreferences]);

  const runCode = useCallback(() => {
    if (!workerRef.current || isRunning) return;

    setIsRunning(true);
    setOutput([]);
    // Send validate type to ensure tests are run
    workerRef.current.postMessage({
      type: "validate",
      code,
      testCode: challenge?.test_code,
    });
  }, [code, challenge, isRunning]);

  const stopCode = useCallback(() => {
    initWorker();
    setIsRunning(false);
    setOutput((prev) => [
      ...prev,
      { type: "error", content: "⛔ Execution Terminated by User" },
    ]);
  }, [initWorker]);

  // Show skeleton while loading challenge data
  if (isLoadingChallenge) {
    return <ChallengeWorkspaceSkeleton />;
  }

  return (
    <div className="h-dvh flex flex-col bg-[#0b1119] text-white overflow-hidden relative font-sans selection:bg-primary/20">
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
      <div className="absolute top-0 left-[8%] w-[26rem] h-[26rem] rounded-full bg-[#2563eb]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-8rem] right-[10%] w-[22rem] h-[22rem] rounded-full bg-[#0ea5e9]/10 blur-3xl pointer-events-none" />
      <CursorEffects effectType={user?.profile?.active_effect} />

      {/* Completion Modal */}
      {completionData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <VictoryAnimation type={user?.profile?.active_victory} />
          <Motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0c0c0e] border border-white/10 rounded-none p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl"
          >
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-none flex items-center justify-center mb-2 bg-green-500/10">
                <Sparkles size={32} className="text-green-500" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Challenge Complete
                </h2>
                <p className="text-gray-500 text-xs text-balance">
                  Validation successful. You've beaten the challenge.
                </p>
              </div>

              <div className="flex gap-2 my-1">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`w-6 h-6 flex items-center justify-center ${star <= completionData.stars ? "text-[#ffa116]" : "text-gray-800"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-5.82 3.25L7.38 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                ))}
              </div>

              {completionData.xp_earned > 0 && (
                <div className="text-[#ffa116] text-sm font-mono tracking-tighter">
                  +{completionData.xp_earned} EARNED
                </div>
              )}

              <div className="flex flex-col w-full gap-2 mt-4">
                {completionData.next_level_slug ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const slug = completionData.next_level_slug;
                      setCompletionData(null);
                      setTimeout(() => {
                        navigate(`/level/${slug}`);
                      }, 100);
                    }}
                    className="w-full h-10 rounded-xl bg-[#ffa116] text-black hover:bg-[#ff8f00] font-bold uppercase text-xs transition-colors"
                  >
                    Next Challenge
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 font-bold uppercase text-xs transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </Motion.div>
        </div>
      )}

      <div className="shrink-0 relative z-10">
        <HeaderBar
          title={challenge?.title || "Loading..."}
          navigate={navigate}
          isPyodideReady={isPyodideReady}
          isRunning={isRunning}
          runCode={runCode}
          stopCode={stopCode}
        />
      </div>

      {/* Main Content - Minimalist Boxy Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 p-2 sm:p-3 gap-3">
        {/* LEFT CARD: Problem — desktop always visible, mobile only when tab=problem */}
        <div
          className={`lg:flex w-full lg:w-[24rem] min-h-0 flex-col bg-[#0f1827]/64 backdrop-blur-xl border border-white/12 rounded-2xl shadow-[0_22px_60px_rgba(0,0,0,0.3)] overflow-y-auto custom-scrollbar ${mobileTab === "problem" ? "flex" : "hidden"
            }`}
        >
          <div className="flex-1 min-h-0 relative">
            <ProblemPane challenge={challenge} loading={!challenge} />
          </div>
        </div>

        {/* MIDDLE COLUMN: Editor & Console Cards — desktop always visible, mobile only when tab=code */}
        <div
          className={`lg:flex flex-1 flex-col min-w-0 rounded-2xl border border-white/12 shadow-[0_22px_60px_rgba(0,0,0,0.3)] overflow-hidden bg-[#0f1827]/64 backdrop-blur-xl ${mobileTab === "code" ? "flex" : "hidden"
            }`}
        >
          {/* Editor Card */}
          <div className="flex-1 flex flex-col bg-[#0b1526]/85 overflow-hidden relative group">
            <div className="flex-1 relative">
              <EditorPane
                code={code}
                setCode={setCode}
                user={user}
                handleEditorDidMount={handleEditorDidMount}
                loading={!challenge}
                editorFontFamily={
                  user?.profile?.active_font
                    ? `"${user.profile.active_font}", 'Fira Code', 'JetBrains Mono', Consolas, monospace`
                    : "'Fira Code', 'JetBrains Mono', Consolas, monospace"
                }
              />
            </div>
          </div>

          {/* Console Card */}
          <div className="h-[32%] min-h-[180px] flex flex-col bg-[#0b1526]/90 border-t border-white/10">
            <div className="px-3 py-2 border-b border-white/10 bg-[#111d30] flex justify-between items-center h-8">
              <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-sans">
                Terminal
              </span>
              {output.some((l) => l.type === "error") && (
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tighter flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400" /> Error
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden relative">
              <ConsolePane output={output} loading={!challenge} />
            </div>
          </div>
        </div>

        {/* RIGHT CARD: AI Assistant — desktop always visible, mobile only when tab=ai */}
        <div
          className={`lg:flex w-full lg:w-[24rem] xl:w-[26rem] flex-col bg-[#0f1827]/64 backdrop-blur-xl border border-white/12 rounded-2xl shadow-[0_22px_60px_rgba(0,0,0,0.3)] overflow-hidden ${mobileTab === "ai" ? "flex" : "hidden"
            }`}
        >
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AIAssistantPane
              onGetHint={handleGetHint}
              onPurchase={handlePurchaseAIAssist}
              onAnalyze={handleAnalyzeCode}
              hint={hint}
              review={review}
              isHintLoading={isHintLoading}
              isReviewLoading={isReviewLoading}
              hintLevel={hintLevel}
              ai_hints_purchased={challenge?.ai_hints_purchased || 0}
              userXp={user?.profile?.xp}
            />
          </div>
        </div>
      </div>

      {/* MOBILE TAB BAR — only shown on mobile */}
      <div className="lg:hidden shrink-0 relative z-20 bg-[#0a1220]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-stretch h-14">
          {MOBILE_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobileTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150 ${mobileTab === id
                ? "text-[#10b981] border-t-2 border-[#10b981] bg-[#10b981]/5"
                : "text-slate-500 hover:text-slate-300 border-t-2 border-transparent"
                }`}
            >
              <Icon size={18} strokeWidth={mobileTab === id ? 2.2 : 1.7} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
            </button>
          ))}
        </div>
        {/* Safe area for iPhone home indicator */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </div>
  );
};
export default ChallengeWorkspace;
