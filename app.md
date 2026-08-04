# Istiqamah — Habit & Salah Tracker

> *Istiqamah (استقامة)* means steadfastness — staying consistent on a good path.
> This is a suggested name only. Rename it to whatever you like before you set up
> the Play Store listing (just make sure the name isn't already taken).

## 1. What this app is

A mobile app (Android, built to also run on iOS with no extra work) that helps a
person track their daily habits and routines — with prayer tracking built in
by default: Tahajjud (optional night prayer) plus the 5 daily prayers
(Fajr, Dhuhr, Asr, Maghrib, Isha), including whether each was prayed alone or
with congregation (Jamaat). The app also tracks what time the person woke up
and went to sleep. At the end of the day, the user can generate a clean,
chronological (night-to-night: wake-up → Tahajjud → Fajr → ... → Isha →
sleep) summary of everything they did and share it straight to WhatsApp. A
monthly view shows how disciplined they've been over time.

## 2. Target user

Someone who wants a simple, private, offline habit tracker with a
prayer-tracking core — not a generic to-do app. No ads, no social feed, no
account required. Everything stays on the phone.

## 3. Core Features

### 3.1 Default Salah (Prayer) Tracker — always present, cannot be deleted
- 6 entries seeded automatically every day, in night-to-night order:
  **Tahajjud** (optional night prayer, prayed before Fajr), then the 5
  obligatory prayers — **Fajr, Dhuhr, Asr, Maghrib, Isha**.
- For each prayer, the user taps to set a status:
  - ✅ Prayed — with Jamaat (congregation)
  - 🟡 Prayed — Alone
  - 🔁 Qada (prayed late / made up)
  - ❌ Not prayed
  (Tahajjud reuses these same 4 states for simplicity, even though
  Jamaat/Qada rarely apply to it in practice since it's a voluntary
  night prayer.)
- All 6 can be renamed/reminded but never deleted — they are the permanent
  backbone of the day's timeline.
- Tahajjud is tracked and shown everywhere, but excluded from the
  Discipline Score by default since it's voluntary (nawafil) rather than
  obligatory — easy to change if you'd rather count it.
- Optional reminder notification at each prayer's time.

### 3.2 Wake-up & Sleep Time
- Two simple time entries per day: **what time the user woke up** and
  **what time they went to sleep**. Logged with a quick time picker,
  editable any time during the day.
- These act as the bookends of the whole timeline — wake-up time is the
  first line of the day, sleep time is the last, both on the Today screen
  and in the WhatsApp summary.

### 3.3 Custom Habits / Routine Tracker
- User can add unlimited custom habits, e.g. "Drink water", "Read Qur'an",
  "Exercise", "Study 2 hours", "No phone after 10pm".
- Each habit has: name, emoji/icon, optional scheduled time, frequency
  (**daily / weekly / monthly / specific days**), an optional target
  (e.g. "3x a day", "30 minutes"), and an optional reminder.
- Mark complete/incomplete per day with one tap.

### 3.4 Day Timeline (the heart of the app)
- A single "Today" screen lists **everything in time order, from wake-up
  to sleep** — wake-up time first, then Tahajjud, then Fajr, then the rest
  of the day's prayers and habits, then sleep time last. Habits without a
  set time are grouped under "Anytime today" near the end.
- This same ordering is what gets used for the WhatsApp summary.

### 3.5 WhatsApp Daily Summary
- A "Share My Day" button (available anytime, and prompted automatically
  near the end of the day) builds a formatted text summary and opens the
  phone's share sheet — the user picks WhatsApp (or any app) and any
  contact/group, exactly like sharing a photo.
- Exact format below (see Section 6), including the full date (day, date,
  year), the time the report was generated, and wake-up/sleep time. The
  user can preview and edit the text before sending.

### 3.6 Monthly Progress / Discipline View
- Calendar heat-map: each day shaded by how much of that day's routine was
  completed (darker = more complete).
- Per-habit stats: this month's completion %, current streak, best streak ever.
- Salah-specific stats: total prayed out of the month's total possible,
  % prayed with Jamaat, and a breakdown per prayer (useful — Fajr Jamaat rate
  is usually the one people most want to see improve).
- Toggle between **Weekly / Monthly / Yearly** views.

### 3.7 Reminders
- Local notifications for each prayer and for any custom habit with a
  scheduled time and reminders turned on. Fully offline — no server needed.

## 4. Screens

1. **Onboarding** (first launch only) — quick intro, ask if they want prayer
   reminders on by default.
2. **Today (Home)** — the day timeline described above, bookended by
   wake-up and sleep time entries.
3. **Add / Edit Habit**
4. **Progress** — monthly/weekly analytics and calendar heat-map.
5. **Share Preview** — the generated WhatsApp text, editable, with a
   "Share" button.
6. **Settings** — reminder toggles, theme (light/dark), prayer time editing,
   about/privacy.

## 5. Data Model (conceptual)

**Habit**
`id, name, icon, type ("salah" | "custom"), frequency, scheduledTime,
target, reminderEnabled, archived, createdAt`

**SalahEntry** (one per prayer per day, 6 per day)
`id, date, prayerName ("tahajjud" | "fajr" | "dhuhr" | "asr" | "maghrib" |
"isha"), status ("jamaat" | "alone" | "qada" | "missed"), loggedAt`

**HabitLog** (one per custom habit per day it's tracked)
`id, habitId, date, completed, completedAt, note`

**DayLog** (one per day)
`id, date, wakeUpTime, sleepTime`

All data lives in a local SQLite database on the device. Nothing is sent
anywhere — this is a private, offline-first app.

## 6. WhatsApp Share Template (exact wording to implement)

```
🌙 *My Day – {Weekday}, {Date} {Month} {Year}*
🕐 Report generated at {Time}

🌅 Woke up: {wakeUpTime}

🕌 *Salah Tracker*
🌌 Tahajjud — {status}
🌅 Fajr — {status}
☀️ Dhuhr — {status}
🌤️ Asr — {status}
🌇 Maghrib — {status}
🌃 Isha — {status}

📋 *Habits & Routine*
{time} {habit name} {✅ or ❌}
{time} {habit name} {✅ or ❌}
...
(habits with no set time listed last, under "Anytime")

😴 Slept: {sleepTime}

📊 Discipline Score: {completed}/{total} ({percent}%)
🔥 Current Streak: {n} days

_Shared via Istiqamah_
```
Status text mapping: Jamaat → "✅ Jamaat", Alone → "🟡 Alone",
Qada → "🔁 Qada", Missed → "❌ Missed". If wake-up/sleep time hasn't been
logged for the day, print "—" instead of leaving the line blank. The
Discipline Score's {completed}/{total} counts the 5 obligatory prayers +
all custom habits (Tahajjud excluded from the count by default, per
Section 3.1).

## 7. Tech Stack (recommended default)

- **React Native + Expo (TypeScript)** — one codebase, easiest path to a
  Play Store build via **EAS Build**, huge ecosystem, works well with AI
  coding agents.
- Navigation: `@react-navigation` (or `expo-router`)
- Local database: `expo-sqlite`
- Notifications: `expo-notifications`
- Sharing: React Native's built-in `Share` API (opens the OS share sheet,
  which includes WhatsApp)
- Charts / calendar heat-map: `react-native-chart-kit` + `react-native-calendars`
- State management: Zustand (or React Context if kept simple)
- Dates: `dayjs`

*(If you'd rather build in Flutter or native Kotlin instead, the feature
spec above still applies — just swap the tech-stack section before giving
this to Kilo Code.)*

## 8. Suggested Project Structure

```
istiqamah/
├── app.md
├── app.json
├── eas.json
├── App.tsx
├── src/
│   ├── screens/        (HomeScreen, AddHabitScreen, ProgressScreen,
│   │                     ShareScreen, SettingsScreen, OnboardingScreen)
│   ├── components/      (HabitCard, SalahCard, DayTimeline,
│   │                     ProgressCalendar, StreakBadge)
│   ├── db/              (database.ts, habitRepository.ts, salahRepository.ts,
│   │                     dayLogRepository.ts)
│   ├── store/           (zustand stores)
│   ├── utils/           (dateHelpers.ts, shareFormatter.ts, streakCalculator.ts)
│   ├── types/
│   └── constants/       (defaultSalah.ts)
└── assets/              (icon.png, splash.png, adaptive-icon.png)
```

## 9. Roadmap (later, not MVP)

- Auto-calculated prayer times from GPS location (offline library like `adhan`)
  instead of manually-set times — skipped for MVP to avoid a location
  permission and keep the app simple and private.
- Optional encrypted cloud backup / multi-device sync.
- Home-screen widget showing today's remaining prayers.
- iOS App Store release (same codebase, separate build/submission).

## 10. Play Store Publishing Checklist

- Google Play **Developer account** — one-time $25 fee (or Google's newer
  free "limited distribution" tier for hobby use, capped at 20 installed
  devices, no public listing).
- Unique **package name** (e.g. `com.yourname.istiqamah`) — cannot be
  changed after your first release.
- Assets: 512×512 app icon, 1024×500 feature graphic, at least 2 phone
  screenshots.
- Short description (80 chars) + full description (up to 4000 chars).
- **Privacy Policy URL** — required even for a fully offline app if it
  requests notification permission; a simple hosted page is enough.
- **Data Safety form** in Play Console — for a fully local/offline app you
  can honestly declare "no data collected."
- New personal developer accounts must complete **closed testing with at
  least 12 opted-in testers for 14 continuous days** before they can apply
  for production access (this was reduced from 20 testers in Dec 2024).
  Family/friends on real Android devices count.
- EAS Build produces the signed **.aab** file Play Console needs.
- This checklist can shift over time — double check current requirements
  in Play Console before you submit.

## 11. Using this with Kilo Code CLI

Keep this file (`app.md`) in the root of your project folder. Give Kilo
Code the companion prompt (`kilo-code-prompt.md`) as your first message —
it tells the agent to read this file for full context and build the app
phase by phase.
