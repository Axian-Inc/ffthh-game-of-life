# Game Hub – Additional Development Stories (14+)

---

## Story 14 — Backend Persistence Architecture for Games
**As a** system  
**I want** games to be stored in backend storage  
**So that** users can retrieve and resume games across sessions and devices.

### Acceptance Criteria
- A backend persistence layer exists for storing game entities.
- Game data model includes at minimum:
  - Game ID (unique identifier)
  - Game name
  - Status (e.g., new, active, completed)
  - Created timestamp
  - Last updated timestamp
  - List of players
  - Current turn state
  - Game metadata (extensible field)
- Games are stored in a persistent database (SQL or NoSQL per architecture decision).
- Each game record is associated with a user or household identifier.
- All writes are transactional (atomic save of full game state).
- Backend validates required fields before saving.
- Data is retrievable by Game ID.
- Data is retrievable by User ID (list of games).
- Backend returns appropriate HTTP status codes for success and failure.
- Sensitive fields are not exposed unnecessarily in API responses.

---

## Story 15 — Create Game API Endpoint
**As a** client application  
**I want** to create a new game via API  
**So that** it is stored persistently and available for retrieval.

### Acceptance Criteria
- A POST /games endpoint exists.
- Request body validates:
  - Game name (required)
  - Player list (minimum 1 player required)
- On successful creation:
  - Backend generates a unique Game ID.
  - Game status defaults to “new”.
  - Response returns the full persisted game object.
- On validation failure:
  - Returns 400 with structured error message.
- On server error:
  - Returns 500 with error correlation ID.

---

## Story 16 — Update Game State API Endpoint
**As a** client application  
**I want** to update game state  
**So that** turns and player decisions are persisted.

### Acceptance Criteria
- A PUT /games/{id} endpoint exists.
- Endpoint validates:
  - Game exists.
  - Requesting user has permission.
- Partial updates are supported OR full replacement is defined (must follow chosen strategy consistently).
- Concurrency strategy implemented (e.g., optimistic locking with version field).
- If version conflict occurs, backend returns 409 Conflict.
- Successful updates modify lastUpdated timestamp.

---

## Story 17 — Delete Game API Endpoint
**As a** client application  
**I want** to delete a stored game  
**So that** unused games are removed permanently.

### Acceptance Criteria
- A DELETE /games/{id} endpoint exists.
- Deletion verifies ownership/authorization.
- Soft delete OR hard delete strategy is defined and documented.
- After deletion:
  - Game no longer appears in list endpoint.
- If game does not exist:
  - Returns 404.

---

# Testing Strategy Stories

---

## Story 18 — Unit Testing Strategy (Backend)
**As a** development team  
**I want** a strong unit testing strategy  
**So that** business logic is reliable and maintainable.

### Acceptance Criteria
- Unit tests cover:
  - Game creation logic
  - Validation rules
  - State transitions
  - Concurrency/version handling
- All service-layer logic is tested independently from controllers.
- Database interactions are mocked in unit tests.
- Minimum code coverage threshold defined (e.g., 80%+).
- Edge cases covered:
  - Invalid input
  - Missing required fields
  - Unauthorized access
  - Version conflicts
- CI pipeline fails if coverage threshold is not met.

---

## Story 19 — Unit Testing Strategy (Frontend)
**As a** frontend team  
**I want** component-level tests  
**So that** UI logic behaves predictably.

### Acceptance Criteria
- Components tested in isolation (e.g., GameCard, NewGameButton).
- Mock API responses used for testing loading, success, and error states.
- Tests validate:
  - Conditional rendering
  - Button click behavior
  - Disabled states
  - Empty states
- Snapshot tests used selectively (not excessively).
- Tests are deterministic and do not rely on real network calls.

---

## Story 20 — UI Automation Strategy (End-to-End)
**As a** QA team  
**I want** reliable UI automation  
**So that** critical user flows are validated continuously.

### Acceptance Criteria
- End-to-end automation tool selected (e.g., Playwright, Cypress, Appium).
- Critical paths automated:
  - Create new game
  - Pick career paths
  - Resume game
  - Delete game
- Tests run in CI on pull request.
- Test data is seeded programmatically.
- Tests are idempotent and clean up after execution.
- Automation avoids brittle selectors (use data-test-id attributes).
- Failures produce screenshots and logs.

---

# Start New Game Flow

---

## Story 21 — Start New Game Screen Layout
**As a** user  
**I want** a dedicated Start New Game screen  
**So that** players can choose their career paths before gameplay begins.

### Acceptance Criteria
- After creating a new game, user is automatically routed to Start New Game screen.
- Screen displays:
  - Game name at top
  - Instruction text (e.g., “Each player must choose a career path.”)
  - List of players
  - Career selection options per player
  - Continue/Start Game button (disabled initially)
- Layout supports vertical scrolling if needed.

---

## Story 22 — Career Path Selection Per Player
**As a** player  
**I want** to select a career path  
**So that** my character is initialized correctly.

Career options are "College" and "Trades", but the code should support more options in the future.

### Acceptance Criteria
- Each player has a visible selection area.
- Career options are selectable cards or buttons.
- Only one career may be selected per player.
- Selected state is visually distinct.
- Selection is required for all players before continuing.
- Career selections are stored locally until submission.

---

## Story 23 — Start Game Button Enablement Logic
**As a** user  
**I want** the Start Game button enabled only when setup is complete  
**So that** no player is skipped.

### Acceptance Criteria
- Start Game button is disabled by default.
- Button becomes enabled only when:
  - Every player has selected a career.
- If a player deselects a career, button becomes disabled again.
- Pressing Start Game persists selections to backend.

---

## Story 24 — Persist Career Selections
**As a** system  
**I want** career selections saved  
**So that** gameplay begins with correct player configuration.

### Acceptance Criteria
- Career selections are sent via API to update game state.
- Backend validates:
  - All players have a career.
  - No duplicate restricted roles (if applicable).
- On success:
  - Game status transitions from “new” to “active”.
  - User is navigated to first turn screen.
- On failure:
  - Error message displayed.
  - User remains on setup screen.

---

## Story 25 — Start New Game Loading & Error States
**As a** user  
**I want** clear feedback during setup  
**So that** I understand what is happening.

### Acceptance Criteria
- While saving career selections:
  - Show loading indicator on Start Game button.
- Prevent duplicate submissions.
- If API call fails:
  - Show inline error message.
  - Allow retry.
- Screen state remains intact after failure.

---

## Story 26 — Accessibility & Validation for Career Selection
**As a** user with accessibility needs  
**I want** career selection to be accessible  
**So that** I can participate fully.

### Acceptance Criteria
- Career options are keyboard navigable.
- Selected state is conveyed via screen reader.
- Error messaging is announced properly.
- Color is not the only indicator of selection.
- Screen works across mobile and desktop breakpoints.

---

# End of Stories (14–26)
