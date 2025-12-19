# Apple In-App Purchase Setup Guide

This guide will help you set up Apple IAP and RevenueCat for your Sondare app.

## Step 1: App Store Connect Configuration

### Create Subscription Group
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app (Sondare)
3. Go to **Features** → **In-App Purchases**
4. Click **+** to create a new Subscription Group
5. Name it: "Sondare Subscriptions"
6. Reference Name: "Sondare Subscriptions"

### Create Auto-Renewable Subscriptions

Create these 2 subscriptions in your subscription group:

#### Starter Plan
- **Product ID**: `com.sondare.app.starter.monthly`
- **Subscription Duration**: 1 month
- **Price**: $9.99/month
- **Display Name** (English US): Starter Plan
- **Description** (English US): 50 app generations per month with all templates and priority support

#### Pro Plan
- **Product ID**: `com.sondare.app.pro.monthly`
- **Subscription Duration**: 1 month
- **Price**: $19.99/month
- **Display Name** (English US): Pro Plan
- **Description** (English US): 200 app generations per month with premium support and white label options

### Localization
For each subscription, add at least one localization (English - US is required).

### App Information
Make sure these are filled in App Store Connect:
- Subscription Group Display Name
- App Name for Subscriptions
- Review Screenshot showing subscription purchase flow

## Step 2: RevenueCat Setup

### Create RevenueCat Account
1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Sign up for a free account
3. Create a new project named "Sondare"

### Configure iOS App
1. In RevenueCat dashboard, go to **Projects** → **Apps**
2. Click **Add App** → **iOS**
3. Enter:
   - **App Name**: Sondare
   - **Bundle ID**: `com.sondare.app`
4. Upload your App Store Connect API Key:
   - Go to App Store Connect → Users and Access → Keys → App Store Connect API
   - Generate a new key with "App Manager" access
   - Download the .p8 file
   - Upload to RevenueCat

### Link Products
1. In RevenueCat, go to **Products**
2. Click **Add Product**
3. Create an entitlement for each tier:
   - **Entitlement ID**: `starter` → Link to `com.sondare.app.starter.monthly`
   - **Entitlement ID**: `pro` → Link to `com.sondare.app.pro.monthly`

### Create Offering
1. Go to **Offerings**
2. Create a new offering named "Default"
3. Add both packages to the offering

### Setup Webhook
1. In RevenueCat, go to **Integrations** → **Webhooks**
2. Add new webhook:
   - **URL**: `https://wzqjcrzfypxihnxokbwt.supabase.co/functions/v1/revenuecat-webhook`
   - **Events**: Select all subscription events
3. Save the webhook

### Get API Keys
1. In RevenueCat, go to **API Keys**
2. Copy your **iOS API Key** (starts with `appl_`)
3. Update `.env` file:
   ```
   VITE_REVENUECAT_IOS_KEY=appl_your_key_here
   ```

## Step 3: Testing

### Create Sandbox Tester
1. Go to App Store Connect → Users and Access → Sandbox Testers
2. Create a new sandbox tester account
3. Use a unique email (doesn't need to be real)
4. Remember the password

### Test on Device
1. Build and install the app on a physical iOS device (not simulator)
2. Sign out of your Apple ID in Settings → App Store
3. Launch the app
4. Tap "Upgrade Now" on any plan
5. When prompted, sign in with your sandbox tester account
6. Complete the purchase (it's free in sandbox)
7. Verify the subscription is active

### Verify in RevenueCat
1. Go to RevenueCat dashboard → Customers
2. Search for your test user
3. Verify the subscription shows as active

## Step 4: Production Checklist

Before submitting to App Review:

- [ ] All subscriptions are approved in App Store Connect
- [ ] Subscription group has proper localization
- [ ] RevenueCat webhook is configured and receiving events
- [ ] Tested subscription purchase flow in sandbox
- [ ] Tested restore purchases functionality
- [ ] Updated Privacy Policy to mention in-app purchases
- [ ] Prepared screenshots showing subscription options for review
- [ ] Tested cancellation and renewal flows

## Troubleshooting

### "Unable to purchase"
- Verify product IDs match exactly in App Store Connect and code
- Check that subscriptions are in "Ready to Submit" status
- Ensure you're using a sandbox tester account

### "Products not loading"
- Check RevenueCat API key is correct in `.env`
- Verify App Store Connect API key is uploaded to RevenueCat
- Wait a few minutes for Apple to sync products

### "Webhook not receiving events"
- Check webhook URL is correct in RevenueCat
- Verify Supabase edge function is deployed
- Check edge function logs in Supabase dashboard

## Stripe Integration (Web)

For web-based subscriptions using Stripe:

1. Get your Stripe Publishable Key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Update `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```
3. Implement Stripe checkout in the `handleStripePurchase` function in `UpgradeModalIAP.tsx`

The app automatically detects if it's running on iOS (uses Apple IAP) or web (uses Stripe).
