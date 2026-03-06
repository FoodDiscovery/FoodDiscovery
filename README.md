# Food Discovery

A React Native / Expo app for discovering restaurants, browsing menus, placing orders, and managing pickup. Built with Supabase and Stripe.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node)
- **Expo Go** on your phone (for device testing), or **Xcode** (macOS) / **Android Studio** for simulators

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd FoodDiscovery
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (it's gitignored):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

- **Supabase:** From your [Supabase](https://supabase.com) project → Settings → API (URL and `anon` key).
- **Stripe:** From your [Stripe](https://stripe.com) dashboard → Developers → API keys (publishable key).

Without these, the app will fail at runtime.

### 3. Run the app

```bash
npm start
# or
npx expo start
```

Then:

- Press **i** for iOS simulator
- Press **a** for Android emulator
- Or scan the QR code with **Expo Go** on your device

### 4. Run tests

```bash
npm test
npm run coverage   # run tests with coverage report
```

### 5. Lint

```bash
npm run lint
npm run lint:fix   # auto-fix
```

## Tech stack

- **Expo 54** + **React Native**
- **Supabase** — auth, database, storage
- **Stripe** — payments
- **expo-router** — file-based routing (`src/app/`)

## Notes

- **Location:** The app uses location for maps and nearby restaurants; allow location when prompted.
- **Backend:** Supabase and Stripe must be configured (project, tables, Stripe account) for full functionality.
- **Native builds:** For `expo run:ios` or `expo run:android`, you need Xcode (macOS) or Android Studio installed.
