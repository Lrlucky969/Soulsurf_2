# 🏄 SoulSurf – Your Personal Surf Decision Engine

> Not just surf lessons – SoulSurf tells you **what to do today**: surf, book a coach, or learn indoors.

## ✨ Core Features

- 🧠 **Decision Engine** – Personalized daily recommendation based on conditions, skill level, and spot
- 🌊 **Live Surf Forecast** – 3-day hourly conditions with surf scores
- 📍 **Spot Suitability** – Color-coded ratings (🟢🟡🔴) for every spot based on your level
- 🏫 **Surf School Booking** – Contextual school recommendations with Stripe payments
- 📚 **50+ Surf Lessons** – From pop-up to barrel riding, phase-tagged to weather
- 🗺️ **Trip Planner** – Spots, weather, packing lists
- 📓 **Surf Diary** – Session logging with photo upload
- 🎮 **Gamification** – XP, levels, badges, streaks, skill tree
- 🌍 **3 Languages** – German, English, Portuguese
- 📱 **PWA** – Installable, offline-capable

## 🎯 Current Focus: Vertical Slice (v6.6.2)

Building one **perfect end-to-end journey**: Beginner surfer in Portugal.

**User Story:** Lisa (28, Beginner, 2 weeks in Portugal) opens the app and in <30 seconds knows what to do today and can book a lesson if needed.

**Key Flow:** Open App → Decision Engine → "Book a Coach" → Filtered Schools → Book

## 📁 Architecture

```
src/
├── App.jsx                 # App shell, navigation, themes, auth
├── analytics.js            # Event tracking (decision→booking funnel)
├── decisionEngine.js       # 11 rules: conditions × skill → recommendation
├── spotSuitability.js      # Score-based spot rating (0-100 → 🟢🟡🔴)
├── useForecast.js          # Unified forecast hook (weather + swell + hourly)
├── useSurfData.js          # State manager (localStorage + gamification)
├── useAuth.js              # Supabase authentication
├── useSync.js              # Cloud sync to Supabase
├── i18n.js                 # 393 translation keys (DE/EN/PT)
├── data.js                 # Content: 50+ lessons, 15+ spots, 8 schools
├── components.jsx          # Shared UI components
└── screens/
    ├── HomeScreen.jsx      # Decision Engine hero + 4-step onboarding
    ├── BuilderScreen.jsx   # Program generator (2 steps: board + days)
    ├── SurfScreen.jsx      # Spots & Schools + 3-day forecast
    ├── SchoolsScreen.jsx   # Contextual school booking (Stripe)
    ├── LessonsScreen.jsx   # Lesson browser with phase filters
    ├── DiaryScreen.jsx     # Surf diary with AI coaching
    ├── TripScreen.jsx      # Trip planner
    ├── ProgressScreen.jsx  # XP, badges, skill tree
    ├── ProfileScreen.jsx   # User profile hub
    └── ...
api/
├── checkout.js             # Stripe Checkout (15% commission)
└── webhook.js              # Stripe webhook → Supabase
```

## 🔄 Data Flow

```
User opens app
  → HomeScreen loads Decision Engine
  → useForecast(spot) fetches conditions from Open-Meteo API
  → decisionEngine evaluates 11 rules → recommendation
  → User sees: 🟢 "Go Surf!" / 🟡 "Book Coach" / 🔴 "Learn Indoors"
  → CTA click → navigate("schools", { fromDecision, spot, reason })
  → SchoolsScreen shows contextual banner + filtered schools
  → Book → Stripe Checkout → webhook → Supabase
```

## 🎨 Theme System

- Light & Dark mode (auto-detects system preference)
- Theme object `t` passed to all screens: `t.text`, `t.card`, `t.accent`, etc.
- Fonts: Playfair Display (headings), Space Mono (data), DM Sans (body)

## 🌐 Internationalization

- `i18n.js` with 393 keys across DE/EN/PT
- `i18n.t("key")` or `_("key", "fallback")` pattern
- Language switcher in Profile screen

## 📊 Analytics (V1)

- localStorage-based event tracking
- Events: `decision_shown`, `decision_cta_clicked`, `booking_started`
- Session tracking with 30-min timeout
- `getFunnelStats()` for conversion analysis

## 📦 Tech Stack

- **React 18** – UI (single-file components with inline styles)
- **Vite** – Build tool + dev server
- **Supabase** – Auth, database, cloud sync, photo storage
- **Stripe** – Payment processing for school bookings
- **Open-Meteo API** – Weather + marine forecast data
- **Vite PWA Plugin** – Service worker, offline support

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/soulsurf.git
cd soulsurf
npm install
cp .env.example .env  # Add Supabase + Stripe keys
npm run dev
```

## 📋 Version History

| Version | Sprint | Highlight |
|---------|--------|-----------|
| v6.6.2 | V1 | UX Fixes: no-scroll onboarding, clear Decision, 3-day forecast, simplified builder |
| v6.6.1 | V1 | Decision → Booking flow, analytics, contextual schools |
| v6.5.1 | 34 | Unified Surf Screen, spot suitability engine |
| v6.4.1 | 33 | Decision Engine MVP, null-safe checks |
| v6.3.4 | 32 | 5-tab nav, 4-step onboarding, profile screen |
| v6.0 | 29 | Stripe integration |
| v5.9 | 28 | i18n (DE/EN/PT) |

**Current: v6.6.2 · 14 Screens · 393 i18n Keys · ~9,500 Lines**
