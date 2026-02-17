import React, { useState } from 'react';
import useAuthStore from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { Gift, CheckCircle, Copy, AlertCircle } from 'lucide-react';

const ReferralSection = () => {
  const { user } = useAuthStore();
  const { redeemReferral } = useUserStore();
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.profile?.referral_code) {
      navigator.clipboard.writeText(user.profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referralCode.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await redeemReferral(referralCode);
      setMessage({ type: 'success', text: `Success! You earned ${result.xp_awarded} XP. Total XP: ${result.new_total_xp}` });
      setReferralCode('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !user.profile) return null;

  return (
    <div className="bg-[#1a1c23] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-[#ffa116]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
          <Gift className="w-5 h-5 text-[#ffa116]" />
          Referral Program
        </h2>

        <div className="flex flex-col gap-6">
          {/* Your Code Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Code</h3>
            <div className="bg-black/40 rounded-xl p-3 border border-white/10 flex items-center justify-between group/code hover:border-[#ffa116]/50 transition-colors">
              <code className="text-lg font-mono font-bold text-[#ffa116] tracking-widest">
                {user.profile.referral_code || '...'}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Copy code"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 w-full"></div>

          {/* Redeem Code Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Redeem</h3>
            
            {user.profile.is_referred ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <p>Code redeemed!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ffa116]/50 transition-colors font-mono"
                    maxLength={12}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !referralCode.trim()}
                    className="bg-[#ffa116] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#ffa116]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-sm"
                  >
                    Go
                  </button>
                </div>
                
                {message && (
                  <div className={`mt-2 flex items-start gap-2 text-xs ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-3 h-3 mt-0.5" /> : <AlertCircle className="w-3 h-3 mt-0.5" />}
                    <span>{message.text}</span>
                  </div>
                )}
              </form>
            )}
            
            {!user.profile.is_referred && (
              <p className="text-xs text-gray-600">
                Get <span className="text-[#ffa116]">100 XP</span> instant bonus.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSection;
