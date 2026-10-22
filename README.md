# Muhasabah (محاسبة) — Spiritual Self-Accounting & Energy Ledger

> *“Call yourselves to account before you are called to account, and weigh your deeds before they are weighed for you.”*  
> — **Sayyidina Umar ibn al-Khattab (رضي الله عنه)**

**Inspired by the teachings of Mawlana Shaykh Nurjan Mirahmadi (ق)**, **Muhasabah** is an offline-first spiritual self-accounting progressive web application designed to help seekers perform a structured, conscious reckoning of their daily deeds, guard the sensory gateways to the heart, maintain their Prophetic connection, and cultivate spiritual vigilance before sleep.

---

## 🌟 Core Features

### 1. The Five Sensory Gateways (Muraqabah & Vigilance)
The heart is a sacred sanctuary, and the senses are its entryways. Every night, review and record your state across the five primary doors:
* 👂 **The Ears**: Guarded against backbiting, idle gossip, and disharmony.
* 👁️ **The Eyes**: Protected from impermissible sights, vain curiosity, and distraction.
* 🗣️ **The Tongue**: Restrained from slander, anger, untruths, and excessive speech.
* ❤️ **The Heart**: Free from malice, pride, envy, and worldly anxiety.
* 🤲 **The Limbs**: Engaged in upright deeds, avoiding transgression.

For any shortcomings, identify the root adversary:
* **Nafs** (The Lower Ego)
* **Dunya** (Worldly Attachment)
* **Hawa** (Fleeting Desires)
* **Shaytan** (Whispering Influences)

### 2. Prophetic Connection (الرابطة الشريفة)
* Reflect on whether your conduct, speech, and inner presence strengthened your connection with **Sayyidina Muhammad ﷺ**.
* Integrated **Salawat Counter** allowing you to immediately send blessings upon the Prophet ﷺ with audio tasbih feedback to seal the reflection in love.

### 3. Spiritual Energy Ledger (Mizan)
* **Light Generated (+Credits)**: Prayers, charity, dhikr, patience, suppressing anger, recitation.
* **Energy Leaked (-Debits)**: Heedlessness, anger, pride, missed opportunities, idle speech.
* **Custom Habit Management**: Users can create their own permanent ledger items, customize point values, and modify or delete defaults to align with their personal spiritual regimen.

### 4. Istighfar & Night Shield (Bedtime Sunnah Protections)
* **Conscious Istighfar**: Digital tasbih counter (33 or 100 beads) to seek forgiveness and clear the slate before resting.
* **Night Shield Armor**: Checklist of traditional bedtime Sunnah protections taught by the saints:
  - Performing fresh Wudu
  - 2 Rak'ats Salatul Wudu
  - Recitation of Ayat al-Kursi
  - 4 Surah al-Falaq (defending against negative energies)
  - 3 Surah an-Nas (warding off internal whisperings)
  - 2 Surah al-Ikhlas (affirming absolute divine oneness)
  - Right-side sleeping posture with covered head and physical wiping

### 5. Historical Trends & Sacred Constellations
* **Energy Waveform Chart**: Visual trend of net spiritual energy over 7, 30, and 90 days.
* **5-Gateway Aura Radar**: Five-pointed geometric constellation visualizing sensory vigilance.
* **Prophetic Connection History**: Longitudinal tracking of your daily connection state.
* **Milestones & Streaks**: Continuous tracking of days accounted, total Istighfar recited, and spiritual consistency.

### 6. Offline-First Progressive Web App (PWA)
* Runs completely offline with instant local storage persistence.
* Installable directly to your iOS or Android home screen from the browser with zero app store downloads.
* Automatic background cloud synchronization when connected.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 8](https://vitejs.dev/) |
| **Styling & Theme** | [Tailwind CSS v4](https://tailwindcss.com/) with a dark emerald & gold sacred palette |
| **PWA & Offline Cache** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/), Workbox Service Worker |
| **Icons & Micro-Interactions** | [Lucide React](https://lucide.dev/), [Motion](https://motion.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Magic Link & Password Auth) |
| **Local Storage Sync** | Bidirectional offline-first cache with automatic conflict reconciliation |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or higher)
* [npm](https://www.npmjs.com/) (version 9 or higher) or [bun](https://bun.sh/)

### 1. Clone the Repository
```bash
git clone https://github.com/mateldragoran/muhasabah.git
cd muhasabah
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root by copying the template:
```bash
cp .env.example .env
```

Open `.env` and configure your Supabase project credentials (see below for setup):
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-publishable-key"
```

> **Note:** The app works fully offline in standalone mode using `localStorage` even if Supabase credentials are not provided initially.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```
This produces an optimized production bundle with service workers generated in the `dist/` directory.

---

## 🗄️ Supabase Database Setup

If you wish to host your own backend for cross-device cloud sync and authentication:

1. Create a free account at [Supabase](https://supabase.com) and create a new project.
2. In the Supabase Dashboard, navigate to **SQL Editor** → **New Query**.
3. Open the schema file provided in this repository at [`supabase/schema.sql`](supabase/schema.sql).
4. Copy the entire contents of `supabase/schema.sql`, paste it into the SQL Editor, and click **Run**.
5. Retrieve your project URL and Anon/Publishable API Key from **Project Settings → API** and add them to your `.env` file.

### What `supabase/schema.sql` Configures:
* **`daily_logs`**: Stores daily accounting records, sensory gateway states, Prophetic connection ratings, transactions, and reflections.
* **`bedtime_checks`**: Tracks nightly Sunnah bedtime protection supplications and postures.
* **`user_ledger_items`**: Manages custom user-defined permanent credit and debit habits.
* **Row-Level Security (RLS)**: Enforces cryptographic user separation so users can strictly only view, insert, update, and delete their own private spiritual logs.
* **Automated `updated_at` triggers**: Ensures timestamps are always accurately updated.
* **Performance Indexes**: Optimized queries for historical trend visualizers and streak calculation.

---

## 📱 Mobile Installation (PWA)

Muhasabah is designed as a standalone mobile Progressive Web App:

### On iOS (Apple Safari)
1. Open the app URL in Safari.
2. Tap the **Install** button in the header (or open the menu and tap Install App).
3. Follow the 4-step sequence:
   * Tap the **three dots (`...`)** in the bottom-right corner of Safari.
   * Tap **Share** `[↑]`.
   * Scroll down and tap **View More** (if needed).
   * Tap **Add to Home Screen** `[+]`.
4. Launch Muhasabah from your iPhone home screen for a full-screen, offline-ready native experience.

### On Android (Google Chrome)
1. Open the app URL in Chrome.
2. Tap the **Install** button in the header or the banner prompt at the bottom of the screen.
3. Confirm **Install** to add the application to your app drawer and home screen.

---

## 📜 Available Scripts

* `npm run dev` — Starts the local Vite development server on port 3000.
* `npm run build` — Compiles TypeScript and creates the production PWA bundle.
* `npm run preview` — Locally previews the production build.
* `npm run lint` — Runs TypeScript type-checking without emitting files.

---

## 🤲 Dedication & Acknowledgments

This application is humbly dedicated to spreading mindfulness, self-reckoning, and the spiritual disciplines taught by **Mawlana Shaykh Nurjan Mirahmadi (ق)**. May it serve as a beneficial tool for anyone seeking to purify their heart and draw closer to the divine presence.
