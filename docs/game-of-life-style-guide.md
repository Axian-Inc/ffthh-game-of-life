# Game of Life UI Style Guide (Screens 1-7)

Audience: coding agent implementing the UI shown in the provided screenshots.
Goal: reproduce look-and-feel (colors, spacing, radii, shadows, component states) for:

- `docs/sample-images/1.WelcomeResume.png`
- `docs/sample-images/2.Life.NewPlayer.png`
- `docs/sample-images/3.Life.PickCity.png`
- `docs/sample-images/4.Life.PickTrack.png`
- `docs/sample-images/5.Life.PickJob.png`
- `docs/sample-images/6.Life.NewGameSummary.png`
- `docs/sample-images/7.Life.Start.png`

Note: `docs/sample-images/8.PlayerTurn.png` (Main Game Status) is out of scope for this style guide revision.

---

## 1. Design principles

- Bright, friendly family tone with warm off-white background and large whitespace.
- Soft geometry: rounded cards, pill buttons, low-contrast borders.
- Primary brand expression: teal -> blue -> purple gradient on key CTAs.
- Clear information hierarchy with strong titles and compact utility labels.

---

## 2. Color tokens

### 2.1 Neutrals

```css
:root{
  --bg-canvas: #FFFDF5;
  --surface: #FFFFFF;
  --surface-2: #F0F5EC;

  --text-1: #272D3E;
  --text-2: #667086;
  --text-3: rgba(39,45,62,.65);

  --border-soft: rgba(39,45,62,.10);
  --border-input: #EAE8DE;
  --border-dashed: rgba(39,45,62,.18);

  --overlay: rgba(39,45,62,.22);
}
```

### 2.2 Brand accents

```css
:root{
  --brand-teal: #22C5B5;
  --brand-teal-2: #5CC6D4;
  --brand-blue: #44A5E8;
  --brand-purple: #A377E5;

  --success-bg: rgba(34,197,181,.18);
  --success-fg: #22C5B5;
}
```

### 2.3 Section bar accents (wizard cards)

```css
:root{
  --bar-green: #55C26E;
  --bar-blue: #4A9BDA;
  --bar-purple: #9B5AE3;
  --bar-gold: #D1A64D;
  --bar-orange: #E5963E;
}
```

### 2.4 Gradients

```css
:root{
  --grad-primary: linear-gradient(90deg,
    #5CC6D4 0%,
    #44A5E8 45%,
    #A377E5 100%);

  --grad-disabled: linear-gradient(90deg,
    #9EDADF 0%,
    #9ED1EC 45%,
    #C0C0EB 100%);
}
```

---

## 3. Typography

```css
:root{
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
```

Recommended scale:

- Home title (`Game of LIFE`): 64-76px, weight 800.
- Wizard modal title: 48-58px, weight 800.
- Step subtitle (`Step X of 5`): 20-26px, weight 700.
- Card title: 34-44px, weight 800.
- Card body/labels: 15-18px, weight 600.
- Welcome page heading: 72-90px, weight 800.
- Welcome section headings: 48-56px, weight 800.

Use sentence case for body copy and preserve title case for key headings from screenshots.

---

## 4. Spacing, radii, and elevation

Use 8px spacing scale with larger page paddings.

```css
:root{
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --radius-card: 24px;
  --radius-panel: 20px;
  --radius-input: 9999px;
  --radius-icon: 16px;

  --shadow-card: 0 12px 30px rgba(39,45,62,.08);
  --shadow-modal: 0 30px 80px rgba(39,45,62,.18);
}
```

---

## 5. Screen-by-screen layout contracts

### 5.1 Screen 1 - Home + game list (`1.WelcomeResume.png`)

Required structure:

1. Centered hero stack: icon -> eyebrow (`GAME HUB`) -> title (`Game of LIFE`) -> subtitle -> primary button (`New Game`).
2. Large rounded `Your Games` container below hero.
3. Game count badge aligned to right in section header.
4. At least one game card with compact metadata, avatars, Resume button, delete icon.

Layout notes:

- Max content width: 1100-1200px.
- Hero and games panel separated by at least `--space-6`.
- Primary CTA width approximately 420-540px on desktop.

### 5.2 Screens 2-6 - Wizard modal (`2` through `6`)

Modal shell:

1. Full-screen overlay with blur and dimming.
2. Centered warm-white modal card.
3. Close X button in top-right.
4. Footer action row with pill buttons.

Header text pattern:

- Step 1: `New Player Setup`
- Step 2: `New Player Setup - Pick City`
- Step 3: `New Player Setup - Education Track`
- Step 4: `New Player Setup - Pick a Career`
- Step 5: `New Game - Summary`
- Subtitle always `Step X of 5`.

### 5.3 Screen 7 - Welcome page (`7.Life.Start.png`)

Required structure:

1. Top logo tile centered.
2. Large heading `Welcome to Life!`.
3. Three sections:
   - `A Month at a Time`
   - `Choices Matter`
   - `Life Happens`
