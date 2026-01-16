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
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [error, setError] = useState<string>('');
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
      productId: 'starter_monthly',
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
      productId: 'pro_monthly',
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
      productId: 'entrepreneur_monthly',
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
    setLoadingOfferings(true);
    setError('');
    try {
      const currentOffering = await getOfferings();
      console.log('Loaded offerings:', currentOffering);
      setOfferings(currentOffering);
      if (!currentOffering?.availablePackages || currentOffering.availablePackages.length === 0) {
        console.error('No packages found in offerings');
        setError('Subscription plans are not currently available. This may be because the app is in review. Please try again later or contact support.');
      }
    } catch (error: any) {
      console.error('Failed to load offerings:', error);
      setError(`Unable to load subscription plans: ${error.message || 'Unknown error'}. Please check your internet connection and try again.`);
    } finally {
      setLoadingOfferings(false);
    }
  };

  const handleUpgrade = async (plan: PlanConfig) => {
    if (plan.tier === 'free' || currentTier === plan.tier) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isNative) {
        await handleIAPPurchase(plan);
      } else {
        await handleStripePurchase(plan);
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error.code === 'PURCHASE_CANCELLED_ERROR') {
        setError('Purchase was cancelled.');
      } else if (error.code === 'STORE_PROBLEM_ERROR') {
        setError('Unable to connect to the App Store. Please check your internet connection and try again.');
      } else if (error.code === 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR') {
        setError('This subscription is currently not available. Please try again later.');
      } else {
        setError(error.message || 'Purchase failed. Please check your payment method and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIAPPurchase = async (plan: PlanConfig) => {
    console.log('Starting IAP purchase for plan:', plan.name);

    if (!offerings?.availablePackages || offerings.availablePackages.length === 0) {
      console.error('No offerings available');
      throw new Error('Subscription plans are not currently available. This may be because the app is in review. Please try the "Restore Purchases" option if you\'ve already subscribed, or contact support.');
    }

    console.log('Available packages:', offerings.availablePackages.map((p: any) => ({
      identifier: p.identifier,
      productId: p.product.identifier
    })));

    const packageToPurchase = offerings.availablePackages.find(
      (pkg: any) => pkg.identifier === plan.productId || pkg.product.identifier === plan.productId
    );

    if (!packageToPurchase) {
      console.error(`Package not found for identifier: ${plan.productId}`);
      console.error('Available packages:', offerings.availablePackages);
      throw new Error(`The ${plan.name} subscription plan is currently unavailable. Please try again later or contact support.`);
    }

    console.log('Purchasing package:', packageToPurchase.identifier, 'with product:', packageToPurchase.product.identifier);
    const customerInfo = await purchasePackage(packageToPurchase);
    console.log('Purchase successful, updating profile');

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('You must be logged in to purchase a subscription.');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: plan.tier,
        payment_provider: 'apple_iap',
        subscription_id: customerInfo.originalAppUserId,
        subscription_status: 'active',
      })
      .eq('id', user.data.user.id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      throw new Error('Failed to update your subscription. Please contact support.');
    }

    console.log('Profile updated successfully');
    onUpgradeSuccess?.();
    onClose();
  };

  const handleStripePurchase = async (plan: PlanConfig) => {
    alert('Stripe integration: Redirect to Stripe checkout for ' + plan.name);
  };

  const handleRestore = async () => {
    if (!isNative) return;

    setRestoring(true);
    setError('');
    try {
      const customerInfo = await restorePurchases();

      if (customerInfo.entitlements.active && Object.keys(customerInfo.entitlements.active).length > 0) {
        setError('');
        onUpgradeSuccess?.();
        onClose();
      } else {
        setError('No active purchases found. If you believe this is an error, please contact support.');
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      setError('Failed to restore purchases. Please check your internet connection and try again.');
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
          {error && !loading && !restoring && (
            <div className="glass-card p-4 bg-red-500/10 border border-red-500/30 space-y-3">
              <p className="text-red-400 text-sm">{error}</p>
              {error.includes('subscription plans') && (
                <button
                  onClick={loadOfferings}
                  className="glass-button px-4 py-2 text-sm"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {loadingOfferings && (
            <div className="glass-card p-8 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <p className="text-white/60">Loading subscription plans...</p>
            </div>
          )}

          {!loadingOfferings && isNative && (
            <div className="flex justify-end">
              <button
                onClick={handleRestore}
                disabled={restoring || loading}
                className="text-sm text-orange-500 hover:text-orange-400 disabled:opacity-50"
              >
                {restoring ? 'Restoring...' : 'Restore Purchases'}
              </button>
            </div>
          )}

          {!loadingOfferings && (
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
          )}

          {!loadingOfferings && (
            <div className="glass-card p-4 text-center text-sm text-white/60">
              <p>Need more credits? Contact support for custom enterprise plans.</p>
              {isNative && (
                <p className="mt-2">Payment will be charged to your Apple ID account.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
