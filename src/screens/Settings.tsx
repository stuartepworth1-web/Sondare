import { useState } from 'react';
import {
  User,
  CreditCard,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Crown,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  onShowUpgrade: () => void;
}

export function Settings({ onShowUpgrade }: SettingsProps) {
  const { user, profile, signOut } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const totalCredits = (profile?.credits_remaining || 0) + (profile?.credits_purchased || 0);

  const tierInfo = {
    free: { name: 'Free', price: '$0/month', credits: 3, color: 'text-gray-400' },
    pro: { name: 'Starter', price: '$9.99/month', credits: 50, color: 'text-blue-500' },
    entrepreneur: { name: 'Pro', price: '$19.99/month', credits: 200, color: 'text-orange-500' },
  };

  const currentTier = profile?.subscription_tier || 'free';
  const tierData = tierInfo[currentTier as keyof typeof tierInfo] || tierInfo.free;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase.rpc('delete_user_account', {
        user_id: user?.id,
      });

      if (error) throw error;

      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
    }
  };

  const openUrl = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="min-h-screen pb-24 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-white/60 text-xs sm:text-sm">Manage your account and preferences</p>
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile?.email}</p>
            <p className={`text-sm ${tierData.color}`}>{tierData.name} Plan</p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Credits Available</span>
            <span className="font-semibold text-orange-500">{totalCredits}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Monthly Limit</span>
            <span className="font-medium">{tierData.credits} credits</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold px-1">Subscription</h3>

        <button
          onClick={onShowUpgrade}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Crown className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Upgrade Plan</p>
              <p className="text-xs text-white/60">Get more credits and features</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>

        <button
          onClick={onShowUpgrade}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Manage Subscription</p>
              <p className="text-xs text-white/60">View billing and invoices</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold px-1">Legal & Support</h3>

        <button
          onClick={() => openUrl('/privacy-policy')}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Privacy Policy</p>
              <p className="text-xs text-white/60">How we handle your data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>

        <button
          onClick={() => openUrl('/terms-of-service')}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Terms of Service</p>
              <p className="text-xs text-white/60">App usage terms</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>

        <button
          onClick={() => openUrl('/support')}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <HelpCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Help & Support</p>
              <p className="text-xs text-white/60">Get help or contact us</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold px-1">Account</h3>

        <button
          onClick={signOut}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <LogOut className="w-5 h-5 text-white/80" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-xs text-white/60">Sign out of your account</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full glass-card p-4 flex items-center justify-between hover:bg-red-500/10 transition-colors active:scale-[0.98] border border-red-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm text-red-500">Delete Account</p>
              <p className="text-xs text-white/60">Permanently delete your account and data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-500/40" />
        </button>
      </div>

      <div className="glass-card p-4 space-y-2 bg-white/5">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Smartphone className="w-4 h-4" />
          <span>Version 1.0.0</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Mail className="w-4 h-4" />
          <span>support@sondare.com</span>
        </div>
        <p className="text-xs text-white/40 pt-2">
          Made with care for app creators worldwide
        </p>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Account</h3>
              <p className="text-white/60 text-sm">
                This action cannot be undone. All your projects, data, and subscription will be permanently deleted.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="text-red-500 font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="input-field"
                placeholder="DELETE"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 glass-button py-3"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
