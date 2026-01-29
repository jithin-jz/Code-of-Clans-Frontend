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
                    fontLigatures: true,
                }}
             />
        </div>
    );
};

export default memo(EditorPane);
