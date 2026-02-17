import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const ProblemPane = ({ challenge, loading }) => {
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
    );
  }

  return (
    <Card className="flex-1 flex flex-col bg-[#18181b] border-none rounded-none overflow-hidden m-0">
      <CardContent className="flex-1 overflow-y-auto relative custom-scrollbar p-0 bg-[#18181b]">
        <div className="p-6 max-w-3xl mx-auto">
          <div
            className="prose prose-invert prose-sm max-w-none 
                        prose-headings:text-white prose-headings:font-semibold
                        prose-p:text-gray-400 prose-p:leading-relaxed
                        prose-code:text-[#66d1c3] prose-code:bg-[#1f1f1f]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[13px]
                        prose-strong:text-white prose-strong:font-semibold
                        prose-ul:text-gray-400 prose-li:marker:text-gray-600
                    "
          >
            <ReactMarkdown>{challenge.description}</ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(ProblemPane);
