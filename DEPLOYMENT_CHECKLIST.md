# Deployment Checklist for Sondare

## ⚠️ CRITICAL: Update Before First Build

### 🎯 Step 1: Get Your App Store ID

**You must complete this BEFORE building in Codemagic:**

1. Log in to **App Store Connect**: https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** icon → **"New App"**
3. Fill in the details:
   - **Platform**: iOS
   - **Name**: Sondare
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.sondare.app` (must already be registered with your Apple Developer account)
   - **SKU**: Enter a unique identifier (e.g., `sondare-001`)
4. Click **Create**
5. In your new app, go to **App Information**
6. Find **"Apple ID"** (it's a number like `6736521843`)
7. **Copy this number** - you'll need it next

### 🔧 Step 2: Update Codemagic Configuration

**File**: `codemagic.yaml`
**Line 16**: Replace the placeholder App Store ID

**Find this line:**
```yaml
APP_STORE_APPLE_ID: 1234567890
```

**Replace with your actual App Store ID:**
```yaml
APP_STORE_APPLE_ID: 6736521843  # ← Your real ID from App Store Connect
```

### 📧 Step 3: Update Email Notifications

**File**: `codemagic.yaml`
**Lines 79 and 112**: Replace with your actual email

**Find:**
```yaml
recipients:
  - your-email@example.com
```

**Replace with:**
```yaml
recipients:
  - your-actual-email@domain.com
