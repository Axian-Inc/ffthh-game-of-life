# Game of Life UI Style Guide (Home + New Game Modal)

Audience: coding agent implementing the UI shown in the provided screenshots.  
Goal: reproduce look-and-feel (colors, spacing, radii, shadows, component states).

---

## 1. Design principles

- Bright, friendly, “family” feel with **warm off-white backgrounds** and lots of whitespace.
- Soft geometry: large radii, pill controls, gentle shadows.
- Primary brand expression is a **teal → blue → purple gradient** used on hero/primary CTAs and modal header.
- Surfaces are high-contrast (white cards on warm off-white canvas) with **very subtle borders**.

---

## 2. Color tokens

### 2.1 Neutrals

Use these as the base system. Values are sampled/approximated from the screenshots.

```css
:root{
  /* Canvas / surfaces */
  --bg-canvas: #FFFDF5;          /* warm off-white page & modal body */
  --surface:   #FFFFFF;          /* cards, inner panels, inputs */
  --surface-2: #F0F5EC;          /* subtle tinted area (bottom of modal) */

  /* Text */
  --text-1: #272D3E;             /* near-navy primary text */
  --text-2: #667086;             /* secondary text */
  --text-3: rgba(39,45,62,.65);  /* tertiary */

  /* Lines */
  --border-soft: rgba(39,45,62,.10);
  --border-input: #EAE8DE;       /* sampled input stroke */
  --border-dashed: rgba(39,45,62,.18);

  /* Overlay */
  --overlay: rgba(39,45,62,.22);
}
```

### 2.2 Brand accents

```css
:root{
  --brand-teal:   #22C5B5; /* sampled Add Player button */
  --brand-teal-2: #5CC6D4; /* sampled header-left teal */
  --brand-blue:   #44A5E8; /* sampled header mid */
  --brand-purple: #A377E5; /* sampled header-right */

  /* “Active” pill */
  --success-bg: rgba(34,197,181,.18);
  --success-fg: #22C5B5;
}
```

### 2.3 Gradients

```css
:root{
  /* Primary CTA gradient (Home: New Game / Resume; Modal header) */
  --grad-primary: linear-gradient(90deg,
    #5CC6D4 0%,
    #44A5E8 45%,
    #A377E5 100%);

  /* Disabled CTA gradient (Modal: Start Game with 0 Players) */
  --grad-disabled: linear-gradient(90deg,
    #9EDADF 0%,
    #9ED1EC 45%,
    #C0C0EB 100%);
}
```

---

## 3. Typography

Use a modern sans (Inter preferred).

```css
:root{
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}
```

### Type scale (recommended)

- Page title: 52–60px, weight 800
- Modal title: 26–30px, weight 800 (white on gradient)
- Section labels (e.g., “Game Name”, “Players (0)”): 16–18px, weight 700
- Body / inputs: 16px, weight 500
- Helper text: 14px, weight 500, color `--text-2`

---

## 4. Spacing & layout

Use an 8px spacing system.

```css
:root{
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
}
```

### Home layout

- Centered hero stack (icon → H1 → subtitle → primary CTA)
- “Your Games” section below, then 2-column card grid on desktop, 1-column on mobile.
- Max content width: 1100–1200px.

---

## 5. Radii, borders, shadows

```css
:root{
  --radius-card: 24px;
  --radius-panel: 20px;
  --radius-input: 9999px; /* pill */
  --radius-icon: 16px;

  --shadow-card: 0 12px 30px rgba(39,45,62,.08);
  --shadow-modal: 0 30px 80px rgba(39,45,62,.18);
}
```

---

## 6. Components

### 6.1 Modal overlay + container (New Game)

#### Overlay
- Darken background slightly + blur.
- Click outside closes (if supported).
- Trap focus within modal.

```css
.modalOverlay{
  position: fixed; inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: var(--space-6);
}
```

#### Modal container
- Centered, tall card with soft shadow.
- Suggested size: `width: min(640px, 92vw); max-height: 90vh;`

```css
.modal{
  width: min(640px, 92vw);
  max-height: 90vh;
  background: var(--bg-canvas);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal);
  overflow: hidden; /* keeps header corners clean */
}
```

---

### 6.2 Modal header (gradient bar)

- Full-width header with gradient background.
- Left icon inside a semi-translucent rounded square.
- Title + subtitle in white.
- Close button top-right (white “X”), 40px hit target.

```css
.modalHeader{
  background: var(--grad-primary);
  padding: 22px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.modalHeaderLeft{
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.modalHeaderIcon{
  width: 44px; height: 44px;
  border-radius: var(--radius-icon);
  background: rgba(255,255,255,.22);
  display: grid; place-items: center;
}

.modalTitle{
  font: 800 28px/1.1 var(--font-sans);
  color: #fff;
  margin: 0;
}

.modalSubtitle{
  font: 600 16px/1.3 var(--font-sans);
  color: rgba(255,255,255,.88);
  margin-top: 6px;
}

.modalClose{
  width: 40px; height: 40px;
  border-radius: 12px;
  background: transparent;
  color: #fff;
  display: grid; place-items: center;
}
.modalClose:hover{ background: rgba(255,255,255,.12); }
```

---

### 6.3 Modal content layout

- Use vertical spacing and clear label separation.
- Recommended inner padding: 24px.

```css
.modalBody{
  padding: 24px;
  display: grid;
  gap: 22px;
}
.fieldLabel{
  font: 800 16px/1.2 var(--font-sans);
  color: var(--text-1);
  margin-bottom: 10px;
}
```

