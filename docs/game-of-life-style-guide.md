# Game of Life UI Style Guide

Audience: contributors implementing the current desktop UI with high fidelity to the approved sample screens.

Normative references:

- `docs/sample-images/1.WelcomeResume.png`
- `docs/sample-images/2.GameName.png`
- `docs/sample-images/3.PlayerPickAvatar.png`
- `docs/sample-images/4.PickCity.png`
- `docs/sample-images/5.PickEdcuation.png`
- `docs/sample-images/6.PickCareer.png`
- `docs/sample-images/7.GameSummary.png`
- `docs/sample-images/8.Life.Start.png`

## 1. Global rules
1. The supported UI target is desktop browser at `1280x720`.
2. Fidelity means matching screenshot anatomy first: composition, spacing, hierarchy, button treatment, corner radii, and visual density.
3. Use a warm off-white canvas, soft blur, rounded white surfaces, and dark ink headings.
4. Browser chrome is not part of the contract.
5. All visual tests must disable animations before taking screenshots.

## 2. Shared visual system
```css
:root {
  --bg-canvas: #fffbf2;
  --surface: #ffffff;
  --surface-muted: #f7f2ea;
  --text-1: #2f3750;
  --text-2: #6e7893;
  --text-3: #95a0ba;
  --border-soft: rgba(47, 55, 80, 0.12);
  --border-strong: rgba(43, 198, 185, 0.9);
  --overlay: rgba(34, 39, 55, 0.24);

  --brand-teal: #29c9c0;
  --brand-blue: #63acef;
  --brand-purple: #bf92f2;
  --grad-primary: linear-gradient(90deg, #8fe0de 0%, #7fbef0 50%, #c99cf0 100%);
  --grad-disabled: linear-gradient(90deg, #bee7e4 0%, #bfd9ef 50%, #dbc7ee 100%);
}
```

- Use dark text for headings, labels, and summary rows; never place white type on the white modal shell.
- Primary CTAs are wide gradient pills with generous horizontal padding.
- Secondary CTAs in the summary use a white fill, teal border, and teal label.
- Inputs use cream-tinted fills with teal focus rings and full pill radii.
- Selected option cards and selected avatar chips use a teal outline, not a filled state.

## 3. Screen 1: Home (`1.WelcomeResume.png`)
Required anatomy:
1. Centered logo tile, `GAME HUB` eyebrow, `Game of LIFE` headline, supporting copy, and a wide centered `New Game` CTA.
2. A large white `Your Games` panel sits beneath the hero with a soft drop shadow.
3. The single-card baseline keeps the first card left-aligned with open whitespace on the right.
4. Cards stay in a single column with at least `24px` vertical separation.
5. Game cards show title, player count, relative time, compact avatar row, status pill, `Resume` CTA, and a delete icon button.

## 4. New Game modal system
The setup experience is a compact modal layered over the blurred home screen.

Shared shell rules:
1. Center a small white modal over a dimmed blurred overlay.
2. Use a header row with optional left back arrow, title, and top-right close button.
3. Steps 1-5 include a 5-segment horizontal progress rail directly below the header.
4. Summary does not show the progress rail.
5. The modal owns all setup state locally until `Start Game`.
6. Closing the modal abandons the in-progress setup without persisting a draft game.

### 4.1 Step 1: Game name (`2.GameName.png`)
1. Title: `Name Your Game`
2. Show only the close button in the header row.
3. Progress rail shows segment 1 active.
4. Input placeholder: `e.g. Family Game Night`
5. `Next` remains disabled until the trimmed game name is non-empty.

### 4.2 Step 2: Player identity (`3.PlayerPickAvatar.png`)
1. Header title: `Player N`
2. Header includes back arrow on the left and close button on the right.
3. Progress rail shows segments 1-2 active.
4. Nickname input is required.
5. Avatar grid is `8 x 2` circular chips with no default selection.
6. `Next` remains disabled until nickname is valid and an avatar is explicitly selected.

