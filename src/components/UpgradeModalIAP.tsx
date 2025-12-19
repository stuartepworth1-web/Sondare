import { X, Zap, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isNativePlatform, getOfferings, purchasePackage, restorePurchases } from '../lib/purchases';
import { supabase } from '../lib/supabase';

interface UpgradeModalProps {
  onClose: () => void;
  currentTier: 'free' | 'starter' | 'pro' | 'entrepreneur';
  onUpgradeSuccess?: () => void;
}

interface PlanConfig {
  tier: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
  productId: string;
}

export function UpgradeModalIAP({ onClose, currentTier, onUpgradeSuccess }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);
  const isNative = isNativePlatform();

  const plans: PlanConfig[] = [
    {
      tier: 'free',
      name: 'Free',
      price: 'Free',
      credits: 3,
      productId: '',
      features: [
        '3 app generations/month',
        'Basic templates',
        'Export to code',
        'Community support',
      ],
    },
    {
      tier: 'starter',
      name: 'Starter',
      price: '$9.99',
      credits: 50,
      productId: 'com.sondare.app.starter.monthly',
      features: [
        '50 app generations/month',
        'All templates',
        'Export to code',
        'Priority support',
        'Commercial use',
      ],
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: '$19.99',
      credits: 200,
      productId: 'com.sondare.app.pro.monthly',
      features: [
        '200 app generations/month',
        'All templates',
        'Export to code',
        'Premium support',
        'Commercial use',
        'Advanced features',
      ],
    },
    {
      tier: 'entrepreneur',
      name: 'Entrepreneur',
      price: '$49.99',
      credits: 500,
      productId: 'com.sondare.app.entrepreneur.monthly',
      features: [
        '500 app generations/month',
        'All templates',
        'Export to code',
        'Premium support',
        'Commercial use',
        'White label options',
        'API access',
      ],
    },
  ];

  useEffect(() => {
    if (isNative) {
      loadOfferings();
    }
  }, [isNative]);

  const loadOfferings = async () => {
    try {
      const currentOffering = await getOfferings();
      setOfferings(currentOffering);
    } catch (error) {
      console.error('Failed to load offerings:', error);
    }
  };

  const handleUpgrade = async (plan: PlanConfig) => {
    if (plan.tier === 'free' || currentTier === plan.tier) {
      return;
    }

    setLoading(true);

    try {
      if (isNative) {
        await handleIAPPurchase(plan);
      } else {
        await handleStripePurchase(plan);
      }
    } catch (error: any) {
      if (error.code !== 'PURCHASE_CANCELLED_ERROR') {
        alert('Purchase failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIAPPurchase = async (plan: PlanConfig) => {
    if (!offerings?.availablePackages) {
      alert('Products not available. Please try again later.');
      return;
    }

    const packageToPurchase = offerings.availablePackages.find(
      (pkg: any) => pkg.product.identifier === plan.productId
    );

    if (!packageToPurchase) {
      alert('Product not found. Please contact support.');
      return;
    }

    const customerInfo = await purchasePackage(packageToPurchase);

    const user = await supabase.auth.getUser();
    if (user.data.user) {
      await supabase
        .from('profiles')
        .update({
          subscription_tier: plan.tier,
          payment_provider: 'apple_iap',
          subscription_id: customerInfo.originalAppUserId,
          subscription_status: 'active',
        })
        .eq('id', user.data.user.id);

      onUpgradeSuccess?.();
      onClose();
    }
  };

  const handleStripePurchase = async (plan: PlanConfig) => {
    alert('Stripe integration: Redirect to Stripe checkout for ' + plan.name);
  };

  const handleRestore = async () => {
    if (!isNative) return;

    setRestoring(true);
    try {
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active) {
        alert('Purchases restored successfully!');
        onUpgradeSuccess?.();
        onClose();
      } else {
        alert('No active purchases found.');
      }
    } catch (error) {
      alert('Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
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
          {isNative && (
            <div className="flex justify-end">
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="text-sm text-orange-500 hover:text-orange-400 disabled:opacity-50"
              >
                {restoring ? 'Restoring...' : 'Restore Purchases'}
              </button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
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
                    {plan.tier !== 'free' && (
                      <span className="text-white/60">/month</span>
                    )}
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
                  onClick={() => handleUpgrade(plan)}
                  disabled={
                    loading ||
                    currentTier === plan.tier ||
                    plan.tier === 'free'
                  }
                  className="w-full accent-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : currentTier === plan.tier ? (
                    'Current Plan'
                  ) : plan.tier === 'free' ? (
                    'Free'
                  ) : (
                    'Upgrade Now'
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="glass-card p-4 text-center text-sm text-white/60">
            <p>Need more credits? Contact support for custom enterprise plans.</p>
            {isNative && (
              <p className="mt-2">Payment will be charged to your Apple ID account.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
