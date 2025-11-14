import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { X, Zap, Check, CheckCircle } from 'lucide-react-native';
import { getOfferings, purchasePackage } from '@/lib/revenuecat';

interface UpgradeModalIAPProps {
  visible: boolean;
  onClose: () => void;
  currentTier: 'free' | 'starter' | 'pro' | 'entrepreneur';
  onUpgradeSuccess?: () => Promise<void>;
}

interface PlanDisplay {
  identifier: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
  highlighted?: boolean;
}

const planDisplayInfo: Record<string, Omit<PlanDisplay, 'identifier' | 'price'>> = {
  starter: {
    name: 'Starter',
    credits: 20,
    features: [
      '20 AI Generations/month',
      'All core features',
      'Export to code',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    credits: 50,
    features: [
      '50 AI Generations/month',
      'All core features',
      'Advanced customization',
      'Priority support',
      'Early access to new features',
    ],
    highlighted: true,
  },
  entrepreneur: {
    name: 'Entrepreneur',
    credits: 200,
    features: [
      '200 AI Generations/month',
      'All Pro features',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'Team collaboration',
    ],
  },
};

export function UpgradeModalIAP({
  visible,
  onClose,
  currentTier,
  onUpgradeSuccess,
}: UpgradeModalIAPProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [offering, setOffering] = useState<any | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [plans, setPlans] = useState<PlanDisplay[]>([]);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    if (Platform.OS === 'web') {
      const mockPlans: PlanDisplay[] = [
        { identifier: 'starter', price: '$4.99', ...planDisplayInfo.starter },
        { identifier: 'pro', price: '$9.99', ...planDisplayInfo.pro },
        { identifier: 'entrepreneur', price: '$29.99', ...planDisplayInfo.entrepreneur },
      ];
      setPlans(mockPlans);
      setIsLoadingOfferings(false);
      return;
    }

    setIsLoadingOfferings(true);
    try {
      const currentOffering = await getOfferings();

      if (currentOffering) {
        setOffering(currentOffering);

        const availablePlans: PlanDisplay[] = currentOffering.availablePackages
          .map((pkg: any) => {
            const identifier = pkg.identifier;
            const displayInfo = planDisplayInfo[identifier];

            if (!displayInfo) return null;

            return {
              identifier,
              name: displayInfo.name,
              price: pkg.product.priceString,
              credits: displayInfo.credits,
              features: displayInfo.features,
              highlighted: displayInfo.highlighted,
            };
          })
          .filter((plan): plan is PlanDisplay => plan !== null);

        setPlans(availablePlans);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const handlePurchase = async (planIdentifier: string) => {
    const plan = plans.find(p => p.identifier === planIdentifier);
    if (!plan) return;

    if (Platform.OS === 'web') {
      setLoadingPlanId(planIdentifier);
      setSuccessMessage('');

      setTimeout(() => {
        setLoadingPlanId(null);
        setSuccessMessage(`${plan.name} plan activated! You now have ${plan.credits} credits.`);

        setTimeout(async () => {
          if (onUpgradeSuccess) {
            await onUpgradeSuccess();
          }
          onClose();
          setSuccessMessage('');
        }, 2000);
      }, 1500);
      return;
    }

    if (!offering) {
      Alert.alert('Error', 'No subscription packages available.');
      return;
    }

    const pkg = offering.availablePackages.find(
      (p: any) => p.identifier === planIdentifier
    );

    if (!pkg) {
      Alert.alert('Error', 'Selected plan not found.');
      return;
    }

    setLoadingPlanId(planIdentifier);
    setSuccessMessage('');

    try {
      const customerInfo = await purchasePackage(pkg);

      if (customerInfo) {
        setLoadingPlanId(null);
        setSuccessMessage(`${plan.name} plan activated! You now have ${plan.credits} credits.`);

        setTimeout(async () => {
          if (onUpgradeSuccess) {
            await onUpgradeSuccess();
          }
          onClose();
          setSuccessMessage('');
        }, 2000);
      } else {
        setLoadingPlanId(null);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setLoadingPlanId(null);
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upgrade Your Plan</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {successMessage ? (
            <View style={styles.successBanner}>
              <CheckCircle size={20} color="#30D158" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {isLoadingOfferings ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9500" />
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : (
            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const isCurrentPlan = currentTier === plan.identifier;
                const isHighlighted = plan.highlighted;

                return (
                  <View
                    key={plan.identifier}
                    style={[
                      styles.planCard,
                      isHighlighted && styles.planCardHighlighted,
                      isCurrentPlan && styles.planCardCurrent,
                    ]}
                  >
                    {isHighlighted && (
                      <View style={styles.popularBadge}>
                        <Zap size={14} color="#000000" />
                        <Text style={styles.popularText}>MOST POPULAR</Text>
                      </View>
                    )}

                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>{plan.price}</Text>
                        <Text style={styles.priceInterval}>/month</Text>
                      </View>
                      <Text style={styles.creditsText}>
                        {plan.credits} AI Generations
                      </Text>
                    </View>

                    <View style={styles.featuresContainer}>
                      {plan.features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                          <Check size={18} color="#30D158" />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.subscribeButton,
                        isCurrentPlan && styles.subscribeButtonDisabled,
                        isHighlighted && styles.subscribeButtonHighlighted,
                        loadingPlanId === plan.identifier && styles.subscribeButtonLoading,
                      ]}
                      onPress={() => handlePurchase(plan.identifier)}
                      disabled={isCurrentPlan || loadingPlanId !== null}
                    >
                      {loadingPlanId === plan.identifier ? (
                        <ActivityIndicator color="#000000" />
                      ) : (
                        <Text
                          style={[
                            styles.subscribeButtonText,
                            isCurrentPlan && styles.subscribeButtonTextDisabled,
                          ]}
                        >
                          {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.footer}>
            {Platform.OS === 'web' && (
              <>
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>WEB PREVIEW</Text>
                </View>
                <Text style={styles.footerText}>
                  This is a web preview. On iOS/Android devices, tapping Subscribe will open the App Store payment sheet.
                </Text>
              </>
            )}
            {Platform.OS !== 'web' && (
              <>
                <Text style={styles.footerText}>
                  Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period.
                </Text>
                <Text style={styles.footerText}>
                  Your account will be charged for renewal within 24 hours prior to the end of the current period.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#38383A',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  plansContainer: {
    paddingVertical: 24,
  },
  planCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardHighlighted: {
    borderColor: '#FF9500',
    backgroundColor: '#1C1C1E',
  },
  planCardCurrent: {
    borderColor: '#30D158',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  planHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  priceInterval: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    marginLeft: 4,
  },
  creditsText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF9500',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonHighlighted: {
    backgroundColor: '#FF9500',
  },
  subscribeButtonDisabled: {
    backgroundColor: '#2C2C2E',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  subscribeButtonTextDisabled: {
    color: '#8E8E93',
  },
  subscribeButtonLoading: {
    opacity: 0.8,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#30D158',
  },
  successText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#30D158',
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  demoBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
});
