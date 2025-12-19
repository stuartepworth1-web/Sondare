# App Icon Requirements for Sondare

## iOS App Icon Requirements

Apple requires app icons in multiple sizes. Here's what you need:

### Required Sizes

| Size | Usage | Filename |
|------|-------|----------|
| 1024x1024 | App Store | AppIcon-1024.png |
| 180x180 | iPhone @3x | AppIcon-180.png |
| 167x167 | iPad Pro @2x | AppIcon-167.png |
| 152x152 | iPad @2x | AppIcon-152.png |
| 120x120 | iPhone @2x | AppIcon-120.png |
| 87x87 | iPhone @3x (Settings) | AppIcon-87.png |
| 80x80 | iPad @2x (Spotlight) | AppIcon-80.png |
| 76x76 | iPad | AppIcon-76.png |
| 60x60 | iPhone (Spotlight) | AppIcon-60.png |
| 58x58 | iPhone @2x (Settings) | AppIcon-58.png |
| 40x40 | iPad (Spotlight) | AppIcon-40.png |
| 29x29 | iPhone/iPad (Settings) | AppIcon-29.png |
| 20x20 | iPad (Notifications) | AppIcon-20.png |

### Design Guidelines

**DO:**
- Use PNG format with no transparency
- Fill the entire icon space (no padding)
- Use a simple, recognizable design
- Test on both light and dark backgrounds
- Make it visually distinct and memorable

**DON'T:**
- Use rounded corners (iOS applies them automatically)
- Include text (it won't be readable at small sizes)
- Use transparency or alpha channels
- Copy other apps' icons
- Use complex gradients that don't scale well

### Design Tips for Sondare

Consider these themes for your icon:
- **Mobile device + brush/pencil** (app design concept)
- **Grid/wireframe shape** (design tool concept)
- **Abstract geometric shape** (modern, clean)
- **Lightning bolt + phone** (fast, AI-powered)

### Color Recommendations

For a professional look:
- Use 2-3 colors maximum
- Ensure good contrast
- Test on both light and dark home screens
- Consider a gradient for depth (subtle only)

## How to Generate Icons

### Option 1: Design Tool
1. Create a 1024x1024px icon in:
   - Figma
   - Adobe Illustrator
   - Sketch
   - Canva
2. Export as PNG
3. Use an icon generator to create all sizes:
   - https://appicon.co
   - https://www.appicon.build
   - https://makeappicon.com

### Option 2: AI Generation
1. Use DALL-E, Midjourney, or Stable Diffusion
2. Prompt example: "minimalist app icon for mobile design tool, flat design, geometric, professional, blue and white color scheme, no text, simple shapes, clean modern style"
3. Generate at 1024x1024px
4. Use icon generator for other sizes

### Option 3: Hire Designer
- Fiverr: $20-$100
- 99designs: $299+ (contest)
- Dribbble: Find freelancers

## Android Icon Requirements

Android also needs multiple sizes:
- 512x512 (Google Play Store)
- Various densities: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

Most icon generators create Android assets automatically.

## Where to Place Icons

After generating all sizes:

### iOS (Xcode)
1. Open project in Xcode: `npx cap open ios`
2. Click on `App` in the project navigator
3. Click on `Assets.xcassets`
4. Find `AppIcon`
5. Drag and drop each size into the corresponding slot

### Android (Android Studio)
1. Open project: `npx cap open android`
2. Navigate to `res/mipmap-*` folders
3. Replace default icons with your generated ones

## Capacitor Configuration

Update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.sondare.app',
  appName: 'Sondare',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};
```

## Testing Your Icon

1. Build and run in simulator/emulator
2. Check home screen appearance
3. Test on device if possible
4. Verify in App Store Connect (TestFlight)
5. Get feedback from beta testers

## Resources

- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Material Design - Product Icons](https://material.io/design/iconography/product-icons.html)
- [Icon Generator Tool](https://appicon.co/)

---

**Next Steps:**
1. Design or generate your 1024x1024 icon
2. Use an icon generator for all required sizes
3. Add icons to Xcode and Android Studio
4. Test in simulator
5. Submit to App Store

**Current Status:** Placeholder - You need to create and add your actual app icon before submission.
