import { Platform } from 'react-native';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'entrepreneur';

let Purchases: any = null;
let PurchasesOffering: any = null;
let PurchasesPackage: any = null;
let CustomerInfo: any = null;
let LOG_LEVEL: any = null;

if (Platform.OS !== 'web') {
  try {
    const purchasesModule = require('react-native-purchases');
    Purchases = purchasesModule.default;
    PurchasesOffering = purchasesModule.PurchasesOffering;
    PurchasesPackage = purchasesModule.PurchasesPackage;
    CustomerInfo = purchasesModule.CustomerInfo;
    LOG_LEVEL = purchasesModule.LOG_LEVEL;
  } catch (error) {
    console.warn('react-native-purchases not available:', error);
  }
}

const REVENUECAT_APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY || '';

const ENTITLEMENT_IDENTIFIERS = {
  starter: 'starter',
  pro: 'pro',
  entrepreneur: 'entrepreneur',
};

export async function configureRevenueCat(): Promise<void> {
  if (Platform.OS === 'web' || !Purchases) {
    console.log('RevenueCat: Skipping configuration on web platform');
    return;
  }

  try {
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_APPLE_API_KEY });
    }

    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    console.log('RevenueCat: Configured successfully');
  } catch (error) {
    console.error('RevenueCat: Configuration error:', error);
    throw error;
  }
}

export async function getOfferings(): Promise<any | null> {
  if (Platform.OS === 'web' || !Purchases) {
    console.log('RevenueCat: getOfferings not available on web');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      return offerings.current;
    }
    console.log('RevenueCat: No current offering available');
    return null;
  } catch (error) {
    console.error('RevenueCat: Error fetching offerings:', error);
    return null;
  }
}

export async function purchasePackage(pkg: any): Promise<any | null> {
  if (Platform.OS === 'web' || !Purchases) {
    console.log('RevenueCat: Purchase not available on web');
    return null;
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    console.log('RevenueCat: Purchase successful', customerInfo);
    return customerInfo;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('RevenueCat: Purchase error:', error);
    }
    return null;
  }
}

export async function restorePurchases(): Promise<any | null> {
  if (Platform.OS === 'web' || !Purchases) {
    console.log('RevenueCat: Restore not available on web');
    return null;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('RevenueCat: Purchases restored', customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Error restoring purchases:', error);
    return null;
  }
}

export async function getCustomerInfo(): Promise<any | null> {
  if (Platform.OS === 'web' || !Purchases) {
    console.log('RevenueCat: getCustomerInfo not available on web');
    return null;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Error getting customer info:', error);
    return null;
  }
}

export function getActiveSubscriptionTier(customerInfo: any | null): SubscriptionTier {
  if (!customerInfo) {
    return 'free';
  }

  const { entitlements } = customerInfo;

  if (entitlements.active[ENTITLEMENT_IDENTIFIERS.entrepreneur]) {
    return 'entrepreneur';
  }
  if (entitlements.active[ENTITLEMENT_IDENTIFIERS.pro]) {
    return 'pro';
  }
  if (entitlements.active[ENTITLEMENT_IDENTIFIERS.starter]) {
    return 'starter';
  }

  return 'free';
}

export function getCreditsForTier(tier: SubscriptionTier): number {
  switch (tier) {
    case 'starter':
      return 20;
    case 'pro':
      return 50;
    case 'entrepreneur':
      return 200;
    default:
      return 3;
  }
}
