import { useState } from 'react';
import { X, Check, Loader2, Zap, Crown, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalWebProps {
  onClose: () => void;
  currentTier: string;
}

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      '3 Active Projects',
      '100 AI Generations per month',
      'Basic Components Library',
      'Export to React Native',
      'Community Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Crown,
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    popular: true,
    features: [
      '10 Active Projects',
      'Unlimited AI Generations',
      'Premium Components & Templates',
      'Advanced Code Export',
      'Priority Support',
      'Custom Branding',
    ],
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: Rocket,
    monthlyPrice: 79.99,
    yearlyPrice: 799.99,
    features: [
      'Unlimited Projects',
      'Unlimited AI Generations',
      'All Premium Features',
      'White Label Solutions',
      'Dedicated Support',
      'API Access',
      'Team Collaboration',
    ],
  },
];

export function UpgradeModalWeb({ onClose, currentTier }: UpgradeModalWebProps) {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tierId: string) => {
    if (!user) {
      setError('Please sign in to upgrade');
      return;
    }

    setLoading(tierId);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierId,
          userId: user.id,
          isYearly,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-6xl w-full my-8">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
            <p className="text-white/60 text-sm mt-1">Choose the perfect plan for your needs</p>
          </div>
          <button onClick={onClose} className="glass-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-white/60'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                isYearly ? 'bg-orange-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-white/60'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-medium">
                Save 17%
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
              const isLoading = loading === tier.id;
              const isCurrent = tier.id === currentTier;

              return (
                <div
                  key={tier.id}
                  className={`relative glass-card p-6 transition-all ${
                    tier.popular ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 mb-4">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">${price}</span>
                      <span className="text-white/60">/{isYearly ? 'year' : 'month'}</span>
                    </div>
                    {isYearly && (
                      <p className="text-xs text-white/40 mt-1">
                        ${(price / 12).toFixed(2)}/month billed annually
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isLoading || isCurrent}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      isCurrent
                        ? 'bg-white/5 text-white/40 cursor-not-allowed'
                        : tier.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                        : 'glass-button hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      `Choose ${tier.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center text-sm text-white/60">
            <p>
              Secure payment processing powered by Stripe.{' '}
              <a href="/terms-of-service" className="text-orange-500 hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy-policy" className="text-orange-500 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
