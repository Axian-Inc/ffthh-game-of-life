# Game of Life UI Style Guide (Screens 1-7)

Audience: agents implementing the exact Wave 1 visuals shown in the provided screenshots.

Normative reference screens:

- `docs/sample-images/1.WelcomeResume.png`
- `docs/sample-images/2.Life.NewPlayer.png`
- `docs/sample-images/3.Life.PickCity.png`
- `docs/sample-images/4.Life.PickTrack.png`
- `docs/sample-images/5.Life.PickJob.png`
- `docs/sample-images/6.Life.NewGameSummary.png`
- `docs/sample-images/7.Life.Start.png`

Out of scope:

- `docs/sample-images/8.PlayerTurn.png`

## 1. How to use this guide
1. Treat the screenshots as exact product requirements, not inspiration.
2. This guide defines the shared visual system and the non-negotiable screen anatomy for Screens 1-7.
3. Browser chrome is not part of fidelity. Compare the rendered app surface only.
4. Wave 1 screenshot baselines must be captured at `1280x720`.
5. Fidelity means exact layout anatomy, proportion, typography hierarchy, art treatment, button placement, and copy hierarchy. Runtime data may vary only where the owning spec explicitly allows it.

## 2. Shared visual system

### 2.1 Tone
- Bright warm canvas, soft shadows, and rounded geometry.
- Teal-to-blue-to-purple gradient on primary CTAs only.
- Off-white shells and white cards, not stark white-on-white flat layouts.
- Large breathing room with centered compositions.

### 2.2 Core color tokens
```css
:root {
  --bg-canvas: #fffdf5;
  --surface: #ffffff;
  --text-1: #272d3e;
  --text-2: #667086;
  --border-soft: rgba(39, 45, 62, 0.1);
  --border-input: #eae8de;
  --overlay: rgba(39, 45, 62, 0.22);

  --brand-teal: #22c5b5;
  --brand-teal-2: #5cc6d4;
  --brand-blue: #44a5e8;
  --brand-purple: #a377e5;

  --bar-green: #55c26e;
  --bar-blue: #4a9bda;
  --bar-purple: #9b5ae3;
  --bar-gold: #d1a64d;
  --bar-orange: #e5963e;

  --grad-primary: linear-gradient(90deg, #5cc6d4 0%, #44a5e8 45%, #a377e5 100%);
  --grad-disabled: linear-gradient(90deg, #9edadf 0%, #9ed1ec 45%, #c0c0eb 100%);
}
```

### 2.3 Typography hierarchy
- Home heading `Game of LIFE`: visually dominant, bold, centered.
- Wizard titles: large and heavy, centered, but smaller than the home heading.
- Step subtitles: smaller muted line directly beneath titles.
- Card titles: bold and prominent.
- Body/stat text: compact but readable.
- Welcome heading `Welcome to Life!`: as large and dominant as the reference.

### 2.4 Shape and elevation
- Main surfaces use generous radius (`20-28px`) and soft shadow.
- Inputs and primary/secondary buttons are full pill shapes.
- Selected cards use a visible glow/ring, not just a subtle border.
- Overlay blur is required whenever wizard screens are shown.

### 2.5 Asset rules
1. Use locally committed art assets for persona, city, track, job, and summary visuals.
2. Do not substitute generic text badges such as `SF`, `DN`, `TN`, `DEG`, or `EL`.
3. Do not use placeholder descriptive copy such as `starting profile` or other generated filler.
4. In Wave 1, avoid new shared cross-spec visual primitive files unless a single spec owns them outright. Localize assets or inline marks inside the owning spec where necessary to preserve parallelism.

## 3. Screen 1 contract: Game Hub home (`1.WelcomeResume.png`)

### 3.1 Required anatomy
1. Centered hero stack near the top of the page.
2. Logo tile above the eyebrow.
3. Uppercase eyebrow text: `GAME HUB`.
4. Main heading: `Game of LIFE`.
5. Subtitle directly beneath the heading.
6. Wide gradient `New Game` CTA beneath the subtitle.
7. Large rounded `Your Games` container beneath the hero.
8. Count badge aligned to the right edge of the `Your Games` header.
9. A single active game card anchored to the left side of the large games container, leaving significant empty space to the right.

### 3.2 Exact baseline visual state
1. Seeded game card title: `Choices Matter`.
2. Metadata line includes `4 players` and `just now`.
3. Status pill reads `ACTIVE`.
4. Action row shows `Resume` plus a delete icon button.

### 3.3 Reject conditions
1. Eyebrow text is not uppercase `GAME HUB`.
2. Games panel tightly wraps the card with no right-side breathing room.
3. CTA is rendered as a narrow utility button instead of a wide gradient pill.

## 4. Screens 2-6 contract: New Player wizard