4. Quote callout between section 2 and section 3.
5. Bottom full-width gradient CTA (`Let's Begin!`).

Layout notes:

- Narrow centered reading column (`~760-900px`).
- Strong vertical rhythm between sections.
- CTA anchored near lower fold with clear breathing room.

---

## 6. Wizard components (Screens 2-6)

### 6.1 Overlay and modal container

```css
.modalOverlay{
  position: fixed;
  inset: 0;
  padding: 32px;
  display: grid;
  place-items: center;
  background: var(--overlay);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal{
  width: min(1120px, 94vw);
  max-height: 90vh;
  background: var(--bg-canvas);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal);
  overflow: hidden;
}
```

### 6.2 Inputs and persona tiles (Step 1)

```css
.input{
  height: 56px;
  width: 100%;
  border-radius: var(--radius-input);
  border: 2px solid var(--border-input);
  background: rgba(255,255,255,.8);
  padding: 0 18px;
  font: 600 16px/1 var(--font-sans);
}

.personaGrid{
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.personaTile{
  min-height: 72px;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  background: #fff;
}

.personaTileSelected{
  border-color: rgba(68,165,232,.65);
  box-shadow: 0 0 0 3px rgba(68,165,232,.18);
}
```

### 6.3 Selection cards (Steps 2-4)

Card frame:

```css
.choiceCard{
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(39,45,62,.08);
}

.choiceCardSelected{
  border-color: rgba(68,165,232,.7);
  box-shadow: 0 0 0 3px rgba(68,165,232,.18), 0 8px 18px rgba(39,45,62,.10);
}
```

Section bars inside cards:

```css
.statBar{
  border-radius: 8px;
  color: #fff;
  font: 800 14px/1 var(--font-sans);
  padding: 8px 10px;
}
.statBarCost{ background: var(--bar-green); }
.statBarOpportunity{ background: var(--bar-blue); }
.statBarWellbeing{ background: var(--bar-purple); }
.statBarIncome{ background: var(--bar-gold); }
.statBarGrowth{ background: var(--bar-orange); }
```

Rules:

- Step 2, 3, and 4 each render exactly three cards in desktop layout.
- Card body includes explanatory paragraph below section bars.
- Step 4 cards include hero image area at top.

### 6.4 Summary table (Step 5)

Required behavior and structure:

- One horizontal row per configured player.
- Row split into three clusters: identity, education, job.
- Use icon + label-value pattern.
- Two footer buttons:
  - `+ New Player` (secondary)
  - `Start Game` (primary gradient)

```css
.summaryRow{
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 16px;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid var(--border-soft);
  padding: 16px;
}
```

---

## 7. Buttons

Primary gradient button (used on Home, wizard Next, Start Game, Welcome CTA):

```css
.btnPrimary{
  height: 56px;
  border: 0;
  border-radius: 9999px;
  background: var(--grad-primary);
  color: #fff;
  font: 800 18px/1 var(--font-sans);
  box-shadow: 0 10px 24px rgba(68,165,232,.22);
}
```

Secondary outline button (wizard Back / New Player):

```css
.btnSecondary{
  height: 56px;
  border-radius: 9999px;
  border: 2px solid rgba(39,45,62,.35);
  background: #fff;
  color: var(--text-1);
  font: 700 18px/1 var(--font-sans);
}
```

Disabled primary:

```css
.btnPrimary:disabled{
  background: var(--grad-disabled);
  opacity: .95;
  cursor: not-allowed;
  box-shadow: none;
}
```

---

## 8. Interaction rules

1. Next is disabled until current step requirements are satisfied.
2. Back preserves prior selections.
3. Step 4 options are filtered by selected education track.
4. Step 5 `Start Game` remains disabled for fewer than 2 configured players.
5. Step 5 `+ New Player` starts a fresh player draft without deleting existing summary rows.
6. Welcome CTA must be keyboard-operable and route forward.

---

## 9. Accessibility requirements

1. Modal traps focus and closes on ESC.
2. Close button has `aria-label="Close modal"`.
3. Selectable cards are buttons with visible focus state.
4. Touch targets are 44px minimum.
5. White text on gradient buttons must remain readable.

---

## 10. Responsive behavior

Desktop target:

- Wizard cards displayed in 3-column layout on Steps 2-4.
- Summary rows remain horizontal.

Mobile/tablet fallback:

- Steps 2-4 collapse to 1 column cards.
- Summary rows stack sections vertically.
- Footer buttons remain full-width and legible.

---

## 11. Fidelity checklist (required for sign-off)

1. Screen 1: hero and games list hierarchy matches reference image.
2. Screen 2: name input + persona grid and step label match structure.
3. Screen 3: city cards include Cost, Opportunity, Wellbeing sections.
4. Screen 4: education cards include Debt/Investment, Long-Term Potential, Stability.
5. Screen 5: job cards include Income, Stability, Wage Growth.
6. Screen 6: summary rows include avatar/name/city/education/job and footer buttons.
7. Screen 7: welcome heading, three sections, quote block, and CTA order matches reference.

Any missing screen-level requirement blocks merge.
