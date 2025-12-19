import { Sparkles, Zap, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  onShowHowTo: () => void;
  onNavigate: (tab: 'home' | 'builder' | 'design' | 'projects') => void;
  onShowUpgrade: () => void;
}

export function Home({ onShowHowTo, onNavigate, onShowUpgrade }: HomeProps) {
  const { profile, signOut } = useAuth();

  const totalCredits = (profile?.credits_remaining || 0) + (profile?.credits_purchased || 0);

  const tierInfo = {
    free: { name: 'Free Plan', limit: 3, color: 'text-gray-400' },
    pro: { name: 'Pro Plan', limit: 50, color: 'text-orange-500' },
    entrepreneur: { name: 'Entrepreneur Plan', limit: 200, color: 'text-orange-600' },
  };

  const currentTier = tierInfo[profile?.subscription_tier || 'free'];

  return (
    <div className="min-h-screen pb-24 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">Welcome Back</h1>
          <p className="text-white/60 text-xs sm:text-sm truncate">{profile?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="glass-button p-3 ml-2 flex-shrink-0"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs sm:text-sm">Current Plan</p>
            <h2 className={`text-lg sm:text-xl font-bold ${currentTier.color}`}>
              {currentTier.name}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs sm:text-sm">Credits</p>
            <p className="text-xl sm:text-2xl font-bold">{totalCredits}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Monthly limit</span>
            <span className="font-medium">{currentTier.limit} credits</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-semibold">Quick Actions</h3>

        <button onClick={() => onNavigate('design')} className="w-full glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-colors active:scale-[0.98]">
          <div className="bg-orange-500/20 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base">Start New Project</h4>
            <p className="text-white/60 text-xs sm:text-sm">Choose a template and start building</p>
          </div>
        </button>

        <button onClick={onShowUpgrade} className="w-full glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-colors active:scale-[0.98]">
          <div className="bg-blue-500/20 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base">Upgrade Plan</h4>
            <p className="text-white/60 text-xs sm:text-sm">Get more credits and features</p>
          </div>
        </button>

        <button onClick={onShowHowTo} className="w-full glass-card p-4 flex items-center gap-3 hover:bg-white/10 transition-colors active:scale-[0.98]">
          <div className="bg-green-500/20 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base">How to Use Sondare</h4>
            <p className="text-white/60 text-xs sm:text-sm">Learn mobile vs laptop features</p>
          </div>
        </button>
      </div>

      <div className="glass-card p-4 sm:p-6 space-y-3">
        <h3 className="font-semibold text-sm sm:text-base">Getting Started</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-white/60">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">1.</span>
            <span>Choose a template or start from scratch</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">2.</span>
            <span>Drag and drop components to customize your app</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">3.</span>
            <span>Export and deploy your app to app stores</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
