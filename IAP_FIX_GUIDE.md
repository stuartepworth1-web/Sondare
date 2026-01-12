# IAP Configuration Fix Guide

This guide will help you resolve the In-App Purchase errors reported by Apple during app review.

## Error from Apple Review

> "The In-App Purchase products in the app exhibited one or more bugs which create a poor user experience. Specifically, we received the attached error when we tried to purchase a plan."

## Root Cause

The IAP products are not properly configured in App Store Connect, or the product IDs don't match between your app and App Store Connect.

## Required Product IDs

Your app expects the following product IDs:

1. `com.sondare.app.starter.monthly` - Starter Plan ($9.99/month)
2. `com.sondare.app.pro.monthly` - Pro Plan ($19.99/month)
3. `com.sondare.app.entrepreneur.monthly` - Entrepreneur Plan ($49.99/month)

## Step-by-Step Fix

### 1. Configure In-App Purchases in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app "Sondare"
3. Go to **Features** → **In-App Purchases**
4. For each product, ensure:
   - Product ID matches EXACTLY (case-sensitive)
   - Status is **"Ready to Submit"** or **"Approved"**
   - At least one localization is added
   - Price is set correctly
   - Screenshot is uploaded (required for subscriptions)

### 2. Create the Products (if not already created)

For each subscription:

**Product Type:** Auto-Renewable Subscription

**Reference Name:** [Starter/Pro/Entrepreneur] Monthly

**Product ID:** `com.sondare.app.[starter/pro/entrepreneur].monthly`

**Subscription Group:** Create a group called "Sondare Subscriptions"

**Subscription Duration:** 1 Month

**Price:**
- Starter: $9.99
- Pro: $19.99
- Entrepreneur: $49.99

### 3. Add Required Metadata

For EACH subscription, you must add:

#### Subscription Display Name
- English (U.S.): [Plan Name] Monthly

#### Description
- English (U.S.): Access to [features description]

#### Review Information
- Add a screenshot (1242 x 2208 pixels recommended)
- Add review notes explaining the subscription

### 4. Configure RevenueCat

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Go to **Products** → **iOS**
4. Verify each product ID is listed and marked as "Available"
5. Go to **Offerings** → Create an offering called "default" if not exists
6. Add all three products to the default offering
7. Make sure the offering is marked as "Current"

### 5. Test in Sandbox

1. Create a Sandbox Tester account in App Store Connect:
   - Users and Access → Sandbox Testers
   - Create a new tester with unique email
2. Sign out of your App Store account on your device
3. Build and run the app
4. Try to purchase - it will prompt for sandbox credentials
5. Sign in with sandbox tester
6. Complete the purchase flow

### 6. Verify Paid Apps Agreement

1. In App Store Connect, go to **Agreements, Tax, and Banking**
2. Ensure **Paid Apps Agreement** is signed and status is **Active**
3. Add banking and tax information if not already done

## Common Issues

### Issue: "No subscription plans available"
- **Cause:** Products not created or not marked as "Ready to Submit"
- **Fix:** Complete all metadata for each product in App Store Connect

### Issue: "Product not available for purchase"
- **Cause:** Product ID mismatch between app and App Store Connect
- **Fix:** Double-check product IDs are EXACTLY the same (case-sensitive)

### Issue: "Unable to connect to the App Store"
- **Cause:** No internet connection or App Store services down
- **Fix:** Check internet connection and try again

### Issue: Purchase works in sandbox but not in review
- **Cause:** Products not submitted for review
- **Fix:** Ensure products are submitted along with the app binary

## Verification Checklist

Before resubmitting to Apple, verify:

- [ ] All 3 IAP products are created in App Store Connect
- [ ] Product IDs match exactly: `com.sondare.app.[tier].monthly`
- [ ] All products have status "Ready to Submit" or "Approved"
- [ ] Each product has localized name and description
- [ ] Each product has a screenshot uploaded
- [ ] Products are in a Subscription Group
- [ ] Subscription Group has a name and localization
- [ ] Paid Apps Agreement is signed and active
- [ ] Banking and tax info is complete
- [ ] Products are configured in RevenueCat
- [ ] Default offering in RevenueCat includes all products
- [ ] Tested successfully with Sandbox tester

## Important Notes

1. **Products must be submitted WITH your app binary** - They don't need prior approval but must be included in the submission
2. **Sandbox testing is different from production** - Products that work in sandbox may still have issues in review if not properly configured
3. **Review process** - IAP products are reviewed along with your app. They must be ready when you submit.

## Support

If you continue to have issues after following this guide:

1. Check the Console logs during purchase attempt (look for errors)
2. Verify RevenueCat dashboard shows successful initialization
3. Contact RevenueCat support with your App User ID and error logs
4. Contact Apple Developer Support through App Store Connect
