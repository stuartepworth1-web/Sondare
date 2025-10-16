# Sondare Deployment Checklist

Follow this checklist to deploy Sondare to the App Store using Codemagic.

## Pre-Deployment (Complete These First)

### 1. Verify Database Setup
- [ ] Supabase database is running
- [ ] All tables created (profiles, projects, generations, deployments)
- [ ] Row Level Security (RLS) policies are active
- [ ] Test user signup and login works
- [ ] Test project creation works

### 2. Configure Environment Variables
- [ ] `.env` file exists with correct values
- [ ] `VITE_SUPABASE_URL` is set
- [ ] `VITE_SUPABASE_ANON_KEY` is set
- [ ] Environment variables are added to Codemagic dashboard

### 3. Test Edge Function
- [ ] Edge function `generate-app` is deployed
- [ ] Test AI generation from Builder tab
- [ ] Verify credit deduction works
- [ ] Check project is created in database

### 4. App Content Updates
- [ ] Update app name in `capacitor.config.ts` if needed
- [ ] Update app ID in `capacitor.config.ts` (`com.sondare.app` or your preferred)
- [ ] Add app icon at `public/icon.png` (1024x1024px)
- [ ] Add splash screen images

### 5. Legal Requirements
- [ ] Create Privacy Policy
- [ ] Create Terms of Service
- [ ] Add support email (currently placeholder)
- [ ] Update README with real support contact

## Capacitor Setup

### 6. Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 7. Initialize Platforms
```bash
# Build web app first
npm run build

# Add iOS
npx cap add ios

# Add Android
npx cap add android

# Sync built files
npx cap sync
```

### 8. Test Locally (Optional but Recommended)
```bash
# Open in Xcode
npx cap open ios

# Open in Android Studio
npx cap open android
```

## Codemagic Configuration

### 9. Connect Repository
- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Connect repository to Codemagic
- [ ] Grant Codemagic access to repo

### 10. Configure Build Settings
- [ ] Select repository and branch
- [ ] Set build trigger (manual or automatic)
- [ ] Configure build commands:
  ```yaml
  scripts:
    - npm install
    - npm run build
    - npx cap sync
  ```

### 11. Add Environment Variables in Codemagic
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

### 12. iOS Setup (App Store)
- [ ] Add Apple Developer account to Codemagic
- [ ] Upload provisioning profiles
- [ ] Upload distribution certificate
- [ ] Configure bundle ID (must match `capacitor.config.ts`)
- [ ] Set version number and build number

### 13. Android Setup (Google Play)
- [ ] Add Google Play service account to Codemagic
- [ ] Upload keystore file
- [ ] Configure signing settings
- [ ] Set package name (must match `capacitor.config.ts`)
- [ ] Set version code and version name

### 14. App Store Connect Setup (iOS)
- [ ] Create app in App Store Connect
- [ ] Add app description and keywords
- [ ] Upload app icon (1024x1024px)
- [ ] Add screenshots (all required sizes)
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Set app category
- [ ] Set age rating
- [ ] Configure in-app purchases (for subscriptions)

### 15. Google Play Console Setup (Android)
- [ ] Create app in Google Play Console
- [ ] Add app description
- [ ] Upload screenshots (phone, tablet, etc.)
- [ ] Add privacy policy URL
- [ ] Set content rating
- [ ] Configure in-app billing (for subscriptions)

## Subscription Setup (Phase 2)

### 16. Revenue Management
- [ ] Set up RevenueCat account
- [ ] Configure products in App Store Connect
- [ ] Configure products in Google Play Console
- [ ] Link RevenueCat to both stores
- [ ] Add RevenueCat SDK to app
- [ ] Test purchases in sandbox mode

## Pre-Launch Testing

### 17. TestFlight Beta (iOS)
- [ ] Build and upload to TestFlight
- [ ] Add internal testers
- [ ] Test complete user flow
- [ ] Fix any critical bugs
- [ ] Add external testers (optional)
- [ ] Collect feedback

### 18. Internal Testing (Android)
- [ ] Upload to Google Play internal testing
- [ ] Add test users
- [ ] Test complete user flow
- [ ] Fix any critical bugs
- [ ] Move to closed beta (optional)

### 19. Final Checks
- [ ] Test onboarding flow
- [ ] Test signup and login
- [ ] Test AI generation (uses credit)
- [ ] Test project creation and viewing
- [ ] Test all navigation tabs
- [ ] Test logout and re-login
- [ ] Verify credits are tracked correctly
- [ ] Test on multiple device sizes
- [ ] Test on slow network connection
- [ ] Check all error messages display correctly

## Launch

### 20. Submit to App Store (iOS)
- [ ] Submit app for review from App Store Connect
- [ ] Monitor review status
- [ ] Respond to any rejection feedback
- [ ] Once approved, release to public

### 21. Submit to Google Play (Android)
- [ ] Promote from testing to production
- [ ] Submit for review
- [ ] Monitor review status
- [ ] Once approved, release to public

## Post-Launch

### 22. Monitoring
- [ ] Set up analytics (Firebase, Mixpanel, etc.)
- [ ] Monitor Supabase database usage
- [ ] Monitor Edge Function performance
- [ ] Track user signups and active users
- [ ] Monitor crash reports

### 23. Marketing
- [ ] Announce launch on social media
- [ ] Create landing page
- [ ] Submit to app review sites
- [ ] Collect user feedback
- [ ] Plan feature updates

## Common Issues & Solutions

### Build Fails in Codemagic
- Check environment variables are set correctly
- Verify Node version compatibility
- Check for TypeScript errors
- Review build logs for specific errors

### App Rejected by App Store
- Common reasons:
  - Missing privacy policy
  - Incomplete metadata
  - Crashes on launch
  - Design doesn't follow guidelines
- Fix issues and resubmit

### Supabase Connection Issues
- Verify API keys are correct
- Check RLS policies allow operations
- Verify Edge Function is deployed
- Check network connectivity

## Timeline Estimate

- **Week 1-2**: Core development (DONE)
- **Week 3**: Testing and Capacitor setup
- **Week 4**: App Store submission and approval
- **Week 5+**: Launch and marketing

## Support Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Codemagic Docs: https://docs.codemagic.io
- Supabase Docs: https://supabase.com/docs
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Guidelines: https://play.google.com/about/developer-content-policy/

## Notes

- Apple App Store review typically takes 2-7 days
- Google Play review typically takes 1-3 days
- Keep backup of signing certificates and keys
- Test subscription flow thoroughly before launch
- Monitor credit usage to prevent abuse
- Consider rate limiting on Edge Functions

Good luck with your launch!
