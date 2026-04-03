
  # Add Persistent Game Storage

  ## Summary

  Add persistent storage for games so the UI can retain games across browser sessions in local development and use an AWS-backed API in deployed environments. Keep the home and game-management flows unchanged at the UI level by routing all persistence through a
  single storage adapter and a dedicated React hook.

  ## Key Changes

  ### UI storage adapter

  - Add a storage service in src/ui/src/services/gameStorage.js that exposes listGames, createGame, updateGame, and deleteGame.
  - Normalize all game ids to strings before returning data to the UI.
  - Use local storage by default.
  - Switch to API mode when VITE_API_BASE_URL is present or when VITE_STORAGE_MODE is explicitly set to api or cloud.
  - If API mode is selected but the base URL is missing, fall back to local storage rather than failing.
  - Store local data under a single key, ffthh-game-of-life.games.
  - Seed local storage from src/ui/src/data/seedGames.js when there is no usable saved game array, including the case where the stored array is empty.
  - Expose lightweight debug helpers for the current storage mode and stored-game snapshot.

  ### UI state integration

  - Add a useGames hook in src/ui/src/hooks/useGames.js to:
      - load games on mount
      - track games, isLoading, and fetchError
      - create, update, and delete persisted games
      - expose loadGames for reload behavior
      - track newGameId and setNewGameId for post-create focus behavior
  - Update src/ui/src/App.jsx to use the hook instead of in-memory-only game data.
  - Preserve existing list behavior:
      - successful creates prepend the new game
      - successful deletes remove the game immediately from UI state
      - successful updates replace the matching game in UI state
      - load failures show the existing user-facing fetch error

  ### API and persistence backend

  - Add a Lambda handler in src/api/index.js for four routes:
      - GET /games
      - POST /games
      - PUT /games/{id}
      - DELETE /games/{id}
  - Keep the API contract simple:
      - request bodies use { game: ... }
      - list responses use { games: [...] }
      - create and update responses use { game: ... }
  - Store each game as a full DynamoDB document keyed by id.
  - Generate a UUID server-side on create if the incoming game has no id.
  - Implement list with DynamoDB scan.
  - Implement create and update with full-document put, not partial patch semantics.
  - Return permissive CORS headers for browser access.
  - Do not add auth, per-user scoping, or GET /games/{id} in this slice.

  ### Terraform and deploy wiring

  - Provision DynamoDB, Lambda, HTTP API Gateway, and IAM resources in Terraform.
  - Keep all resource names unique per workspace by including terraform.workspace in the shared locals used for naming.
  - Output api_base_url from Terraform for use by the UI build.
  - Update deploy automation to:
      - install API dependencies before packaging Lambda
      - install UI dependencies
      - run UI unit tests before deploy
      - reject deploys from the Terraform default workspace
      - apply Terraform
      - build the UI with VITE_API_BASE_URL set from Terraform output
  - Keep the existing S3 and CloudFront deployment flow unchanged aside from the new API URL injection.

  ## Public Interfaces and Config

  - UI storage adapter:
      - listGames(): Promise<Game[]>
      - createGame(game): Promise<Game>
      - updateGame(gameId, updates): Promise<Game>
      - deleteGame(gameId): Promise<void>
  - UI hook surface:
      - games
      - isLoading
      - fetchError
      - loadGames
      - createGame
      - updateGame
      - deleteGame
      - newGameId
      - setNewGameId
  - Environment/config:
      - VITE_API_BASE_URL
      - ffthh-game-of-life.games
  ## Test Plan

  - Verify local mode seeds sample games on first load and reuses saved data afterward.
  - Verify an empty stored local array is treated as uninitialized and reseeded.
  - Verify create, update, and delete operations persist correctly in local mode.
  - Verify API mode calls the configured /games endpoints and returns normalized string ids.
  - Verify API mode falls back to local storage when explicitly selected without a configured base URL.
  - Verify load failures produce the existing fetch error state in the hook/UI.
  - Verify deploy flow still runs UI tests before Terraform apply and blocks the Terraform default workspace.
  - Verify Terraform exposes api_base_url and that resource names remain workspace-scoped.

  ## Assumptions and Defaults

  - Game records are stored and transported as opaque full JSON documents; no partial-update or validation-heavy domain layer is added.
  - Local storage is the default developer experience.
  - Seed data exists only for local mode bootstrapping.
  - The API is intentionally minimal and unauthenticated in this version.