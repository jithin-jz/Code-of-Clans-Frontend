import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const ProblemPane = ({ 
    challenge, 
    loading
}) => {
    if (loading) {
        return (
            <div className="flex-1 bg-[#0a0a0a] flex flex-col animate-pulse">
                 <div className="flex border-b border-white/10 bg-[#1a1a1a]">
                     <div className="flex-1 py-3 bg-white/5 mx-1 my-1 rounded-sm"></div>
                 </div>
                 <div className="p-6 space-y-4">
                     <div className="h-4 w-32 bg-white/10 rounded-md"></div>
                     <div className="space-y-2">
                         <div className="h-3 w-full bg-white/5 rounded-md"></div>
                         <div className="h-3 w-5/6 bg-white/5 rounded-md"></div>
                         <div className="h-3 w-4/6 bg-white/5 rounded-md"></div>
                     </div>
                 </div>
            </div>
        )
    }

    return (
        <Card className="flex-1 flex flex-col bg-[#0a0a0a] border-none rounded-none overflow-hidden">
            {/* Header */}
            <CardHeader className="border-b border-white/5 bg-[#0a0a0a]/50 px-6 py-4 flex flex-row items-center gap-3 space-y-0">
                <div className="w-1 h-4 bg-purple-500 rounded-full" />
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Mission Brief</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto relative custom-scrollbar p-0">
                <div className="p-8 max-w-2xl mx-auto">
                    <div className="prose prose-invert prose-sm max-w-none 
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-base
                        prose-code:text-purple-300 prose-code:bg-purple-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[13px]
                        prose-strong:text-white prose-strong:font-bold
                        prose-ul:text-gray-400 prose-li:marker:text-purple-500
                    ">
                       <ReactMarkdown>{challenge.description}</ReactMarkdown>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default memo(ProblemPane);
