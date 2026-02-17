import React, { memo } from "react";
import {
  CheckCircle2,
  XCircle,
  Terminal,
  Keyboard,
  Lock,
  AlertCircle,
} from "lucide-react";

const TestResultsPane = ({
  results,
  customInput,
  setCustomInput,
  isCustomInputMode,
  setIsCustomInputMode,
  isRunning,
  lastError,
}) => {
  const [activeTab, setActiveTab] = React.useState("results");
  const [expandedCase, setExpandedCase] = React.useState(0);

  if (lastError && (!results || results.length === 0)) {
    return (
      <div className="flex-1 flex flex-col bg-[#09090b] border-t border-white/5 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 bg-[#1a1a1a]">
          <AlertCircle size={14} className="text-rose-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Execution Error
          </span>
        </div>
        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar bg-[#09090b]">
          <div className="p-4 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 leading-relaxed whitespace-pre-wrap">
            {lastError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] border-t border-white/5 overflow-hidden font-sans">
      {/* Tab Header */}
      <div className="px-4 border-b border-white/5 bg-[#0c0c0e] flex items-center justify-between shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("results")}
            className={`flex items-center rounded-none border-b-2 text-[11px] font-bold h-11 transition-all ${
              activeTab === "results"
                ? "text-white border-[#00af9b]"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Terminal size={14} className="mr-2" />
            Test Results
          </button>
          <button
            onClick={() => setActiveTab("input")}
            className={`flex items-center rounded-none border-b-2 text-[11px] font-bold h-11 transition-all ${
              activeTab === "input"
                ? "text-white border-[#00af9b]"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Keyboard size={14} className="mr-2" />
            Custom Input
          </button>
        </div>
        {isRunning && (
          <span className="text-[10px] font-black text-[#00af9b] animate-pulse uppercase tracking-[0.2em]">
            Running...
          </span>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "results" ? (
          <div className="h-full flex flex-col md:flex-row min-h-0 overflow-hidden">
            {!results || results.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-3 opacity-30 bg-[#09090b]">
                <Terminal size={40} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Run code to see results
                </p>
              </div>
            ) : (
              <>
                {/* Sidebar: Case list */}
                <div className="w-full md:w-40 border-r border-white/5 bg-white/1 overflow-y-auto custom-scrollbar-thin shrink-0">
                  {results.map((res, idx) => (
                    <button
                      key={res.id || idx}
                      onClick={() => setExpandedCase(idx)}
                      className={`w-full px-5 py-3 flex items-center gap-3 border-b border-white/5 transition-all ${
                        expandedCase === idx
                          ? "bg-white/5 border-r-2 border-r-[#00af9b] text-white"
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/2"
                      }`}
                    >
                      {res.passed ? (
                        <CheckCircle2 size={12} className="text-[#00af9b]" />
                      ) : (
                        <XCircle size={12} className="text-rose-500" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Case {idx}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Detail view */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b] p-6">
                  {results[expandedCase] && (
                    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-right-1 duration-300">
                      <div className="flex items-center gap-4">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">
                          Test Case {expandedCase}
                        </h4>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
                            results[expandedCase].passed
                              ? "bg-[#00af9b]/10 text-[#00af9b] border-[#00af9b]/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {results[expandedCase].passed ? "Passed" : "Failed"}
                        </span>
                      </div>

                      <div className="space-y-6">
                        {/* Input Section */}
                        {results[expandedCase].input && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              Input (stdin)
                            </div>
                            <pre className="text-[13px] font-mono text-gray-300 bg-white/2 p-4 rounded-lg border border-white/5 overflow-x-auto whitespace-pre">
                              {results[expandedCase].input}
                            </pre>
                          </div>
                        )}

                        {/* Expected Output */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            Expected Output
                          </div>
                          {results[expandedCase].is_sample ? (
                            <pre className="text-[13px] font-mono text-[#00af9b] bg-[#00af9b]/5 p-4 rounded-lg border border-[#00af9b]/10 overflow-x-auto whitespace-pre">
                              {results[expandedCase].expected || "(no output)"}
                            </pre>
                          ) : (
                            <div className="bg-white/1 border border-white/5 p-4 rounded-lg text-xs text-gray-500 flex items-center gap-3 italic">
                              <Lock
                                size={14}
                                className="opacity-40 text-[#00af9b]"
                              />
                              Output hidden for secret test cases
                            </div>
                          )}
                        </div>

                        {/* Actual Output */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            Your Output (stdout)
                          </div>
                          <pre
                            className={`text-[13px] font-mono p-4 rounded-lg border overflow-x-auto whitespace-pre ${
                              results[expandedCase].passed
                                ? "bg-white/2 text-gray-100 border-white/5 shadow-inner"
                                : "bg-rose-500/5 text-rose-300 border-rose-500/20 shadow-lg shadow-rose-900/10"
                            }`}
                          >
                            {results[expandedCase].actual ||
                              (results[expandedCase].error
                                ? ""
                                : "(no output)")}
                            {results[expandedCase].error && (
                              <div className="text-rose-400/80 mt-4 pt-4 border-t border-rose-500/10 font-sans italic text-[11px] leading-relaxed">
                                {results[expandedCase].error}
                              </div>
                            )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-full bg-[#09090b] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-white flex items-center gap-2 tracking-[0.2em]">
                  <Keyboard size={16} className="text-[#00af9b]" />
                  CUSTOM INPUT
                </h4>
                <p className="text-[10px] text-gray-600 uppercase tracking-tighter">
                  Enter stdin for your program manually
                </p>
              </div>
              <button
                className={`h-8 px-4 text-[10px] font-black uppercase transition-all rounded-lg border ${
                  isCustomInputMode
                    ? "bg-[#008f7a] hover:bg-[#00af9b] border-none text-white shadow-lg shadow-[#1f1f1f]/30"
                    : "border-white/10 text-gray-500 hover:bg-white/5"
                }`}
                onClick={() => setIsCustomInputMode(!isCustomInputMode)}
              >
                {isCustomInputMode ? "Active" : "Hidden"}
              </button>
            </div>

            <textarea
              className={`w-full h-48 bg-black/60 border rounded-xl p-6 font-mono text-sm resize-none focus:outline-none transition-all ${
                isCustomInputMode
                  ? "border-[#00af9b]/40 text-blue-50 shadow-inner"
                  : "border-white/5 text-gray-800 opacity-40 cursor-not-allowed"
              }`}
              placeholder="Enter test input data here..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              disabled={!isCustomInputMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TestResultsPane);
