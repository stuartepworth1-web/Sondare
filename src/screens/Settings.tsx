import { CreditCard, User, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsProps {
  onShowUpgrade: () => void;
}

export function Settings({ onShowUpgrade }: SettingsProps) {
  const { profile, user } = useAuth();

  const creditsRemaining = profile?.credits_remaining || 0;
  const creditsTotal = profile?.credits_total || 3;
  const currentTier = profile?.subscription_tier || 'free';

  return (
    <div className="min-h-screen pb-24 pt-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-white/60">Manage your account and subscription</p>
        </div>

        {/* Credits Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">AI Generation Credits</h3>
                <p className="text-sm text-white/60">
                  {creditsRemaining} of {creditsTotal} remaining
                </p>
              </div>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all"
              style={{ width: `${(creditsRemaining / creditsTotal) * 100}%` }}
            />
          </div>

          <button
            onClick={onShowUpgrade}
            className="w-full accent-button flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Upgrade Plan
          </button>
        </div>

        {/* Current Plan */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-lg">Current Plan</h3>
          <div className="space-y-2">
            <p className="text-xl font-bold text-orange-500 capitalize">
              {currentTier === 'free' ? 'Free Plan' :
               currentTier === 'starter' ? 'Starter Plan' :
               currentTier === 'pro' ? 'Pro Plan' : 'Entrepreneur Plan'}
            </p>
            <p className="text-white/60">
              {creditsTotal} AI Generations per month
            </p>
          </div>
          <button
            onClick={onShowUpgrade}
            className="glass-button w-full"
          >
            Change Plan
          </button>
        </div>

        {/* Account */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-lg">Account</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-white/60">Account Email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
