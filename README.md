# 🏄 SoulSurf – Your Personal Surf Coach
  
> Learn to surf with personalized programs, live forecasts, and a vibrant community.
  
![SoulSurf Banner](https://via.placeholder.com/1200x400/009688/FFFFFF?text=SoulSurf)
## ✨ Features
  
- 📚 **63 Surf Lessons** – From pop-up to barrel riding
- 🌊 **Live Surf Forecast** – Hourly conditions & best surf times
- 📓 **Smart Diary** – AI-powered coaching based on your entries
- 🗺️ **Trip Planner** – Spots, weather, packing lists
- 🏫 **Surf School Marketplace** – Book lessons with Stripe
- 🎮 **Gamification** – XP, levels, badges, skill tree
- 🌍 **Multi-language** – German, English, Portuguese
- 📱 **PWA** – Works offline, installable
- ☁️ **Cloud Sync** – Supabase backend
  
## 🚀 Quick Start
  
### Prerequisites
  
- Node.js 18+
- Supabase account (free tier works)
- Stripe account (for school bookings)
  
### Installation
  
```bash
# Clone the repo
git clone https://github.com/yourusername/soulsurf.git
cd soulsurf
  
# Install dependencies
npm install
  
# Copy environment variables
cp .env.example .env
  
# Edit .env with your keys
nano .env
  
# Run dev server
npm run dev

# 🏗️ SoulSurf – Projektarchitektur

## 📁 Dateistruktur & Funktionen

### Root-Level Konfiguration

- **`.env.example`** – Template für Umgebungsvariablen (Supabase, Stripe Keys)
- **`package.json`** – Dependencies und Build-Scripts (React, Supabase, Stripe)
- **`index.html`** – Entry-Point der SPA, lädt die React-App

### `/api` – Serverless Functions (Vercel)

- **`checkout.js`** – Stripe Checkout API für Surfschul-Buchungen
  - Erstellt Stripe Payment Sessions
  - Berechnet 15% Kommission
  - Validiert Buchungsdaten
  - Multi-Language Support (DE/EN/PT)

- **`webhook.js`** – Stripe Webhook Handler
  - Empfängt `checkout.session.completed` Events
  - Speichert bestätigte Buchungen in Supabase
  - Webhook-Signatur-Verifizierung

### `/src` – React Application

#### Core Files

- **`App.jsx`** – Haupt-Component & App Shell
  - Navigation & Screen-Management
  - Auth-Integration
  - Theme System (Light/Dark)
  - Menu & Header
  - Cloud Sync Integration
  - Notification System

- **`useSurfData.js`** – Haupt-State-Manager (Custom Hook)
  - LocalStorage Persistierung
  - Programm-Erstellung & -Verwaltung
  - Lektion Completion Tracking
  - Gamification (XP, Levels, Badges)
  - Streak System

- **`useAuth.js`** – Supabase Authentication Hook
  - Login/Logout/Signup
  - Session Management
  - User Profile

- **`useSync.js`** – Cloud Sync Logic
  - Upload/Download zu Supabase
  - Conflict Resolution
  - Auto-Sync bei Login

- **`usePhotoSync.js`** – Foto-Upload für Diary
  - Supabase Storage Integration
  - Image Compression

- **`useNotifications.js`** – Push Notifications (v6.2)
  - Browser Push API
  - Permission Handling
  - Notification Scheduling

- **`i18n.js`** – Internationalisierung
  - DE/EN/PT Übersetzungen
  - Language Switcher Logic

- **`data.js`** – Statische Daten & Content
  - 63 Surf-Lektionen (Theory, Practice, Warmup, Equipment)
  - Surf Spots (15+ Locations weltweit)
  - Surfschul-Daten
  - Goals, Board-Types, Skill Tree

- **`components.jsx`** – Wiederverwendbare UI-Components
  - `WaveBackground` – Animierter Hintergrund
  - `LessonModal` – Lektion-Detail-Overlay
  - `LessonCard` – Lektion-Preview-Card

#### `/screens` – Screen Components (Lazy-Loaded)

- **`HomeScreen.jsx`** – Dashboard mit Stats, Quick Actions, Notifications
- **`BuilderScreen.jsx`** – Programm-Konfigurator (Goal, Spot, Dauer, Level)
- **`LessonsScreen.jsx`** – Lektion-Übersicht mit Filtern & Completion Tracking
- **`TripScreen.jsx`** – Surf-Trip-Planer mit Maps, Wetter, Packing List
- **`DiaryScreen.jsx`** – Surf-Tagebuch mit Foto-Upload & AI-Coaching
- **`ProgressScreen.jsx`** – XP, Badges, Skill Tree, Streak-Anzeige
- **`EquipmentScreen.jsx`** – Equipment-Verwaltung (Boards, Wetsuits)
- **`CommunityScreen.jsx`** – User-Profiles & Social Features
- **`ForecastScreen.jsx`** – Live Surf Forecast (Windguru/Surfline Integration)
- **`SchoolsScreen.jsx`** – Surfschul-Marktplatz mit Stripe-Buchung
- **`InstructorScreen.jsx`** – Surf-Lehrer Dashboard (Session-Management, Zertifikate)
- **`AuthScreen.jsx`** – Login/Signup UI

### `/public` – Static Assets

- **`icon-*.png`** – App Icons für PWA (192x192, 512x512)
- **`favicon.*`** – Browser Favicons
- **`pwa-*.png`** – PWA Splash Screens

---

## 🔄 Datenfluss
- User Input → Screen Component → useSurfData Hook → LocalStorage
- ↓
- Cloud Sync (useSync)
- ↓
- Supabase Database


**Stripe-Buchung:**
- SchoolsScreen → /api/checkout → Stripe Checkout → /api/webhook → Supabase


---

## 🎨 Theme System

- Themes definiert in `App.jsx` (Light/Dark)
- Alle Screens bekommen `t` (theme object) und `dm` (dark mode boolean) als Props
- Dynamische Farben via `th.accent`, `th.card`, etc.

---

## 🌐 Multi-Language

- `i18n.js` verwaltet Übersetzungen (DE, EN, PT)
- `i18n.t("key")` rendert übersetzten Text
- Language Switcher im Menu

---

## 📦 Dependencies

- **React 18** – UI Framework
- **Supabase Client** – Auth & Database
- **Stripe** – Payment Processing
- **Vite** – Build Tool & Dev Server
- **Vite PWA Plugin** – Progressive Web App Support
