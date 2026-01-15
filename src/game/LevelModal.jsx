import React from 'react';
import { Star, Play } from 'lucide-react';
import { notify } from '../services/notification';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const LevelModal = ({ selectedLevel, onClose }) => {
    if (!selectedLevel) return null;

    return (
        <Dialog open={!!selectedLevel} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm bg-[#09090b] border-white/10 text-white">
                <DialogHeader className="flex flex-col items-center gap-2">
                    <DialogTitle className="text-2xl font-bold text-white">
                        Level {selectedLevel.id}
                    </DialogTitle>
                    <p className="text-gray-400 font-medium">{selectedLevel.name}</p>
                </DialogHeader>

                <div className="flex flex-col items-center gap-8 py-4">
                    {/* Level icon */}
                    <div className="w-24 h-24 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative shadow-lg">
                        <span className="text-white drop-shadow-md relative z-10">
                            {selectedLevel.icon && React.cloneElement(selectedLevel.icon, { size: 48 })}
                        </span>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl" />
                    </div>
                    
                    {/* Stars */}
                    <div className="flex justify-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/5">
                        {[1, 2, 3].map((star) => (
                            <div 
                                key={star} 
                                className={cn(
                                    "transition-all duration-300", 
                                    star <= selectedLevel.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-700 fill-gray-900"
                                )}
                            >
                                <Star size={24} className="fill-current" />
                            </div>
                        ))}
                    </div>
                    
                    {/* Play button */}
                    <Button 
                        onClick={() => notify.loading(`Loading Level ${selectedLevel.id}...`, { duration: 3000 })}
                        className="w-full py-6 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                         <Play size={20} fill="currentColor" />
                         <span>PLAY LEVEL</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LevelModal;
