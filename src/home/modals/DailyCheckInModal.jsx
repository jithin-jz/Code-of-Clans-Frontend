import { useState, useEffect, memo } from 'react';
import { checkInApi } from '../../services/checkInApi';
import useUserStore from '../../stores/useUserStore';
import useAuthStore from '../../stores/useAuthStore';
import { Calendar, X, Sparkles, Flame, Snowflake } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

// Subcomponents
import StreakStats from '../components/StreakStats';
import DayGrid from '../components/DayGrid';

const DailyCheckInModal = ({ isOpen, onClose, onClaim }) => {
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const { fetchCurrentUser } = useUserStore();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadCheckInStatus();
    }
  }, [isOpen]);

  const loadCheckInStatus = async () => {
    setLoading(true);
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
        today_checkin: data.check_in,
        freezes_left: data.freezes_left
      });

      if (user?.profile && typeof data.xp_earned === 'number') {
        setUser({
          ...user,
          profile: {
            ...user.profile,
            xp: (user.profile.xp || 0) + data.xp_earned,
          },
        });
      }

      if (fetchCurrentUser) {
        void fetchCurrentUser().catch(() => { });
      }
      if (onClaim) onClaim();

      if (data.streak_saved) {
        toast.info(`Streak Saved!`, {
          description: `Used 1 Freeze. ${data.freezes_left} remains.`,
          icon: <Snowflake className="text-blue-400" size={18} />
        });
      } else {
        toast.success(`Day ${data.streak_day} Claimed!`, {
          description: `+${data.xp_earned} XP added to your core.`,
          icon: <Sparkles className="text-primary" size={18} />
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Transmission failed');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] bg-black border border-white/10 text-white shadow-2xl p-0 overflow-hidden rounded-xl"
        showClose={false}
      >
        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-xl font-bold tracking-tight text-white">
                Daily Rewards
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-6">
            <StreakStats checkInStatus={checkInStatus} />
          </div>

          {/* Content */}
          <div className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-7 gap-1.5">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-white/[0.01] border border-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                <DayGrid
                  checkInStatus={checkInStatus}
                  handleCheckIn={handleCheckIn}
                  checkingIn={checkingIn}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#050505] border-t border-white/[0.03] px-8 py-5 flex items-center justify-center gap-10">
          <div className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Flame size={14} className="text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest font-mono leading-none">Streak</span>
              <span className="text-xs font-bold text-neutral-300 mt-0.5">{checkInStatus?.current_streak || 0} Ready</span>
            </div>
          </div>

          <div className="w-px h-6 bg-white/[0.03]" />

          <div className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Snowflake size={14} className="text-blue-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest font-mono leading-none">Freezes</span>
              <span className="text-xs font-bold text-neutral-300 mt-0.5">{checkInStatus?.freezes_left || 0} Units</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(DailyCheckInModal);
