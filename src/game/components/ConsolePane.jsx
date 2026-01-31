import React, { memo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const ConsolePane = ({ output, loading }) => {
    if (loading) {
         return (
            <div className="flex-1 flex flex-col bg-[#0a0a0a] border-t border-white/10 animate-pulse">
                <div className="px-4 py-2 border-b border-white/10 bg-[#1a1a1a]">
                    <div className="h-3 w-24 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex-1 p-4">
                     <div className="h-3 w-48 bg-white/5 rounded-md"></div>
                </div>
            </div>
         );
    }
    return (
        <Card className="flex-1 flex flex-col bg-[#0a0a0a] border-none rounded-none border-t border-white/5">
            <CardHeader className="flex-row border-b border-white/5 bg-[#0a0a0a]/50 px-6 py-3 items-center gap-3 space-y-0">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Console Output</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 font-mono text-sm overflow-y-auto font-['Fira_Code'] bg-[#0d0d0d] relative">
                {output.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 pointer-events-none select-none">
                        <p className="text-sm font-medium tracking-wide">Run your code to see output...</p>
                    </div>
                )}
                {output.map((line, i) => (
                    <div key={i} className={`mb-1.5 px-3 py-1 rounded-sm border-l-2 flex gap-3 items-start ${
                        line.type === 'error' 
                            ? 'border-red-500/50 bg-red-500/5 text-red-200' 
                            : line.type === 'success' 
                                ? 'border-green-500/50 bg-green-500/5 text-green-200' 
                                : 'border-gray-700/50 hover:bg-white/5 text-gray-300'
                    }`}>
                        <span className={`select-none shrink-0 opacity-50 ${
                            line.type === 'error' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                            {line.type === 'error' ? '✖' : line.type === 'success' ? '✔' : '>'}
                        </span>
                        <span className="whitespace-pre-wrap break-all leading-relaxed">{line.content}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default memo(ConsolePane);
