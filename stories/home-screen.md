# Game Hub (Home) — User Stories & Testable Acceptance Criteria

> Scope: Stories derived from the provided “Game Hub” Home screen mockup only.
> All acceptance criteria are written to be testable via Jest + DOM testing (e.g., @testing-library/react).

---

## Epic: Game Hub Shell & Navigation

> Purpose: Establish the Game Hub as the primary entry point for household games.


### Story: Render Game Hub Home Screen

**As a** household member  
**I want** to see the Game Hub home screen  
**So that** I can access game creation and my existing games

### Acceptance Criteria (Jest-testable)
- **Given** I am authenticated  
  **When** the Game Hub screen renders  
  **Then** the page shows a visible heading with text `Game Hub` (queryable by role `heading`).
- **Given** the screen renders  
  **Then** a subtitle/description is visible (queryable by text) containing the phrase `Family fun starts here` (case-insensitive match permitted).
- **Given** the screen renders  
  **Then** a primary button labeled `New Game` is visible (queryable by role `button` and accessible name).
- **Given** the screen renders  
  **Then** a section heading labeled `Your Games` is visible (queryable by text or role `heading`).

### Notes
- Authentication mechanics are out of scope; tests may render the component under an authenticated context provider.

---

### Story: Create a New Game from Home

**As a** household member  
**I want** to start a new game from the Game Hub  
**So that** I can create a new household experience

### Acceptance Criteria (Jest-testable)
- **Given** I am on the Game Hub screen  
  **Then** a `New Game` button is enabled (queryable by role `button`, `toBeEnabled()`).
- **When** I click the `New Game` button  
  **Then** a navigation action is triggered to the new-game flow (assert via mocked router navigation or callback, e.g., `onNewGame()` called once).

### Notes
- The destination route/path is not specified in the mock; test via injected `navigate` function or router mock.

---

### Story: Show “Your Games” Count Badge

**As a** household member  
**I want** to see how many games I have  
**So that** I understand the size of my game list at a glance

### Acceptance Criteria (Jest-testable)
- **Given** I have `N` games in the provided data  
  **When** the Game Hub screen renders  
  **Then** the `Your Games` section displays a count indicator with value `N` (queryable by text).
- **Given** I have `0` games  
  **When** the screen renders  
  **Then** the count indicator displays `0`.

### Notes
- The mock shows a badge next to “Your Games”; exact styling is not tested—only visible text.

---

### Story: Render Game Cards for Each Game

**As a** household member  
**I want** each game to appear as a card  
**So that** I can scan and choose a game quickly

### Acceptance Criteria (Jest-testable)
- **Given** I have a list of games  
  **When** the screen renders  
  **Then** exactly one card element per game is displayed (assert via `getAllByTestId('game-card')` length equals number of games).
- **Given** a game card is rendered  
  **Then** it contains the game name as visible text.

### Notes
- Add a stable selector such as `data-testid="game-card"` for reliable testing.

---

### Story: Display Game Player Count

**As a** household member  
**I want** to see how many players are in each game  
**So that** I can confirm who is included

### Acceptance Criteria (Jest-testable)
- **Given** a game has `playerCount`  
  **When** its card renders  
  **Then** the card shows text in the format `X players` where `X` equals `playerCount` (queryable by regex).
- **Given** `playerCount` is `1`  
  **Then** the card shows `1 player` (singular) OR `1 players` (plural) consistently per product decision (choose one and test it).

### Notes
- Mock shows `3 players` / `2 players`; pluralization rule must be decided for deterministic UI tests.

---

### Story: Display Game Last Activity Time

**As a** household member  
**I want** to see when each game was last active  
**So that** I can tell which games are current

### Acceptance Criteria (Jest-testable)
- **Given** a game has `lastActiveLabel` (preformatted human-readable text)  
  **When** the card renders  
  **Then** the label is shown as visible text (e.g., `about 1 hour ago`).
- **Given** the card renders  
  **Then** a time indicator icon is present with an accessible name (e.g., `Last active`) OR is marked `aria-hidden="true"` (choose one approach and test it).

### Notes
- To keep tests deterministic, prefer a preformatted label from the view model rather than generating relative time inside the component.

---

### Story: Show Active Status on Game Card

**As a** household member  
**I want** to see whether a game is active  
**So that** I can understand its current state

### Acceptance Criteria (Jest-testable)
- **Given** a game has status `active`  
  **When** the card renders  
  **Then** a visible status pill with text `active` appears within the card.
- **Given** a game has status not `active`  
  **When** the card renders  
  **Then** the `active` status text is not shown.

### Notes
- Additional statuses are not specified by the mock; only presence/absence of `active` is in scope.

---

### Story: Display Player Avatars on Game Card

**As a** household member  
**I want** to see the player avatars for a game  
**So that** I can recognize who is in it

### Acceptance Criteria (Jest-testable)
- **Given** a game has an `avatars` list  
  **When** the card renders  
  **Then** each avatar is displayed (assert count matches `avatars.length` using `getAllByTestId('player-avatar')`).
- **Given** avatars are decorative  
  **Then** each avatar element is either:
  - rendered with `aria-hidden="true"`, **or**
  - rendered with an accessible name including the player display name  
  (choose one approach and test it).

### Notes
- Mock uses emoji-like icons; tests should validate presence/count rather than specific imagery.

---

### Story: Resume a Game from Its Card

**As a** household member  
**I want** to resume a selected game  
**So that** I can continue progress

### Acceptance Criteria (Jest-testable)
- **Given** a game card is rendered  
  **Then** it includes a `Resume` button (queryable by role `button` and name `Resume`).
- **When** I click the `Resume` button for a given game  
  **Then** the app triggers navigation into that game (assert via mocked router navigation with the game id, or `onResume(gameId)` called once with that game’s id).

### Notes
- Prefer injecting `onResume` into the component for unit tests; integration tests can assert router calls.

---

### Story: Delete a Game from Its Card

**As a** household member  
**I want** to delete a game from the hub  
**So that** I can remove games I no longer need

### Acceptance Criteria (Jest-testable)
- **Given** a game card is rendered  
  **Then** it includes a delete control (button or icon-button) with accessible name `Delete` (queryable by role `button` and name).
- **When** I click `Delete` for a game  
  **Then** a delete action is requested for that game (assert `onDelete(gameId)` called once with that id).

### Notes
- Confirmation UI is not shown in the mock; this story only covers initiating delete.

---

### Story: Empty State for No Games

**As a** household member  
**I want** a clear empty state when I have no games  
**So that** I know to create a new one

### Acceptance Criteria (Jest-testable)
- **Given** the games list is empty  
  **When** the Game Hub screen renders  
  **Then** no game cards are displayed (`queryAllByTestId('game-card')` length is `0`).
- **And** the `New Game` button remains visible and enabled.

### Notes
- The mock does not show an empty message; this story intentionally keeps the requirement minimal and testable.

---

### Story: “Your Games” Cards Are Not Clickable Except Actions

**As a** household member  
**I want** clear interaction points  
**So that** I don’t accidentally navigate by clicking non-action areas

### Acceptance Criteria (Jest-testable)
- **Given** a game card is displayed  
  **Then** clicking on the card container (non-button area) does not trigger resume or navigation (assert no `onResume` / `navigate` calls).
- **And** clicking the `Resume` button triggers resume (covered in Resume story).

### Notes
- If product later decides cards should be clickable, replace this story accordingly.

---
