# Sondare - AI App Builder

Ideas to apps in minutes. Create mobile apps using AI-powered chat interface.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Features

- Chat-based AI app generation
- Project management system
- Design library and templates
- Real-time preview
- Code export functionality
- Credit-based usage system
- Multi-tier subscription support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth (email/password)
- **Backend**: Supabase Edge Functions
- **Mobile**: Capacitor (for native iOS/Android builds)

## Environment Variables

Required in `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building for Mobile (Capacitor)

### Prerequisites

Install Capacitor CLI:
```bash
npm install -g @capacitor/cli
```

### Add Platforms

```bash
# Add iOS
npx cap add ios

# Add Android
npx cap add android
```

### Build and Sync

```bash
# Build web app
npm run build

# Sync to native platforms
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

## Codemagic Integration

This project is configured for Codemagic CI/CD. The `capacitor.config.ts` file includes:

- App ID: `com.sondare.app`
- App Name: Sondare
- Web directory: `dist`
- Android scheme: HTTPS

### Codemagic Workflow Setup

1. Connect your repository to Codemagic
2. Configure build settings:
   - Build command: `npm run build`
   - Distribution: App Store / Google Play
3. Add environment variables in Codemagic dashboard
4. Configure signing certificates

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth.tsx        # Authentication screens
│   ├── Onboarding.tsx  # Welcome carousel
│   ├── InteractiveTutorial.tsx
│   ├── TabNavigation.tsx
│   └── HowToGuide.tsx
├── screens/            # Main app screens
│   ├── Home.tsx        # Dashboard
│   ├── Builder.tsx     # AI chat interface
│   ├── Design.tsx      # Component library
│   └── Projects.tsx    # Project management
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── lib/               # Utilities
│   └── supabase.ts    # Supabase client
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Database Schema

### Tables

- **profiles**: User profiles with subscription and credit info
- **projects**: User's app projects
- **generations**: AI generation history with code and schema
- **deployments**: Deployment tracking (Phase 2)

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

## Subscription Tiers

- **Free**: 3 credits/month
- **Pro**: 50 credits/month - $19.99/month
- **Teams**: 200 credits/month - $49.99/month

Credits roll over indefinitely.

## Edge Functions

### generate-app

Handles AI-powered app generation.

**Endpoint**: `/functions/v1/generate-app`

**Request**:
```json
{
  "prompt": "Create a fitness tracking app"
}
```

**Response**:
```json
{
  "success": true,
  "message": "I've created your fitness app!",
  "project": {
    "id": "uuid",
    "name": "Fitness Tracking App",
    "appType": "fitness"
  }
}
```

## Design System

### Colors

- **Primary**: Orange (#FF9500)
- **Background**: Black to Grey gradient
- **Surface**: Dark grey with glassmorphism
- **Text**: White with various opacity levels

### Components

- Glass cards with backdrop blur
- Gradient buttons with orange accents
- Smooth transitions and animations
- Mobile-optimized touch targets

## Development Notes

### Mobile vs Laptop Features (70/30 Split)

**Mobile (70%)**:
- Chat with AI builder
- Preview generated apps
- Manage projects
- Browse design library

**Laptop (30%)**:
- Advanced code editing
- Complex debugging
- Deployment management
- Multi-file operations

## Legal Documents

Before submitting to the App Store, review these required documents:

- **[Privacy Policy](./PRIVACY_POLICY.md)** - Required for App Store submission
- **[Terms of Service](./TERMS_OF_SERVICE.md)** - Required for App Store submission
- **[Support Information](./SUPPORT.md)** - Contact details and help resources
- **[App Icon Requirements](./public/ICON_REQUIREMENTS.md)** - Icon specifications and guidelines

**Action Required Before Launch:**
1. Update email addresses in all legal documents (currently using placeholder @sondare.com emails)
2. Host Privacy Policy and Terms of Service on a public URL
3. Create and add app icons (see ICON_REQUIREMENTS.md)
4. Add actual support email in App Store Connect

## License

Private and confidential.

## Support

For support, questions, or feedback:

**Email**: support@sondare.com

See [SUPPORT.md](./SUPPORT.md) for more contact options and resources.

**Note**: Replace placeholder emails with your actual support email before launch.
