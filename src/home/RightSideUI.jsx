import { useNavigate, Link } from 'react-router-dom';
import { Star, Settings, User, LogOut, Calendar, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const RightSideUI = ({ 
    user, 
    handleLogout, 
    settingsOpen, 
    setSettingsOpen, 
    setCheckInOpen,
    hasUnclaimedReward
}) => {
    const navigate = useNavigate();

    // Glass button style matches the previous design
    const glassButtonClass = "h-14 w-14 p-0 bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-[#FFD700]/50 hover:bg-[#1a1a1a] transition-all text-white shadow-lg active:scale-95";

    return (
        <div className="fixed right-6 top-6 z-30 flex flex-col gap-4 items-end animate-slide-in-right">
            
            {/* XP Bar - Link to Buy XP Page */}
            <div 
                onClick={() => navigate('/shop')}
                className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-full pl-4 pr-6 py-2.5 flex items-center gap-4 shadow-xl cursor-pointer hover:border-[#FFD700]/50 transition-all active:scale-95 group"
            >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#FFD700] to-orange-500 flex items-center justify-center text-black shadow-lg">
                    <Star fill="currentColor" size={18} />
                </div>
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">XP Progress</span>
                        <span className="text-white text-xs font-bold">{user?.profile?.xp?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-linear-to-r from-[#FFD700] to-orange-500 rounded-full transition-width" 
                            style={{ width: `${((user?.profile?.xp || 0) % 1000) / 10}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="relative">
                <Button 
                    variant="ghost" 
                    onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen); }} 
                    className={glassButtonClass}
                >
                    <span className={cn("block transition-transform duration-300", settingsOpen ? "rotate-180" : "rotate-0")}>
                        <Settings size={24} />
                    </span>
                </Button>
                
                {settingsOpen && (
                    <div 
                        className="absolute right-full top-0 mr-2 w-40 rounded-2xl overflow-hidden z-40 bg-[#121212] border border-white/10 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in-95 slide-in-from-right-2 duration-200"
                    >
                        <div className="p-1">
                            {/* Menu Items */}
                            <div className="space-y-1">
                                {user ? (
                                    <>
                                        <Link to="/profile" className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white flex items-center justify-between group transition-colors">
                                            <div className="flex items-center gap-2">
                                                <User size={14} /> <span className="text-xs font-medium">Profile</span>
                                            </div>
                                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                        <button onClick={handleLogout} className="w-full px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors text-xs font-medium text-left">
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="w-full px-3 py-2 rounded-xl hover:bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-between group transition-colors">
                                        <div className="flex items-center gap-2">
                                            <User size={14} /> <span className="text-xs font-bold">Login</span>
                                        </div>
                                        <ChevronRight size={12} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Minor Actions */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className={glassButtonClass}>
                    <Trophy size={24} className="text-[#FFD700]" />
                </Button>

                <Button 
                    variant="ghost"
                    onClick={() => setCheckInOpen(true)}
                    className={cn(glassButtonClass, "relative")}
                >
                    <Calendar size={24} />
                    {hasUnclaimedReward && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default RightSideUI;
