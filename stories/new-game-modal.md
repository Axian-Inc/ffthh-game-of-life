# New Game Modal — Epics, Stories & Acceptance Criteria

> Scope: Stories derived from the provided “New Game” modal mockup only.
> Acceptance criteria are written to be testable with Jest + DOM testing (e.g., @testing-library/react + user-event).

---

## Epic: New Game Modal Shell

> Purpose: Open/close and basic structure of the New Game modal.

### Story: Open New Game Modal

**As a** household member  
**I want** to open the New Game modal  
**So that** I can configure a new game without leaving the hub

#### Acceptance Criteria (Jest-testable)
- **Given** I am on the Game Hub screen  
  **When** I trigger the `New Game` action  
  **Then** a modal dialog is displayed (queryable by role `dialog`).
- **And** the dialog contains a visible title `New Game`.
- **And** the dialog contains a subtitle `Let's get the fun started!`.

---

### Story: Close New Game Modal via Close Button

**As a** household member  
**I want** to close the modal  
**So that** I can return to the previous screen

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** a close control is visible (queryable by role `button` with accessible name `Close` or `Dismiss`).
- **When** I click the close control  
  **Then** the modal is removed from the DOM (`queryByRole('dialog')` returns null).

---

## Epic: Game Name Configuration

> Purpose: Allow the user to provide a game name.

### Story: Enter Game Name

**As a** household member  
**I want** to enter a game name  
**So that** I can identify the game in the Game Hub list

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** a labeled input `Game Name` is visible (queryable by `getByLabelText(/game name/i)`).
- **When** I type into the `Game Name` input  
  **Then** the input value updates to the typed text.
- **And** the current value remains present after adding a player (no reset unless explicitly cleared).

---

## Epic: Player Setup

> Purpose: Add players to the new game, including avatar shuffle and player details inputs.

### Story: View Players Section and Current Count

**As a** household member  
**I want** to see how many players have been added  
**So that** I know whether the game is ready to start

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open with zero added players  
  **Then** the Players section label displays `Players (0)` as visible text.
- **Given** one player has been added  
  **Then** the Players section label updates to `Players (1)`.

---

### Story: Shuffle Player Avatar

**As a** household member  
**I want** to shuffle the suggested avatar  
**So that** I can quickly pick a fun identity

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** an avatar element is visible within the Players section (queryable via `getByTestId('avatar-shuffle')`).
- **And** helper text `Click to shuffle avatar` is visible.
- **When** I click the avatar shuffle element  
  **Then** the displayed avatar changes (assert change in text/alt/testid value).
- **And** the avatar shuffle action does not submit the form.

#### Notes
- Use a stable selector such as `data-testid="avatar-shuffle"` and render avatar as text/alt value so Jest can assert changes.

---

### Story: Enter Player Nickname

**As a** household member  
**I want** to enter a player nickname  
**So that** the player is recognizable in the household game

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** an input with placeholder `Nickname` is visible (queryable by placeholder or label).
- **When** I type into the Nickname input  
  **Then** the input value updates to the typed text.

---

### Story: Enter Player Email

**As a** household member  
**I want** to enter a player email  
**So that** the player can be invited or associated to an account

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** an input with placeholder `Email` is visible.
- **When** I type into the Email input  
  **Then** the input value updates to the typed text.

---

### Story: Add Player to the New Game

**As a** household member  
**I want** to add a player  
**So that** the game can include participants before starting

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** an `Add Player` button is visible (queryable by role `button` and name `Add Player`).
- **When** I click `Add Player` with a non-empty Nickname and Email  
  **Then** the player is added to the players list (assert list item appears with nickname/email).
- **And** the Players count increments by 1.
- **And** the Nickname and Email inputs are cleared after successful add.
- **And** the avatar selection for the next player resets or remains per product decision (choose one behavior; test it).

#### Notes
- The mock does not show a rendered players list; include a minimal list for testability (e.g., `data-testid="player-list"`).

---

## Epic: Start Game Action

> Purpose: Gate and trigger the start action based on number of players.

### Story: Disable Start When No Players Added

**As a** household member  
**I want** to be prevented from starting without players  
**So that** I don’t create an unusable game

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open with 0 players  
  **Then** helper text `Add at least one player to start` is visible.
- **And** the primary start button displays text `Start Game with 0 Players`.
- **And** the start button is disabled (`toBeDisabled()`).
- **When** I click the disabled start button  
  **Then** no start action is fired (assert callback not called).

---

### Story: Enable Start When At Least One Player Added

**As a** household member  
**I want** to start the game after adding players  
**So that** the new game is created and ready to play

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal has at least 1 added player  
  **Then** the primary start button is enabled.
- **And** the button text reflects the current count (e.g., `Start Game with 1 Player` or `Start Game with 1 Players`—choose one convention and test it).
- **When** I click the enabled start button  
  **Then** a start action is triggered (assert `onStartGame(payload)` called once).
- **And** the payload includes:
  - `gameName` (string)
  - `players` (array with nickname/email/avatar)

#### Notes
- To keep tests deterministic, treat the button label as derived from state rather than hard-coded.

---

## Epic: Validation & Error Messaging (UI-only)

> Purpose: Ensure invalid player input is handled with visible feedback.

### Story: Prevent Adding Player with Missing Nickname

**As a** household member  
**I want** feedback when required fields are missing  
**So that** I can correct mistakes before adding a player

#### Acceptance Criteria (Jest-testable)
- **Given** Email is filled and Nickname is empty  
  **When** I click `Add Player`  
  **Then** an inline error message for Nickname is displayed (queryable by text, e.g., `Nickname is required`).
- **And** no player is added to the list.
- **And** the Players count does not change.

---

### Story: Prevent Adding Player with Missing Email

**As a** household member  
**I want** feedback when required fields are missing  
**So that** I can correct mistakes before adding a player

#### Acceptance Criteria (Jest-testable)
- **Given** Nickname is filled and Email is empty  
  **When** I click `Add Player`  
  **Then** an inline error message for Email is displayed (e.g., `Email is required`).
- **And** no player is added to the list.
- **And** the Players count does not change.

---

### Story: Prevent Adding Player with Invalid Email Format

**As a** household member  
**I want** feedback when an email is invalid  
**So that** I can enter a usable email address

#### Acceptance Criteria (Jest-testable)
- **Given** Nickname is filled and Email is `not-an-email`  
  **When** I click `Add Player`  
  **Then** an inline error message for Email is displayed (e.g., `Enter a valid email`).
- **And** no player is added.

#### Notes
- Email format rule can be minimal; tests should assert the chosen rule consistently.

---

## Epic: Accessibility & Focus Management

> Purpose: Ensure the modal is usable via keyboard and assistive tech.

### Story: Modal Has Accessible Role and Name

**As a** household member  
**I want** the modal to be accessible  
**So that** I can use it with assistive technology

#### Acceptance Criteria (Jest-testable)
- **Given** the New Game modal is open  
  **Then** it renders with role `dialog`.
- **And** it has an accessible name that includes `New Game` (assert `getByRole('dialog', { name: /new game/i })`).

---

### Story: Focus Starts Inside the Modal

**As a** keyboard user  
**I want** focus to move into the modal when it opens  
**So that** I can interact without using a mouse

#### Acceptance Criteria (Jest-testable)
- **Given** the modal is opened  
  **Then** focus is set to the first interactive field in the modal (e.g., `Game Name` input) OR the dialog container (choose one behavior; test it with `expect(document.activeElement)...`).

---