```

---

## 📋 Complete Pre-Build Checklist

### ✅ Codemagic Setup
- [ ] **App Store Connect Integration** configured in Codemagic:
  - Go to: Codemagic → Teams → Integrations → App Store Connect
  - Name it: **"Sondare"**
  - Add your App Store Connect API key
- [ ] **Signing Certificates** uploaded to Codemagic:
  - iOS Distribution certificate for `com.sondare.app`
  - Provisioning profile for App Store distribution
- [ ] **Configuration File** updated:
  - `APP_STORE_APPLE_ID` → Your **REAL** App Store ID (NOT 1234567890)
  - Email recipients updated with your real email
- [ ] **Repository** connected to Codemagic
- [ ] **Build trigger** configured (manual or on push)

### ✅ App Store Connect
- [ ] App created in App Store Connect
- [ ] App Store ID obtained and added to `codemagic.yaml`
- [ ] Bundle identifier set to: `com.sondare.app`
- [ ] Privacy Policy URL prepared
- [ ] Terms of Service URL prepared
- [ ] Support URL prepared

### ✅ Code & Assets
- [ ] App icons generated (see `public/ICON_REQUIREMENTS.md`)
- [ ] Environment variables in `.env`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase database migrations applied
- [ ] Edge function deployed (`generate-app`)
- [ ] App tested locally: `npm run dev`
- [ ] Production build successful: `npm run build`

---

## 🚀 How to Start Your First Build

### Option 1: Automatic Build (Recommended)
1. Commit your updated `codemagic.yaml` to repository
2. Push to your main branch
3. Codemagic detects the push and starts building automatically
4. Monitor progress in Codemagic dashboard

### Option 2: Manual Build
1. Go to Codemagic dashboard
2. Select your Sondare project
3. Click **"Start new build"**
4. Select **"ios-workflow"**
5. Click **"Start build"**

---

## 🔄 What Happens During the Build

The build process follows these steps:

1. ✅ Install npm dependencies
2. ✅ Build web app (`npm run build`)
3. ✅ Install Capacitor packages
4. ✅ Add iOS platform
5. ✅ **Configure iOS 14.0 deployment target** (fixes CocoaPods error)
6. ✅ Install CocoaPods dependencies
7. ✅ Copy web assets to native iOS app
8. ✅ Set up code signing with your certificates
9. ✅ **Auto-increment build number** (prevents duplicate errors)
10. ✅ Build IPA file
11. ✅ Upload to App Store Connect
12. ✅ Submit to TestFlight

---

## 🎯 Build Number System (Auto-Increment)

The configuration now includes **intelligent build number management**:

### How It Works

**Scenario 1: APP_STORE_APPLE_ID Configured Correctly**
- Fetches latest build number from App Store Connect
- Auto-increments by 1
- Example: If latest is `5`, new build becomes `6`

**Scenario 2: APP_STORE_APPLE_ID Missing or Placeholder**
- Uses timestamp-based build number
- Format: `YYYYMMDDHHMM` (e.g., `202510211430`)
- Ensures every build is unique

### Why This Matters
- **No more duplicate build errors**
- **No manual build number management**
- **Works for first build and all future builds**

---

## 🐛 Common Issues & Solutions

### ❌ Error: "The bundle version must be higher than previously uploaded version"

**Cause**: Build number already exists in App Store Connect

**Solution**:
1. Verify `APP_STORE_APPLE_ID` in `codemagic.yaml` is your **REAL** App Store ID
2. The auto-increment script will handle it automatically
3. If it's your first build, timestamp fallback creates unique number

### ❌ Error: "Could not find compatible versions for pod Capacitor"

**Cause**: iOS deployment target too low for Capacitor

**Solution**: ✅ Already fixed! The updated `codemagic.yaml` sets iOS 14.0 correctly

### ❌ Error: "Code signing failed"

**Cause**: Certificates not configured in Codemagic

**Solution**:
1. Go to Codemagic → Your App → Settings → Code Signing
2. Upload iOS Distribution certificate
3. Upload Provisioning profile for `com.sondare.app`
4. Ensure distribution type is "App Store"

### ❌ Error: "While scanning a simple key... could not find expected ':'"

**Cause**: YAML syntax error in `codemagic.yaml`

**Solution**: ✅ Already fixed! The heredoc issue has been resolved

---

## ✅ After First Successful Build

### 1. Verify Upload to App Store Connect
1. Go to App Store Connect: https://appstoreconnect.apple.com
2. Navigate to: **My Apps** → **Sondare** → **TestFlight**
3. You should see status: **"Processing"** (takes 5-15 minutes)
4. Once processed: Status changes to **"Ready to Test"**
5. Build appears in TestFlight section

### 2. Add Internal Testers (Optional)
1. In TestFlight, click **"Internal Testing"**
2. Add internal testers (your team members)
3. Testers receive email invitation
4. They can install via TestFlight app on their devices

### 3. Test the Build
- Download from TestFlight on real device
- Test complete user flow:
  - Signup/login
  - AI generation
  - Project management
  - All navigation tabs

---

## 🔁 Subsequent Builds

For every new build after the first:

1. **Make code changes** in your repository
2. **Commit and push** to main branch
3. **Codemagic builds automatically** (if configured for auto-trigger)
4. **Build number auto-increments** (no action needed)
5. **New build uploads to App Store Connect**
6. **TestFlight users notified** (if enabled)

**✨ Zero manual intervention required!**

---

## 📱 Submitting to App Store Review

Once you've tested in TestFlight and are ready for public release:

### 1. Complete App Store Connect Information
Use the guide in `APP_STORE_SUBMISSION_GUIDE.md` to fill out:
- [ ] App name, subtitle, description
- [ ] Keywords for search optimization
- [ ] Screenshots (5-10 images at required sizes)
- [ ] App preview video (optional but recommended)
- [ ] Privacy Policy URL (must be live and accessible)
- [ ] Terms of Service URL (must be live and accessible)
- [ ] Support URL (must be live and accessible)
- [ ] Age rating questionnaire
- [ ] Pricing (Free with in-app purchases)
- [ ] In-app purchase configuration

### 2. Select Your Build
1. Go to **App Store** tab (not TestFlight)
2. Click **"Prepare for Submission"**
3. Scroll to **"Build"** section
4. Click **"+"** and select your tested build from TestFlight

### 3. Submit for Review
1. Review all information one last time
2. Click **"Submit for Review"**
3. Answer export compliance questions:
   - **"Does your app use encryption?"** → Yes (HTTPS)
   - **"Is it exempt?"** → Yes (standard encryption only)
4. Click **"Submit"**

### 4. Monitor Review Status
- Check App Store Connect daily
- Typical review time: **24-48 hours** (can take up to 7 days)
- Respond quickly to any questions from Apple

### 5. After Approval
- App automatically goes live (or on your scheduled date)
- Update `codemagic.yaml` line 81 to `submit_to_app_store: true` for future auto-submission

---

## 🎨 Required Assets Checklist

Before submission, ensure you have:

### App Icons (Required)
- [ ] 1024x1024 for App Store listing
- [ ] All device-specific sizes (see `public/ICON_REQUIREMENTS.md`)

### Screenshots (Required - at least 5)
- [ ] iPhone 6.7" (1290 x 2796 pixels) - Required
- [ ] iPhone 6.5" (1242 x 2688 pixels) - Required
- [ ] iPad Pro 12.9" (2048 x 2732 pixels) - Recommended

### URLs (Required)
- [ ] Privacy Policy hosted at public URL
- [ ] Terms of Service hosted at public URL
- [ ] Support page hosted at public URL

### Legal Documents
- [ ] Privacy Policy written (see PRIVACY_POLICY.md template)
- [ ] Terms of Service written (see TERMS_OF_SERVICE.md template)
- [ ] Support email set up (currently placeholder: support@sondare.com)

---

## 🎯 Quick Command Reference

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Check TypeScript errors
```