---

### 6.4 Inputs (pill fields)

Appearance from screenshot:
- Large pill, soft border, warm off-white background, subtle inset.
- Height ~52–56px.

```css
.input{
  height: 54px;
  width: 100%;
  border-radius: var(--radius-input);
  border: 2px solid var(--border-input);
  background: rgba(255,255,255,.78);
  padding: 0 18px;
  font: 600 16px/1 var(--font-sans);
  color: var(--text-1);
  outline: none;
}
.input::placeholder{ color: rgba(39,45,62,.55); font-weight: 600; }
.input:focus{
  border-color: rgba(34,197,181,.55);
  box-shadow: 0 0 0 4px rgba(34,197,181,.14);
}
.inputError{
  border-color: rgba(231,76,60,.55);
  box-shadow: 0 0 0 4px rgba(231,76,60,.12);
}
```

---

### 6.5 Players panel (dashed inner box)

From screenshot: a white panel with dashed border, rounded corners, generous padding.

```css
.playersPanel{
  background: var(--surface);
  border-radius: var(--radius-panel);
  border: 2px dashed var(--border-dashed);
  padding: 22px;
  display: grid;
  gap: 14px;
}
```

#### Avatar shuffle tile
- Rounded square tile with light warm gray background.
- Clickable; shows emoji/avatar.
- Adjacent hint text “Click to shuffle avatar”.

```css
.avatarRow{
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatarTile{
  width: 72px; height: 72px;
  border-radius: 18px;
  background: #EFEDE4;
  display: grid; place-items: center;
  cursor: pointer;
  user-select: none;
}
.avatarHint{
  font: 700 16px/1.2 var(--font-sans);
  color: var(--text-2);
}
```

---

### 6.6 Primary button (Home: New Game / Resume)

- Pill button with gradient.
- Height 56px, bold white label.

```css
.btnPrimary{
  height: 56px;
  padding: 0 28px;
  border: 0;
  border-radius: 9999px;
  background: var(--grad-primary);
  color: #fff;
  font: 800 18px/1 var(--font-sans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 24px rgba(68,165,232,.22);
  cursor: pointer;
}
.btnPrimary:hover{ filter: brightness(1.03); }
.btnPrimary:active{ transform: scale(.99); }
.btnPrimary:focus-visible{
  outline: none;
  box-shadow: 0 0 0 4px rgba(34,197,181,.18), 0 10px 24px rgba(68,165,232,.22);
}
```

---

### 6.7 Secondary solid button (Modal: Add Player)

In screenshot, “Add Player” is a solid teal pill.

```css
.btnTeal{
  height: 56px;
  width: 100%;
  border: 0;
  border-radius: 9999px;
  background: var(--brand-teal);
  color: #fff;
  font: 800 18px/1 var(--font-sans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(34,197,181,.20);
}
.btnTeal:hover{ filter: brightness(1.03); }
.btnTeal:active{ transform: scale(.99); }
.btnTeal:disabled{
  opacity: .55;
  cursor: not-allowed;
  box-shadow: none;
}
```

---

### 6.8 Disabled primary CTA (Modal: Start Game with 0 Players)

From screenshot:
- Large gradient button but **disabled** when players = 0.
- Show helper text beneath: “Add at least one player to start”.

```css
.btnPrimaryDisabled{
  height: 64px;
  width: 100%;
  border: 0;
  border-radius: 9999px;
  background: var(--grad-disabled);
  color: rgba(255,255,255,.92);
  font: 900 20px/1 var(--font-sans);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: not-allowed;
  opacity: .95;
}

.modalFooter{
  padding: 18px 24px 26px;
  background: linear-gradient(180deg,
    rgba(255,253,245,0) 0%,
    rgba(240,245,236,.95) 65%,
    rgba(240,245,236,1) 100%);
  display: grid;
  gap: 10px;
}

.footerHint{
  text-align: center;
  font: 700 14px/1.3 var(--font-sans);
  color: var(--text-2);
}
```

When enabled (players >= 1), reuse `.btnPrimary` and update label to `Start Game with N Players`.

---

### 6.9 Status pill (“active”)

```css
.pillActive{
  height: 28px;
  padding: 0 12px;
  border-radius: 9999px;
  background: var(--success-bg);
  color: var(--success-fg);
  font: 800 14px/1 var(--font-sans);
  display: inline-flex;
  align-items: center;
}
```

---

## 7. Interaction rules (modal-specific)

- **Shuffle avatar:** clicking avatar tile randomizes avatar/emoji.
- **Add Player:** requires nickname and email validation (email format) before adding.
- **Start Game:** disabled until `players.length >= 1`.
- Always show Players count in label: `Players (N)`.

### Recommended validation visuals
- Inline error text: 13–14px, color `rgba(231,76,60,.95)` under the input.
- Error state uses `.inputError` for fields.

---

## 8. Accessibility requirements

- Modal traps focus; ESC closes.
- Close button has `aria-label="Close modal"`.
- Buttons have 44px+ hit targets.
- Ensure gradient text contrast: white text on gradient; adjust opacity only for disabled states.

---

## 9. Implementation checklist

- [ ] Use CSS variables exactly as above.
- [ ] Ensure modal header gradient matches `--grad-primary`.
- [ ] Inputs are pill-shaped with `2px` border.
- [ ] Players panel is dashed with rounded corners.
- [ ] Add Player button is solid teal.
- [ ] Start Game button uses disabled gradient until at least 1 player exists.
- [ ] Background overlay uses blur + slight dark tint.
