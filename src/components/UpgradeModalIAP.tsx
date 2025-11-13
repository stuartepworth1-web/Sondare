import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Zap, Check } from 'lucide-react-native';

interface UpgradeModalIAPProps {
  visible: boolean;
  onClose: () => void;
  currentTier: 'free' | 'starter' | 'pro' | 'entrepreneur';
  onUpgradeSuccess?: () => void;
}

interface PlanData {
  id: string;
  name: string;
  price: string;
  credits: number;
  features: string[];
  highlighted?: boolean;
}

const plans: PlanData[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$4.99',
    credits: 20,
    features: [
      '20 AI Generations/month',
      'All core features',
      'Export to code',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
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
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    price: '$29.99',
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
];

export function UpgradeModalIAP({
  visible,
  onClose,
  currentTier,
  onUpgradeSuccess,
}: UpgradeModalIAPProps) {
  const handlePurchase = async (planId: string) => {
    console.log('Purchase initiated for plan:', planId);

    // TODO: Implement RevenueCat purchase flow
    // Example:
    // try {
    //   const purchaseResult = await Purchases.purchasePackage(package);
    //   onUpgradeSuccess?.();
    //   onClose();
    // } catch (error) {
    //   console.error('Purchase error:', error);
    // }
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
          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const isCurrentPlan = currentTier === plan.id;
              const isHighlighted = plan.highlighted;

              return (
                <View
                  key={plan.id}
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
                    ]}
                    onPress={() => handlePurchase(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    <Text
                      style={[
                        styles.subscribeButtonText,
                        isCurrentPlan && styles.subscribeButtonTextDisabled,
                      ]}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Subscriptions automatically renew unless auto-renew is turned off
              at least 24 hours before the end of the current period.
            </Text>
            <Text style={styles.footerText}>
              Your account will be charged for renewal within 24 hours prior to
              the end of the current period.
            </Text>
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
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 8,
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