### Capacitor Commands
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios              # Add iOS platform (one-time)
npx cap sync ios             # Sync web build to iOS
npx cap open ios             # Open in Xcode (for local testing)
```

### Testing Production Build Locally
```bash
npm run build && npx cap sync ios && npx cap open ios
```
Then build from Xcode to test on simulator or device before Codemagic build.

---

## 📊 Post-Launch Monitoring

### Metrics to Track
- Daily/monthly active users
- Signup conversion rate
- AI generation usage
- Credit consumption patterns
- Subscription conversion (free → Pro/Teams)
- App Store ratings and reviews
- Crash rate and stability

### Tools
- **App Store Connect Analytics** (built-in)
- **Supabase Dashboard** (database metrics)
- **Codemagic** (build success rate)
- Optional: Firebase Analytics, Mixpanel

---

## 🆘 Support Resources

### Documentation
- **Capacitor**: https://capacitorjs.com/docs
- **Codemagic**: https://docs.codemagic.io
- **Supabase**: https://supabase.com/docs
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/

### Sondare Project Files
- **App Store Guide**: `APP_STORE_SUBMISSION_GUIDE.md`
- **Privacy Policy**: `PRIVACY_POLICY.md`
- **Terms of Service**: `TERMS_OF_SERVICE.md`
- **Support Info**: `SUPPORT.md`
- **Icon Requirements**: `public/ICON_REQUIREMENTS.md`

### Getting Help
- **Codemagic Support**: support@codemagic.io
- **Apple Developer**: https://developer.apple.com/contact/
- **Supabase Discord**: https://discord.supabase.com

---

## ✅ Final Pre-Build Verification

**Complete this checklist before starting your first build:**

- [ ] Created app in App Store Connect
- [ ] Got App Store ID from App Information page
- [ ] Updated `APP_STORE_APPLE_ID` in `codemagic.yaml` (line 16)
- [ ] Updated email addresses in `codemagic.yaml` (lines 79, 112)
- [ ] Configured "Sondare" integration in Codemagic
- [ ] Uploaded signing certificates to Codemagic
- [ ] Connected repository to Codemagic
- [ ] Verified `.env` has Supabase credentials
- [ ] All code committed and pushed to repository
- [ ] Database migrations applied
- [ ] Edge function deployed and working

**✅ If all boxes checked, you're ready to build!**

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Codemagic build completes without errors
2. ✅ IPA file uploads to App Store Connect successfully
3. ✅ Build appears in TestFlight as "Processing"
4. ✅ Build becomes "Ready to Test" after processing
5. ✅ You can install and run app from TestFlight
6. ✅ All features work in TestFlight version
7. ✅ Build number auto-incremented correctly

---

## 📅 Typical Timeline

- **Day 1**: Complete this checklist, trigger first build
- **Day 1**: Build succeeds, appears in TestFlight
- **Days 2-7**: Internal testing via TestFlight
- **Day 8**: Submit to App Store review
- **Days 9-11**: Apple reviews (24-48 hours typical)
- **Day 12**: App goes live on App Store! 🎉

---

**Last Updated**: October 2024

**Remember**: The hard part is the setup. Once the first build succeeds, all future builds are automatic! 🚀

---

## 💡 Pro Tips

1. **Test Early**: Use TestFlight extensively before submitting to App Store
2. **Monitor Logs**: Always check Codemagic logs if build fails
3. **Keep Certificates Safe**: Back up your signing certificates
4. **Update Regularly**: Plan app updates every 2-4 weeks
5. **Respond to Reviews**: Engage with users in App Store reviews
6. **Track Metrics**: Use analytics to understand user behavior
7. **Have Patience**: First build setup takes time, but it's worth it!

**Good luck with your launch! 🚀**
