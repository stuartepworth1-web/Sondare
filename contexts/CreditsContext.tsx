import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import {
  configureRevenueCat,
  getCustomerInfo,
  getActiveSubscriptionTier,
  getCreditsForTier,
  type SubscriptionTier,
} from '@/lib/revenuecat';

let Purchases: any = null;
if (Platform.OS !== 'web') {
  try {
    Purchases = require('react-native-purchases').default;
  } catch (error) {
    console.warn('react-native-purchases not available');
  }
}

interface CreditsContextType {
  credits: number;
  creditsUsed: number;
  currentTier: SubscriptionTier;
  useCredit: () => void;
  setTier: (tier: SubscriptionTier) => void;
  refreshSubscriptionStatus: () => Promise<void>;
  isLoading: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const credits = getCreditsForTier(currentTier);

  const updateSubscriptionStatus = async () => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      return;
    }

    try {
      const customerInfo = await getCustomerInfo();
      const tier = getActiveSubscriptionTier(customerInfo);
      setCurrentTier(tier);
    } catch (error) {
      console.error('Error updating subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    await updateSubscriptionStatus();
  };

  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (Platform.OS === 'web') {
        setIsLoading(false);
        return;
      }

      try {
        await configureRevenueCat();
        await updateSubscriptionStatus();

        if (Purchases) {
          const customerInfoUpdateListener = (info: any) => {
            const tier = getActiveSubscriptionTier(info);
            setCurrentTier(tier);
          };

          Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

          return () => {
            Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
          };
        }
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, []);

  const useCredit = () => {
    if (creditsUsed < credits) {
      setCreditsUsed(prev => prev + 1);
    }
  };

  const setTier = (tier: SubscriptionTier) => {
    setCurrentTier(tier);
    setCreditsUsed(0);
  };

  return (
    <CreditsContext.Provider
      value={{
        credits,
        creditsUsed,
        currentTier,
        useCredit,
        setTier,
        refreshSubscriptionStatus,
        isLoading,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
