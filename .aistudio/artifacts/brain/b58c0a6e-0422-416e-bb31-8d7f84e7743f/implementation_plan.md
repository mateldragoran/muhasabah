# Muhasabah: Decluttered Flow & Focused Accounting Experience

A focused, distraction-free redesign of the daily accounting workflow that eliminates initial UI clutter, replaces persistent mode switches with a quiet intention landing card, activates a sticky top progress stepper only during active accounting, and offers an all-sections review only upon completion.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product design choices have been confirmed and incorporated into the workflow architecture:

- **Landing State**: Quiet intention card with a daily reflection quote on accountability (Muhasabah), localized solar/lunar date context, and a single prominent **"Begin Accounting"** button. The stepper and "Step-by-Step / All Sections" tabs are completely hidden by default.
- **Active Stepper Behavior**: Once "Begin Accounting" is pressed, a sticky compact top progress bar smoothly appears, providing calm orientation (current gateway name, step indicator, and progress line) without cognitive overload.
- **Post-Completion Review**: Upon finishing Istighfar and saving the daily record, the user sees a completion celebration card with a clear, optional **"Review All Sections"** action to inspect or fine-tune all gateways in a unified overview.

---

### 1. Overview & Core Concept

- **What It Does**: Provides an uncluttered, single-focus mental environment for evening self-accounting. Users are not overwhelmed by 8 stepper buttons or multi-section toggles before they even start. They arrive at a serene reflection card, enter the audit flow intentionally, step through each sensory gateway sequentially with a top progress anchor, and only see the comprehensive audit sheet once their session is concluded.
- **Target Audience / Persona**: Individuals seeking a mindful, dignified spiritual discipline who want quietude, rapid focus, and zero administrative friction during late-night or evening reflection.
- **Key Value**: Reduces cognitive fatigue, encourages presence during self-examination, and guarantees that users complete their audit without being distracted by secondary views.

---

### 2. User Experience & Visual Design

#### Key User Flows

```
[ Default Landing ]
  │
  ├─ Warm Ivory & Cream Intention Card
  ├─ Daily Muhasabah Quote / Hadith on Self-Examination
  ├─ Primary Action: [ Begin Daily Accounting ]
  │
  ▼ (User clicks Begin)
[ Active Step-by-Step Audit ]
  │
  ├─ Sticky Compact Top Progress Bar (e.g., "Gateway 1 of 5: Ears")
  ├─ Sequential Gateways (Ears → Eyes → Tongue → Heart → Body)
  ├─ Energy Ledger Step (Gains vs Drains)
  ├─ Istighfar & Tawbah Step (Reflective Counter)
  │
  ▼ (User completes Istighfar & submits)
[ Completion State ]
  │
  ├─ Completion Celebration & Streak Confirmation
  ├─ Primary Action: [ Review All Sections ]
  ├─ Secondary Actions: [ Return to Sanctuary ] / [ Bedtime Mode ]
  │
  ▼ (Optional: Review All Sections)
[ Comprehensive Overview Sheet ]
  └─ Unified inspectable list of all audited gateways and recorded items
```

#### Visual Identity & Theme
- **Aesthetic Direction**: Dignified, calm, and contemplative. The palette continues the warm ivory and cream surface language with deep forest emerald and antique gold accents.
- **Color Tokens**:
  - Surface Background: `#FAF7F2` (Warm Ivory)
  - Card & Container Fill: `#FFFFFF` (Porcelain) and `#F5EFE6` (Warm Sand/Cream)
  - Primary Typography: `#1E293B` (Deep Slate)
  - Accents & Highlights: `#064E3B` (Deep Emerald) and `#D97706` / `#B45309` (Warm Antique Gold)
  - Subtle Borders: `#E8DFD0`
- **Typography & Rhythm**:
  - Headings: `font-cinzel` (Classical Roman proportions, understated and dignified)
  - Body & Form Controls: `font-sans` (`Plus Jakarta Sans`, clean, highly legible)
  - Reflection Quotes: `font-serif` with gentle italic styling
  - Step Metrics & Counters: `font-mono` with `tabular-nums`