### 4.1 Shared wizard shell
1. Full-screen dimmed blurred overlay.
2. Warm off-white centered modal shell with close `X` at the top-right.
3. Step title and subtitle centered at the top.
4. Footer buttons centered and pill-shaped.
5. Steps 2-4 use overhanging left/center/right card rails that extend beyond the modal shell.
6. Step 5 uses a wide summary sheet that also overhangs the modal shell.

### 4.2 Screen 2: New Player Setup (`2.Life.NewPlayer.png`)
1. Title: `New Player Setup`.
2. Subtitle: `Step 1 of 5`.
3. Field label: `Player Name:`.
4. Persona label: `Choose Your Digital Persona:`.
5. Persona selector is a 5x5 icon-only grid.
6. No text captions under persona tiles.
7. Top-left tile is selected by default in the baseline screenshot.
8. `Next` is centered as a wide gradient pill.

Reject conditions:

1. Validation text is visible before user interaction.
2. Persona tiles use the old animal set or any fallback emoji/text.

### 4.3 Screen 3: Pick City (`3.Life.PickCity.png`)
1. Title: `New Player Setup - Pick City`.
2. Subtitle: `Step 2 of 5`.
3. Exactly three city cards render: San Francisco, Denver, Tonopah, NV.
4. The selected middle card is elevated and outlined.
5. Each card includes, in order:
   - illustrated title row
   - green `Cost` bar
   - blue `Opportunity` bar
   - purple `Wellbeing` bar
   - descriptive paragraph

Reject conditions:

1. City titles include token-badge substitutes instead of illustration + text.
2. Cards render as a simple in-shell three-column grid with no overhang.

### 4.4 Screen 4: Education Track (`4.Life.PickTrack.png`)
1. Title: `New Player Setup - Education Track`.
2. Subtitle: `Step 3 of 5`.
3. Exactly three track cards render: Degree Track, Trades Track, Self-Taught Track.
4. The selected middle card is elevated and outlined.
5. Each card includes, in order:
   - illustrated title row
   - green `Debt/Investment` bar
   - blue `Long-Term Potential` bar
   - purple `Stability` bar
   - descriptive paragraph

### 4.5 Screen 5: Pick a Career (`5.Life.PickJob.png`)
1. Title: `New Player Setup - Pick a Career`.
2. Subtitle: `Step 4 of 5`.
3. Exactly three job cards render for the chosen track.
4. Each card includes, in order:
   - large hero illustration
   - job title
   - gold `Income` bar
   - blue `Stability` bar
   - orange `Wage Growth` bar
   - short outlook copy

### 4.6 Screen 6: New Game Summary (`6.Life.NewGameSummary.png`)
1. Title: `New Game - Summary`.
2. Subtitle: `Step 5 of 5`.
3. A wide summary sheet spans beyond the shell width.
4. Rows are horizontal with subtle dividers, not separate boxed cards.
5. Each row follows the visual cluster order:
   - avatar + name/city text
   - city illustration
   - education label + icon
   - job label + icon
6. Footer buttons are centered beneath the summary sheet:
   - `+ New Player`
   - `Start Game`

Reject conditions:

1. Summary content is rendered as boxed cards or stacked pills.
2. Footer actions are right-aligned or undersized.

## 5. Screen 7 contract: Welcome page (`7.Life.Start.png`)

### 5.1 Required anatomy
1. Narrow centered reading column.
2. Logo tile above the heading.
3. Heading: `Welcome to Life!`
4. Three content sections in order:
   - `A Month at a Time`
   - `Choices Matter`
   - `Life Happens`
5. Quote block appears between section 2 and section 3.
6. Wide gradient CTA labeled `Let's Begin!` at the bottom of the column.

### 5.2 Reject conditions
1. Any extra mode label or helper caption appears in the baseline screenshot.
2. The quote block appears after `Life Happens`.
3. The CTA is narrower or styled differently than the reference.

## 6. Interaction rules
1. Wizard `Next` stays disabled until the current step is valid.
2. Wizard `Back` preserves prior selections.
3. Wizard Step 4 filters jobs by the selected track.
4. Wizard Step 5 `Start Game` stays disabled with fewer than 2 configured players.
5. Welcome CTA must be keyboard-operable and route forward.

## 7. Accessibility rules
1. Modal traps focus and closes on `Escape`.
2. Close button uses `aria-label="Close modal"`.
3. Selectable cards/tiles are buttons with visible focus treatment.
4. Decorative art is hidden from assistive tech when duplicated by visible text.
5. Gradient CTA text remains readable.

## 8. Automation and sign-off
1. Each Wave 1 visual surface must include a deterministic Playwright screenshot test at `1280x720`.
2. Screens 2-6 may use wizard-owned seeded fixtures/backdrops instead of depending on the Screen 1 implementation.
3. Screen 1 must seed local storage/time so the screenshot always shows the expected single-card state.
4. Screen 7 must seed a deterministic started game and capture the pre-CTA state.
5. Any screenshot drift against Screens 1-7 blocks merge.
