import { useState, useEffect } from 'react';
import { checkInApi } from '../services/checkInApi';
import { useAuthStore } from '../stores/useAuthStore';
import { Calendar, Flame, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const CheckInReward = ({ isOpen, onClose }) => {
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const { setUserXP } = useAuthStore();

  const DAILY_REWARDS = {
    1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35
  };

  useEffect(() => {
    if (isOpen) {
      loadCheckInStatus();
    }
  }, [isOpen]);

  const loadCheckInStatus = async () => {
    try {
      const data = await checkInApi.getCheckInStatus();
      setCheckInStatus(data);
    } catch (error) {
      console.error('Failed to load check-in status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (day) => {
    const nextDay = checkInStatus?.checked_in_today 
      ? checkInStatus.current_streak + 1 
      : (checkInStatus?.current_streak || 0) + 1;
    
    if (day !== nextDay || checkInStatus?.checked_in_today) return;
    
    setCheckingIn(true);
    try {
      const data = await checkInApi.checkIn();
      setCheckInStatus({
        ...checkInStatus,
        checked_in_today: true,
        current_streak: data.streak_day,
        today_checkin: data.check_in
      });
      if (setUserXP) setUserXP(data.total_xp);
      toast.success(`Day ${data.streak_day} claimed! +${data.xp_earned} XP`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-[#09090b] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
              <Calendar className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl text-white">Daily Check-In</DialogTitle>
              <DialogDescription className="text-gray-400">Claim your daily rewards</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Streak Display */}
        <Card className="bg-linear-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="text-orange-400 h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Current Streak</p>
                <p className="text-lg font-bold text-white">
                  Day {checkInStatus?.current_streak || 0}{' '}
                  <span className="text-gray-500">/ 7</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <>
              <p className="text-sm text-gray-400 text-center">
                Click on the next day to claim your reward
              </p>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isCompleted = checkInStatus?.current_streak >= day && 
                                    checkInStatus?.checked_in_today;
                  const isClaimable = !checkInStatus?.checked_in_today && 
                                    day === (checkInStatus?.current_streak || 0) + 1;
                  
                  return (
                    <Card
                      key={day}
                      onClick={() => handleCheckIn(day)}
                      className={cn(
                        "relative transition-all cursor-default hover:shadow-md border-2",
                        isCompleted && "bg-linear-to-br from-green-500/20 to-emerald-500/20 border-green-500/30",
                        isClaimable && "bg-linear-to-br from-primary/20 to-orange-500/20 border-primary/50 cursor-pointer hover:scale-105 animate-pulse",
                        !isCompleted && !isClaimable && "bg-[#1a1a1a] border-white/5",
                        checkingIn && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <CardContent className="p-3 text-center">
                        <p className={cn("text-xs mb-1", isCompleted || isClaimable ? "text-white" : "text-gray-500")}>Day {day}</p>
                        <Badge 
                          variant={isCompleted ? "default" : isClaimable ? "default" : "outline"}
                          className={cn(
                            "text-xs font-bold",
                            isCompleted && "bg-green-500 hover:bg-green-500 text-white border-none",
                            isClaimable && "bg-primary hover:bg-primary text-black border-none",
                            !isCompleted && !isClaimable && "text-gray-500 border-white/10"
                          )}
                        >
                          {DAILY_REWARDS[day]} XP
                        </Badge>
                        
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-white h-3 w-3" />
                          </div>
                        )}
                        {isClaimable && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-bounce">
                            <Award className="text-primary-foreground h-3 w-3" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Check-ins */}
              {checkInStatus?.recent_checkins?.length > 0 && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Recent Check-ins
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {checkInStatus.recent_checkins.slice(0, 5).map((checkin) => (
                        <div
                          key={checkin.id}
                          className="flex items-center justify-between text-xs py-1.5 px-2 bg-background rounded-lg"
                        >
                          <span className="text-muted-foreground">{checkin.check_in_date}</span>
                          <span className="text-muted-foreground">Day {checkin.streak_day}</span>
                          <Badge variant="outline" className="text-primary border-primary/50">
                            +{checkin.xp_earned} XP
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInReward;