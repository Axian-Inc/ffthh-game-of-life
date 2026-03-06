# Game of Life UI Style Guide (Wave 1 Desktop)

Audience: agents implementing the Wave 1 restart from `march_test`.

Normative references:

- `docs/sample-images/1.WelcomeResume.png`
- `docs/sample-images/2.Life.NewPlayer.png`
- `docs/sample-images/3.Life.PickCity.png`
- `docs/sample-images/4.Life.PickTrack.png`
- `docs/sample-images/5.Life.PickJob.png`
- `docs/sample-images/6.Life.NewGameSummary.png`
- `docs/sample-images/7.Life.Start.png`

## 1. Global rules
1. Wave 1 is desktop browser only.
2. All Playwright visual baselines must run at `1280x720`.
3. Fidelity means matching layout anatomy, spacing, typography hierarchy, button treatment, and copy hierarchy exactly.
4. Browser chrome is not part of the screenshot contract.
5. The new game-name intro step has no external screenshot; its desktop layout must still follow this visual system.

## 2. Shared visual system
```css
:root {
  --bg-canvas: #fffdf5;
  --surface: #ffffff;
  --text-1: #272d3e;
  --text-2: #667086;
  --border-soft: rgba(39, 45, 62, 0.1);
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
}
```

- Use a bright warm canvas, soft shadows, rounded geometry, and large breathing room.
- Wizard and welcome headings use dark ink text (`--text-1`), never white.
- Primary CTAs use the teal-to-blue-to-purple gradient pill.
- Buttons in the wizard footer are side-by-side on desktop.

## 3. Screen 1: Game Hub home
Required desktop anatomy:
1. Centered hero stack with logo tile, `GAME HUB`, `Game of LIFE`, subtitle, and wide `New Game` CTA.
2. Large rounded `Your Games` panel beneath the hero.
3. Single-card baseline remains left-aligned with open space to the right.
4. Multi-game state is a single desktop column with `24px` vertical gap between cards.
5. Cards must never touch each other horizontally or vertically.

Exact baseline content:
1. Card title: `Choices Matter`
2. Metadata: `4 players` and `just now`
3. Status pill: `ACTIVE`
4. Actions: `Resume` and a delete icon button

## 4. Six-step setup wizard
The wizard is now six steps:
1. `New Game Setup`
2. `New Player Setup`
3. `New Player Setup - Pick City`
4. `New Player Setup - Education Track`
5. `New Player Setup - Pick a Career`
6. `New Game - Summary`

Shared shell rules:
1. Full-screen dimmed blurred overlay.
2. Warm off-white centered shell.
3. Centered title and subtitle at the top.
4. Desktop footer buttons stay on one row.
5. Steps 3-5 use overhanging left/center/right card rails.
6. Step 6 uses a wide summary sheet overhanging the shell.

### 4.1 Step 1: game name
1. Title: `New Game Setup`
2. Subtitle: `Step 1 of 6`
3. Field label: `Game Name:`
4. One centered text input and one centered `Next` pill
5. `Next` disabled until the trimmed game name is non-empty

### 4.2 Step 2: player setup (`2.Life.NewPlayer.png`)
1. Title remains `New Player Setup`
2. Subtitle becomes `Step 2 of 6`
3. `Player Name:` and `Choose Your Digital Persona:` are required labels
4. Persona grid remains 5x5 icon-only

### 4.3 Step 3: city (`3.Life.PickCity.png`)
1. Subtitle becomes `Step 3 of 6`
2. Same three-city rail and section ordering as the reference

### 4.4 Step 4: education (`4.Life.PickTrack.png`)
1. Subtitle becomes `Step 4 of 6`
2. Same three-card rail and section ordering as the reference

### 4.5 Step 5: career (`5.Life.PickJob.png`)
1. Subtitle becomes `Step 5 of 6`
2. Same three-card rail and hero-art treatment as the reference
3. Add at least `16px` vertical spacing between the job-title block and the `Income` section

### 4.6 Step 6: summary (`6.Life.NewGameSummary.png`)
1. Subtitle becomes `Step 6 of 6`
2. Summary sheet still follows the reference row anatomy
3. Add an inline editable `Game Name:` input in the summary header
4. `+ New Player` and `Start Game` remain centered beneath the sheet

## 5. Screen 7: Welcome page (`7.Life.Start.png`)
Required behavior and anatomy:
1. Narrow centered reading column on a bright off-white canvas
2. Logo tile, `Welcome to Life!`, three sections, quote block, and `Let's Begin!` CTA
3. No placeholder board or helper captions in the visual baseline
4. `Start Game` and `Resume` both land here first
5. Clicking `Let's Begin!` returns to the landing page `/` for now

## 6. Interaction rules
1. The wizard owns setup state locally until final submit.
2. Step 1 and Step 6 edit the same game-title value.
3. Step 6 `Start Game` is disabled unless the title is valid and at least two players are configured.
4. Player names must stay unique within the wizard draft.
5. All desktop visual tests should disable animations before capturing screenshots.
