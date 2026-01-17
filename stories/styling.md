# UI Styling Rules (from provided mockups)

This document defines styling rules for the **Game Hub** screen and **New Game** modal based on the provided screenshots. It is intentionally implementation-agnostic and designed to be applied in CSS (or translated to Tailwind/theme tokens).

---

## Visual Language

### Overall Look & Feel
- **Light, airy, friendly** UI with soft gradients and generous whitespace.
- **Rounded corners everywhere** (cards, buttons, modal, inputs).
- **Soft shadows** (no harsh borders; borders are subtle and light).
- **Gradient primary actions** (teal → blue → purple).
- **Neutral content surfaces** on top of a **pastel background**.

---

## Color System

### Primary Gradient (CTA)
- Use a left-to-right gradient for major CTAs and modal header:
  - Start: teal
  - Mid: sky blue
  - End: purple

### Background
- Use a very light pastel gradient background (warm off-white with faint mint/peach tones).

### Surface Colors
- Cards/Modal body: white or near-white.
- Inputs: white with subtle border.

### Text
- Titles: dark navy/charcoal.
- Secondary text: muted gray-blue.

### Status Pill
- “active” is a soft mint/teal pill with darker teal text.

### Destructive
- Delete icon: muted gray with hover state shifting darker (and optionally red on hover).

---

## Typography

### Font
- Use a modern rounded sans-serif (system font stack acceptable).
- Titles: heavy weight (700–800).
- Body: regular (400–500).

### Size Scale (approx from mock)
- Page H1 (“Game Hub”): 44–56px
- Modal Title (“New Game”): 20–24px
- Section Title (“Your Games”): 18–20px
- Body text: 14–16px
- Helper text: 12–14px

### Line Height
- Titles: 1.1–1.2
- Body: 1.4–1.6

---

## Spacing & Layout

### Global Spacing
- Use an 8px spacing grid.
- Typical paddings:
  - Page padding: 24–40px (responsive)
  - Card padding: 20–24px
  - Modal padding: 20–28px
  - Input padding: 12–14px vertical, 16–18px horizontal

### Page Layout (Game Hub)
- Centered header stack:
  - App icon
  - H1
  - Subtitle
  - Primary CTA
- Below header:
  - “Your Games” section aligned left
  - Game cards displayed in a responsive grid:
    - Desktop: 2 columns
    - Tablet: 1–2 columns
    - Mobile: 1 column

### Cards
- Cards have:
  - Rounded corners (16–20px)
  - Light border
  - Soft shadow
- Inside card:
  - Title row with status pill aligned top-right
  - Metadata row (players, last active)
  - Avatar row
  - CTA row with Resume button + delete icon

---

## Components

### Buttons
#### Primary Gradient Button
- Large, pill-shaped, gradient background.
- White text.
- Subtle shadow.
- Hover: slightly brighter + lift
- Active: slight press down
- Disabled: lower opacity + no hover lift

#### Secondary / Icon Buttons
- Icon buttons (close “X”, delete) are circular or minimal.
- Hover states add subtle background tint.

### Inputs
- Rounded (14–16px radius).
- Light border.
- Focus state uses teal/blue ring.

### Modal (New Game)
- Modal is centered with:
  - Rounded container (20–24px)
  - Header strip with gradient
  - Body with labeled fields
- Header contains:
  - Icon + title + subtitle left
  - Close “X” right
- Players section contains a dashed-border panel with avatar shuffle, helper text, inputs, and Add Player button.
- Start button spans width at bottom, large pill CTA.

---

## Accessibility Rules
- All interactive elements must be reachable via keyboard.
- Buttons must have accessible names (e.g., “Close”, “Delete game”, “Add Player”).
- Focus indicators must be visible and high-contrast (use focus ring).
- Ensure color contrast for text meets WCAG AA where feasible (especially button text).

---

## Responsive Rules
- Modal width:
  - Desktop: 520–620px
  - Mobile: 92vw with max-height scrolling
- Game cards:
  - 2 columns at ≥ 900px
  - 1 column below that
- Buttons always remain tappable (min-height 44px).

---