### 4.3 Step 3: City (`4.PickCity.png`)
1. Header title: `Choose a City`
2. Progress rail shows segments 1-3 active.
3. Render three vertically stacked rounded cards: `Metro`, `Suburbia`, and `Small Town`.
4. Each city card includes icon, short subtitle, and three PRD-aligned modifier callouts.
5. `Next` remains disabled until a city is selected.

### 4.4 Step 4: Education (`5.PickEdcuation.png`)
1. Header title: `Education Track`
2. Progress rail shows segments 1-4 active.
3. Render three stacked cards: `Degree`, `Trades`, and `Self-Taught`.
4. Each card includes an icon, short subtitle, and three explanatory modifier callouts.
5. `Next` remains disabled until a track is selected.

### 4.5 Step 5: Career (`6.PickCareer.png`)
1. Header title: `Pick a Career`
2. Progress rail shows all five segments active.
3. Show only the three career cards for the currently selected education track.
4. Each career card includes icon, title, and compact stat rows for weekly income, debt, activities per turn, and shorthand attributes.
5. `Next` remains disabled until a career is selected.

### 4.6 Step 6: Summary (`7.GameSummary.png`)
1. Header title: `Ready to Play`
2. Summary shows game name, player count, and one compact row per committed player.
3. Each player row includes avatar, nickname, city, and career.
4. Center `Add Player` and `Start Game` buttons beneath the summary card.
5. `Start Game` remains disabled unless the game name is valid and at least two players are committed.

## 5. Welcome page (`8.Life.Start.png`)
Required anatomy:
1. Bright off-white canvas with a narrow centered reading column.
2. Gradient logo tile above the `Welcome to Life!` heading.
3. Three instructional text sections stacked vertically.
4. A bordered quote block between the middle and final instruction sections.
5. A wide centered `Let's Begin!` CTA at the bottom.
6. `Start Game` and `Resume` both land here first.

## 6. Play screens
These screens extend the approved flow after the welcome page. They should preserve the same warm canvas, white surfaces, rounded corners, and teal-forward emphasis used elsewhere in the product.

### 6.1 Turn start and action selection
1. Keep the play route on a single page rather than introducing a new modal shell.
2. Show the game title, current month number, active player, and seat position in the page header.
3. Render seat order as compact player chips near the top so pass-control order remains visible.
4. Show a player dashboard with cash, debt, net worth, physical health, and mental health in compact stat cards.
5. Present the monthly phase order in a dedicated supporting panel: net worth, debt, health, event, action, summary.
6. The action state starts with a concise explanation and a `Review actions` CTA, then expands into selectable action cards.
7. Action cards use white or cream surfaces with a stronger teal selected outline; unavailable actions stay visible but muted with a reason.
8. Relocation must reveal an inline city picker only when that action is selected.

### 6.2 Turn summary
1. The summary remains on the same page shell and should feel like a continuation of the month, not a separate route.
2. Show the completed player name prominently with a `Turn Summary` eyebrow.
3. Separate intended and unintended outcomes into distinct summary cards.
4. Render phase-by-phase change cards with short explanations and compact delta readouts.
5. The primary CTA is `Pass device`.

### 6.3 Pass control
1. Pass-control is explicit and must name the next player.
2. The panel should be visually simpler than the summary, with one clear primary CTA: `Start next turn`.
3. A secondary `Back to home` action may remain visible for pause/resume behavior.

## 7. Interaction rules
1. Player nicknames must stay unique within the current setup.
2. Avatar selection is required for every committed player.
3. Adding a player from summary opens the next `Player N` step with a fresh random nickname starter and no avatar selected.
4. Changing education must clear any incompatible career selection.
5. New games are persisted only when `Start Game` is pressed.
6. Entering `/games/:id/play` lands on the welcome page first; `Let's Begin!` advances into the turn UI on the same route.
7. Completing a turn should persist the updated game before showing pass-control.