- **Interactive Feedback & Transitions**:
  - Smooth vertical slide-fade between the intention card and the first gateway using Motion transitions.
  - Sticky header progress indicator pinned just beneath the main navigation bar with high-performance CSS blur and border delimitation.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removal of the Mode Toggle Switch on Initial Load**
  - *Chosen Approach*: Replace the "Step-by-Step" vs "All Sections" toggle with an intentional "Begin Accounting" entry point.
  - *Why*: Offering multiple view modes on first load fragments user focus before they even begin. Starting with an intention card establishes calm and commitment.
  - *Alternatives Considered*: Retaining small toggle buttons in a corner menu. Discarded because it clutters the zero-state screen.

- **Decision 2: Sticky Compact Top Progress Bar**
  - *Chosen Approach*: A slim 40px top bar that sits at the top of the viewport when scrolling, showing current step icon, gateway name, and an emerald progress line.
  - *Why*: Traditional multi-tab steppers occupy up to 100px of vertical height and 8 clickable pills that wrap awkwardly on mobile phones. A compact bar is ergonomically superior on touch screens.
  - *Alternatives Considered*: Bottom docked progress bar. Discarded to avoid interfering with mobile browser home indicators and the app's bottom navigation bar.

- **Decision 3: Post-Completion Access to All Sections**
  - *Chosen Approach*: Once the user marks Istighfar complete and saves the entry, the completion screen provides a clear "Review All Sections" trigger to view the full audit sheet in one scrollable page.
  - *Why*: The full overview is valuable for reviewing or exporting the entire day's ledger, but is distracting while actually conducting the examination.

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

#### System Layout & Component Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                       App Container                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Navigation Header (Regional Date, Streak, Drawer Trigger)│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ AccountingJourney Component                            │  │
│  │                                                        │  │
│  │  State: journeyPhase: 'landing' | 'active' | 'summary' │  │
│  │                                                        │  │
│  │  [ If 'landing' ]                                      │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ IntentionLandingCard                             │  │  │
│  │  │  - Daily Hadith / Contemplation Quote           │  │  │
│  │  │  - Today's Date & Recorded Status Indicator      │  │  │
│  │  │  - Button: "Begin Daily Accounting"              │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  [ If 'active' ]                                       │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ StickyCompactStepper (Top Bar)                   │  │  │
│  │  │  - Step Name, Progress Bar, Exit Button          │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ GatewayCardStep / LedgerStep / IstighfarStep     │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  [ If 'summary' ]                                      │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ CompletionCard                                   │  │  │
│  │  │  - Streak Metric & Peace Affirmation            │  │  │
│  │  │  - Button: "Review All Sections"                 │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ (When review toggled) GatewaysAuditSection       │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Bottom Navigation Bar (Mobile) / Footer (Desktop)      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### Interactive State Mapping & Handlers

1. **Phase Transitions (`journeyPhase`)**:
   - `landing`: Default state. Renders `IntentionLandingCard`. Shows date, prior completion indicator if already completed today, and the primary "Begin Accounting" call to action.
   - `active`: Triggered by `handleBeginAccounting()`. Plays acoustic audio cue, sets `currentStep` to `ears` (or saved progress), and renders `StickyCompactStepper` + the corresponding step view.
   - `summary`: Triggered when completing `istighfar`. Saves record locally/in mock DB, plays completion chime, and displays completion card.
   - `showAllSections`: Boolean flag toggled within `summary` to reveal or collapse the full grid/list of all audited sections for retrospective review.

2. **Step Sequence in Active Phase**:
   - `ears` → `eyes` → `tongue` → `heart` → `body` → `ledger` → `istighfar` → `summary`.
   - Each step features a "Previous" and "Next Gateway" action with comfortable hit areas (min 44px on mobile) and keyboard accessibility.
