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
- `docs/sample-images/9.PlayerTurn.png`

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

## 6. Player Turn (`9.PlayerTurn.png`)
Required anatomy:
1. Keep the same warm off-white canvas and center a stacked play layout inside the desktop viewport.
2. Center the title `Modern Game of Life - Turn 10` above the subtitle `Jack's Turn`.
3. Render a horizontal four-player rail beneath the subtitle with left and right chevrons flanking the player tiles.
4. Each player tile uses a portrait card above a centered player label.
5. The active player tile uses a teal-to-purple outline glow; inactive tiles use pale-lilac surfaces with subtle borders.
6. Place a large white status card beneath the rail with three equal columns separated by faint vertical dividers.
7. The left column lists `Net Worth`, `Cash (Spendable)`, `Assets & Investments`, and `Debt` with large supporting icons and bold values.
8. The middle column lists `Job`, `Income`, `Physical Health`, `Mental Health`, and `Location`, with physical and mental health shown as green fills on pale tracks.
9. The right column groups modifier icons into `Choice Modifiers` and `Life Modifiers`, each with three labeled icons.
10. Center three wide pill buttons under the card: `See History`, `Choose Action`, and `Pass`.

Visual rules:
1. The title uses dark navy text with a slightly tighter line height than the home hero.
2. The subtitle uses muted gray text and lighter weight than the title.
3. Portrait tiles are `64px` square inside rounded cards with soft interior padding.
4. The active-player card glow uses the shared teal-blue-purple gradient family rather than a solid ring.
5. Inactive-player cards use a pale lilac-white fill and soft neutral stroke.
6. The status card uses a `24px` radius, white fill, soft shadow, and internal divider lines.
7. Financial labels and status labels use dark ink text; debt values use a red warning tone.
8. Health tracks use pale gray-green rails with bright green fills and fully rounded ends.
9. Side action buttons use a dark slate gradient with white text.
10. The center action button uses the bright teal-blue-purple gradient and carries the strongest shadow.
11. Keep even spacing across the three bottom buttons and preserve the large whitespace halo around the card.

## 7. Interaction rules
1. Player nicknames must stay unique within the current setup.
2. Avatar selection is required for every committed player.
3. Adding a player from summary opens the next `Player N` step with a fresh random nickname starter and no avatar selected.
4. Changing education must clear any incompatible career selection.
5. New games are persisted only when `Start Game` is pressed.
