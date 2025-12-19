import { Capacitor } from '@capacitor/core';

export const PRODUCT_IDS = {
  starter: 'com.sondare.app.starter.monthly',
  pro: 'com.sondare.app.pro.monthly',
  entrepreneur: 'com.sondare.app.entrepreneur.monthly',
} as const;

const REVENUECAT_API_KEY_IOS = import.meta.env.VITE_REVENUECAT_IOS_KEY;

let Purchases: any = null;
let LOG_LEVEL: any = null;

async function loadPurchases() {
  if (Capacitor.isNativePlatform() && !Purchases) {
    try {
      const packageName = '@revenuecat/purchases-capacitor';
      const module = await import(/* @vite-ignore */ packageName);
      Purchases = module.Purchases;
      LOG_LEVEL = module.LOG_LEVEL;
    } catch (error) {
      console.error('Failed to load purchases module:', error);
    }
  }
}

export async function initializePurchases(userId: string) {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await loadPurchases();
    if (Purchases && LOG_LEVEL) {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY_IOS,
        appUserID: userId,
      });
    }
  } catch (error) {
    console.error('Failed to initialize purchases:', error);
  }
}

export async function getOfferings() {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    await loadPurchases();
    if (Purchases) {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    }
    return null;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any) {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Purchases only available on native platforms');
  }

  try {
    await loadPurchases();
    if (!Purchases) {
      throw new Error('Purchases module not available');
    }
    const purchaseResult = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });
    return purchaseResult.customerInfo;
  } catch (error: any) {
    if (error.code === 'PURCHASE_CANCELLED_ERROR') {
      console.log('User cancelled purchase');
    } else {
      console.error('Purchase error:', error);
    }
    throw error;
  }
}

export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Purchases only available on native platforms');
  }

  try {
    await loadPurchases();
    if (!Purchases) {
      throw new Error('Purchases module not available');
    }
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
}

export async function getCustomerInfo() {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    await loadPurchases();
    if (Purchases) {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.customerInfo;
    }
    return null;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

export function getCurrentTierFromEntitlements(entitlements: any): 'free' | 'starter' | 'pro' | 'entrepreneur' {
  if (!entitlements || !entitlements.active) {
    return 'free';
  }

  if (entitlements.active['entrepreneur']) {
    return 'entrepreneur';
  }
  if (entitlements.active['pro']) {
    return 'pro';
  }
  if (entitlements.active['starter']) {
    return 'starter';
  }

  return 'free';
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}
