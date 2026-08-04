# Istiqamah

A habit and Salah tracker mobile app built with React Native + Expo.

## Tech Stack

- React Native + Expo (TypeScript, strict mode)
- @react-navigation (bottom tabs + native stack)
- expo-sqlite (local storage)
- expo-notifications (local reminders)
- react-native-calendars (heat-map)
- zustand (app state)
- dayjs (date handling)

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your Android device (or Android emulator)

## Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Then scan the QR code with Expo Go on your Android device, or press `a` to launch on an Android emulator.

## Building for Play Store

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS (creates a new Expo project and links it)
eas build:configure

# 4. Build production AAB
eas build --platform android --profile production
```

After the build completes, download the `.aab` from Expo's website and upload it to the Google Play Console.

## Play Store Checklist

1. **Replace placeholders in `app.json`:**
   - `com.yourname.istiqamah` → your actual package name (e.g. `com.yourcompany.istiqamah`)

2. **Prepare store assets:**
   - App icon (512×512 px)
   - Feature graphic (1024×500 px)
   - Screenshots (phone + tablet, min 2)
   - Short description (80 chars)
   - Full description (4000 chars)

3. **Keystore:**
   - EAS handles this automatically on first production build
   - Download and backup the keystore from Expo's website

4. **Upload the AAB:**
   - Play Console → Release → Production → Create new release
   - Upload the `.aab` file from EAS Build

5. **Complete store listing:**
   - Content rating questionnaire
   - Target audience & content
   - Privacy policy URL (required)
   - App access / permissions justification (NOTIFICATIONS)

6. **Testing:**
   - Internal testing track → invite testers
   - Closed testing → wider QA
   - Production → after approval

## Project Structure

```
src/
  screens/        # Today, Progress, Settings, AddHabit, Share, Onboarding
  components/     # Reusable UI components
  db/             # SQLite database + repositories
  store/          # Zustand state
  utils/          # Helpers (date, share, streak, notifications, theme)
  types/          # TypeScript interfaces
  constants/      # Default Salah data
```

## License

MIT
