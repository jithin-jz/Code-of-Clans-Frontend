import React from 'react';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const HeaderBar = ({ 
    title, 
    navigate, 
    isPyodideReady, 
    isRunning, 
    runCode,
    stopCode
}) => {
    return (
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-10 supports-[backdrop-filter]:bg-[#0a0a0a]/60">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/')}
                    className="hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg text-white tracking-tight leading-none">{title}</h1>
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Challenge</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Environment Status Pill */}
                <Badge variant="outline" className={`gap-2 py-1.5 px-3 border-transparent bg-secondary/50 backdrop-blur-sm transition-all ${
                    isPyodideReady 
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isPyodideReady ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-yellow-400 animate-pulse'}`} />
                    {isPyodideReady ? 'Ready' : 'Initializing...'}
                </Badge>

                {isRunning ? (
                    <Button 
                        size="sm" 
                        onClick={stopCode} 
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 hover:border-red-500 transition-all min-w-[120px]"
                    >
                        <Loader2 className="animate-spin w-4 h-4 mr-2" /> Stop Execution
                    </Button>
                ) : (
                    <Button 
                        size="sm" 
                        onClick={runCode} 
                        disabled={!isPyodideReady}
                        className="bg-green-600 hover:bg-green-500 text-white min-w-[120px] shadow-lg shadow-green-900/20 border border-green-500/50"
                    >
                        <Play className="w-4 h-4 mr-2 fill-current" /> Run Code
                    </Button>
                )}
            </div>
        </div>
    );
};

export default React.memo(HeaderBar);
