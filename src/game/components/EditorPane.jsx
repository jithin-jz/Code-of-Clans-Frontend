import React, { memo } from 'react';
import Editor from '@monaco-editor/react';

const EditorPane = ({ 
    code, 
    setCode, 
    handleEditorDidMount,
    loading 
}) => {
    if (loading) {
        return (
            <div className="flex-1 border-r border-white/10 flex flex-col p-4 animate-pulse">
                <div className="w-48 h-6 bg-white/5 rounded-md mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="h-4 bg-white/5 rounded-md" style={{ width: `${(i * 7 + 30) % 60 + 30}%` }}></div>
                    ))}
                </div>
            </div>
        )
    }


    return (
        <div className="flex-1 border-r border-white/5 flex flex-col bg-[#0a0a0a] relative group">
             {/* Glow Effect on Hover */}
             <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

             <div className="flex-1 pt-4">
                 <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value)}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 15,
                        lineHeight: 24,
                        padding: { top: 10, bottom: 20 },
                        scrollBeyondLastLine: false,
                        fontLigatures: true,
                        fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: true,
                        renderLineHighlight: 'all',
                    }}
                 />
             </div>
        </div>
    );
};

export default memo(EditorPane);
