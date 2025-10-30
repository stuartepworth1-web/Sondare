import { X, Zap, Check } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
  currentTier: 'free' | 'starter' | 'pro' | 'entrepreneur';
}

export function UpgradeModal({ onClose, currentTier }: UpgradeModalProps) {
  const plans = [
    {
      tier: 'free',
      name: 'Free Plan',
      price: 'Free',
      credits: 3,
      features: [
        '3 AI generations per month',
        'Basic templates',
        'Community support',
        'Export to web',
      ],
    },
    {
      tier: 'starter',
      name: 'Starter Plan',
      price: '$4.99',
      credits: 20,
      features: [
        '20 AI generations per month',
        'Email support',
        'Basic templates',
        'Export to iOS & Android',
      ],
    },
    {
      tier: 'pro',
      name: 'Pro Plan',
      price: '$9.99',
      credits: 50,
      features: [
        '50 AI generations per month',
        'Priority support',
        'Advanced templates',
        'Export to iOS & Android',
      ],
    },
    {
      tier: 'entrepreneur',
      name: 'Entrepreneur Plan',
      price: '$29.99',
      credits: 200,
      features: [
        '200 AI generations per month',
        'Priority support',
        'All templates',
        'Export to iOS & Android',
        'Custom branding',
        'Team collaboration',
      ],
    },
  ];

  const handleUpgrade = (tier: string) => {
    alert(`Stripe integration needed. Selected: ${tier}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black/40 backdrop-blur-md p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Upgrade Your Plan</h2>
          <button
            onClick={onClose}
            className="glass-button p-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`glass-card p-6 space-y-4 ${
                  currentTier === plan.tier ? 'border-2 border-orange-500' : ''
                }`}
              >
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-orange-500">
                      {plan.price}
                    </span>
                    <span className="text-white/60">/month</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-orange-500 mb-4">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">
                      {plan.credits} Credits/month
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={currentTier === plan.tier || plan.tier === 'free'}
                  className="w-full accent-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentTier === plan.tier ? 'Current Plan' : plan.tier === 'free' ? 'Free' : 'Upgrade Now'}
                </button>
              </div>
            ))}
          </div>

          <div className="glass-card p-4 text-center text-sm text-white/60">
            <p>Need more credits? Contact support for custom enterprise plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
