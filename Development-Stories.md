# Game Hub – Home Screen Development Stories

## Epic: Game Hub – Home Screen

---

## Story 1 — Game Hub Home Screen Layout
**As a** user  
**I want** a clear Game Hub home screen  
**So that** I can create new games and manage my existing ones.

### Acceptance Criteria
- Given the user lands on the Game Hub route, when the screen renders, then the layout matches the provided design exactly in structure and hierarchy.
- The screen is vertically scrollable if content exceeds viewport height.
- The screen contains, in order:
  1. App icon
  2. Screen title (“Game Hub”)
  3. Subtitle text
  4. Primary CTA (“+ New Game”)
  5. “Your Games” section header with count badge
  6. Game cards displayed in a responsive grid
- Content is horizontally centered with consistent padding on left and right.
- Background uses a soft gradient/light background consistent with design.
- No visual element overlaps or clips at common breakpoints (mobile + tablet).

---

## Story 2 — App Icon, Title, and Subtitle
**As a** user  
**I want** a friendly introduction at the top of the Game Hub  
**So that** I understand the purpose of the screen.

### Acceptance Criteria
- The app icon is centered horizontally and uses the game controller icon shown in the design.
- The icon maintains a consistent size across screen sizes.
- The title displays exactly: **“Game Hub”**.
- The title uses the largest text style on the screen and is centered.
- The subtitle displays exactly:
  > Family fun starts here! Create games, add players, and let the good times roll.
- Subtitle text wraps gracefully on smaller screens without truncation.
- Spacing between icon, title, and subtitle matches the visual rhythm of the design.

---

## Story 3 — Primary CTA: “+ New Game” Button
**As a** user  
**I want** to easily create a new game  
**So that** I can start playing quickly.

### Acceptance Criteria
- The “+ New Game” button is centered horizontally beneath the subtitle.
- The button uses a pill-shaped container with a gradient background.
- The label displays exactly **“+ New Game”** with a leading plus icon.
- When the user taps the button, the app navigates to the Create New Game flow.
- The button shows a visible pressed/active state on interaction.
- If disabled, the button appears visually disabled and does not respond to taps.
- The button has an accessibility label of “Create new game”.

---

## Story 4 — “Your Games” Section Header
**As a** user  
**I want** to see how many games I have  
**So that** I understand my current activity.

### Acceptance Criteria
- The section header displays the text **“Your Games”**.
- A trophy icon appears to the left of the header text.
- A numeric badge appears next to the header showing the total number of games.
- The badge value updates dynamically based on game data.
- When there are zero games, the badge displays “0”.
- The header aligns visually with the grid of game cards below it.

---

## Story 5 — Game Card Layout
**As a** user  
**I want** to see my games displayed as cards  
**So that** I can quickly resume or manage them.

### Acceptance Criteria
- Each game is rendered inside a card with rounded corners and a subtle shadow.
- Cards display in a responsive grid:
  - Two columns on wider screens
  - One column on narrow screens
- Each card includes:
  - Game title
  - Status badge
  - Player count
  - Last updated time
  - Player avatars
  - Resume button
  - Delete icon

---

## Story 6 — Game Card: Title and Status
**As a** user  
**I want** to identify each game at a glance  
**So that** I can select the correct one.

### Acceptance Criteria
- The game title is displayed prominently in bold text.
- Long titles truncate with an ellipsis instead of wrapping.
- A status badge displaying **“active”** appears in the top-right of the card.
- The status badge uses a pill shape and green/teal styling consistent with the design.

---

## Story 7 — Game Card: Metadata (Players & Time)
**As a** user  
**I want** to see basic game details  
**So that** I understand its context.

### Acceptance Criteria
- Player count displays with an icon and text (e.g., “3 players”).
- Player count uses correct singular/plural grammar.
- Last updated time displays relative time (e.g., “about 1 hour ago”).
- Metadata appears directly below the game title and is evenly spaced.

---

## Story 8 — Game Card: Player Avatars
**As a** user  
**I want** to see which players are in a game  
**So that** I can recognize it quickly.

### Acceptance Criteria
- Player avatars are displayed as circular images/emojis.
- Avatars appear in a horizontal row with consistent spacing.
- If an avatar image fails to load, a fallback avatar is displayed.

---

## Story 9 — Game Card: Resume Button
**As a** user  
**I want** to resume a game with one tap  
**So that** I can continue playing immediately.

### Acceptance Criteria
- The Resume button displays the text **“Resume”** with a play icon.
- The button uses the same gradient and pill styling as the New Game button.
- Tapping Resume navigates to the selected game session.
- If the game is not resumable, the button appears disabled.

---

## Story 10 — Game Card: Delete Action
**As a** user  
**I want** to delete a game  
**So that** I can remove games I no longer need.

### Acceptance Criteria
- A trash/delete icon appears to the right of the Resume button.
- Tapping the delete icon opens a confirmation dialog.
- The dialog references the game name being deleted.
- The dialog includes Cancel and Delete actions.
- Confirming deletion removes the game card and updates the game count.
- Canceling closes the dialog with no changes.

---

## Story 11 — Empty State (No Games)
**As a** user  
**I want** guidance when I have no games  
**So that** I know how to get started.

### Acceptance Criteria
- When the user has zero games, no game cards are shown.
- An empty state message appears under the “Your Games” header.
- The empty state encourages creating a new game.
- The “+ New Game” button remains visible and functional.

---

## Story 12 — Loading and Error States
**As a** user  
**I want** clear feedback during loading or errors  
**So that** the app feels reliable.

### Acceptance Criteria
- While loading, skeleton placeholders are shown for game cards.
- Layout does not shift when content loads.
- If loading fails, an inline error message is displayed with a Retry action.
- Retry attempts to reload the game list.

---

## Story 13 — Accessibility and Responsiveness
**As a** user with accessibility needs  
**I want** the Game Hub to be accessible and responsive  
**So that** I can use it comfortably.

### Acceptance Criteria
- All interactive elements have accessible labels.
- Buttons and icons are reachable via keyboard and screen readers.
- Color contrast meets accessibility standards.
- Text scales correctly with system font size.
- Layout adapts correctly to different screen sizes and orientations.

