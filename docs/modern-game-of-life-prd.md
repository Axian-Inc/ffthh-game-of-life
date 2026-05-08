# Modern Game of Life (Family Edition) - Product Requirements Document

## 1. Document Header
1.1 Title: Modern Game of Life (Family Edition) - Product Requirements Document.

1.2 Version: v0.1.

1.3 Date: February 27, 2026.

1.4 Owner: Product Management.

1.5 Status: Draft.

1.6 Purpose: This document defines the v1 product requirements for a digital family life-simulation game and is intended to be decision-ready for implementation planning.

1.7 Intended audience: PM, Design, Engineering, and QA.

1.8 Thesis: The game must teach and reinforce that in life, there is "no free "lunch, meaning every decision has benefits, costs, risks, delayed effects, and cumulative consequences.

1.9 Related UI guidance for the Game of Life home screen and new game modal is documented at `./docs/game-of-life-style-guide.md`.

## 2. Product Vision and Objectives
2.1 The product must provide a modern, family-friendly, turn-based life simulation inspired by familiar life-path board games without copying protected branding or packaging.

2.2 The game must teach children practical tradeoff thinking through concrete, repeated choices across money, physical, and emothional health. When in doubt as to whether a feature should be implemented (or how), ask "What are we trying to teach children ages 6-18?".

2.3 The experience should remind children that compounding effects, especially debt and neglected health, can materially change outcomes over time.

2.4 The game must frame setbacks as recoverable and should avoid shame-based or moral framing.

2.5 The product may include light randomness, but it must always preserve player agency through meaningful choices.

## 3. Target Users and Session Model
3.1 The primary audience must be children ages 6-18.

3.2 The secondary audience should be parents or caregivers who play and discuss outcomes with children.

3.3 v1 must support 2-6 players in a shared game (pass control) to be played on a computer (laptop/desktop).

3.4 The product must support weekly family sessions with save and resume capability.

3.5 A typical session should last as long as a family can stay focused together. Each "turn" should take no more than 1-2min per player.

3.6 First-time players must be able to understand the core loop within 10 minutes of onboarding.

## 4. Core Gameplay Loop
4.1 One turn must represent one in-game month for one player.

4.2 A life doesn't end, but the game can be paused and resumed between turns.

4.3 The turn sequence must execute in this order: Net Worth Changes (Income, Recurring Costs, Debt Updates, Asset Updates), Physical Health and Mental Updates, Event Resolution, Player Actions, End-of-Turn Summary.

4.4 Each player must receive up to one actions per turn (Relocate, change jobs, join a sports team, go to a concert, look for love?)

4.5 Unused actions do not carry over to future turns.

4.6 The game must rotate turns by fixed seat order determined at game start.

4.7 The game state must persist state after each completed player turn.

4.8 Random outcomes must include an explanation of base chance and active modifiers (how likely was this to happen, what about your life decisions did/didn't make this more/less likely).

## 5. Simulation Requirements
5.1 Net worth must be calculated as cash plus investments plus home equity minus total debt.

5.2 Monthly income must come from career rules and may include deterministic and probabilistic components.

5.3 Recurring expenses must include housing, utilities, food, transport, taxes, and optional commitments.

5.4 Debt must accrue monthly interest and require a minimum payment when debt is outstanding.

5.5 Missed debt minimums must trigger penalty effects and increased adverse-risk pressure.

5.6 Home ownership must include expected maintenance and unexpected repair risk.

5.7 House value and investment value should evolve monthly within bounded volatility.

5.8 v1 investment products must include stocks and bonds with distinct risk and return profiles.

5.9 Debt can spiral when debt-to-income gets out of control. Players can declare bankrupcy with related consequences (bankrupcy to be implemented/refined later.).

5.10 Bankruptcy must not eliminate a player and must trigger a temporary recovery mode with stricter constraints for a fixed period.

5.11 Physical Health must be represented on a 0-100 scale.

5.12 Mental Health must be represented on a 0-100 scale.

5.14 Health scores must change weekly using baseline drift, actions, events, city modifiers, and financial stress effects.

5.15 Mental Health or Physical Health below 40 should create risks of "bad events" happening which could stop someone from working or participating in other activities (e.g. relational activities, physical activities, not able to relocate).

5.16 The game must include life-stage events/progressions which are reasonable and contextual (e.g. being older carries physical health challenges, owning a house creates housing maintenance risks, owning stocks creates exposure, being married has mental health benefits and mutes the effect of certain events [like getting sick], having kids is a bit of a "J curve" in that it has a cost early on [financial, mental, physical] but pays dividens later).

## 6. Action System Requirements
6.1 v1 action catalog must include at minimum: Study or School, Job Training, Invest in Stocks, Invest in Bonds, Join Gym, Join Sports Team, Spend Time with Family or Friends, Buy Smartphone, Relocate City, Look for Love, Buy Home, Home Maintenance, Debt Paydown, Side Gig, and Career Switch.

6.2 Every action must define upfront cost, recurring cost and duration if applicable, immediate effects, delayed effects, risk profile, and prerequisite checks. Some actions can't be repeated until a "cool down" has happened.

6.4 Study or School must improve medium-term professional prospects while imposing near-term financial burden.

6.5 Relocate City must change cost-of-living, taxes, and wellbeing modifiers from the following turn. Relocating also means no income for a short period (and moving expenses!).

6.6 Look for Love must include probabilistic outcomes affecting Mental Health (positive or negative!), with optional financial side effects.

6.7 Career Switch must include a transition cost and temporary earning disruption.

6.8 Action selection must preview expected value ranges rather than exact outcomes.

6.9 Turn logs must separate intended outcomes from unintended outcomes.

## 7. Career and City Systems
7.1 Players must select a starting career during setup and may revisit career choice using explicit actions.

7.2 Careers must define at least: id, label, start cash, start debt, weekly income model, stability level, risk modifiers, and switch cost.

7.3 v1 careers must include Degree Track (high debt, great prospects), Trades Track (low debt, good prospects), or Street Smart.

7.4 Cities must define at least: id, label, cost-of-living multiplier, tax rate, opportunity multiplier, mental baseline modifier, and physical baseline modifier.

7.5 v1 cities must include at least one high-cost high-opportunity city, one balanced city, and one lower-cost lower-opportunity city. Cities should be based on well known US cities with mix of dense urban and sparse rural environments.

7.6 Relocation must require an upfront move cost and must apply new city effects from the next turn.

7.7 Career and city modifiers should combine multiplicatively where appropriate and must be shown transparently in the UI.

## 8. Outcomes and Reflection
8.1 v1 must not require a single mandatory winner or loser.

8.2 End-of-session reporting must show a timeline of major decisions, major events, and metric changes (Financial, Physical, Mental health).

8.3 Session summary must include at least three auto-generated cause-effect callouts.

8.4 Players must be able to review longitudinal trends for Net Worth, Debt, Physical Health, Mental Health.

8.5 Reflection content should emphasize adaptation and next-step choices rather than judgment.

## 9. Important Public Interfaces and Types (Future Implementation Contract)
9.1 `GameState` must include game metadata, campaign progression, active player index, random seed, modifier context(s), full player state collection, and a reviewable turn/action log. The current UI prototype may persist that log as a game-level move-history collection until the richer player-state model lands.

9.2 `PlayerState` must include id, name, avatar, age, careerId, cityId, cash, debts collection, assets collection, netWorth, physicalHealth, mentalHealth, statusEffects collection, and actionHistory collection. Player-facing history views may be derived from either persisted per-player history or a normalized shared move log so long as the visible result is scoped correctly to the selected player.

9.3 `CareerDefinition` must include id, label, startCash, startDebt, incomeModel, riskModifiers, and switchCost.

9.4 `CityDefinition` must include id, label, costOfLivingMultiplier, taxRate, opportunityMultiplier, mentalBaseline, and physicalBaseline.

9.5 `ActionDefinition` and `ActionExecutionResult` must support previewable impacts and resolved outcomes with intended and unintended effect records.

9.6 `LifeEvent` must include weighted eligibility rules, effect payloads, and explanation metadata.

9.7 `TurnResolution` must include pre-turn snapshot, phase-by-phase deltas, explanation strings, and post-turn snapshot.

9.8 Future API surface must include `GET /games/{id}`, `POST /games/{id}/actions`, `POST /games/{id}/turns/advance`, and `GET /games/{id}/summary`.

9.9 Randomness must be seed-based per game for deterministic replay in test scenarios.

## 10. Testing and Acceptance Scenarios
10.1 The product must validate net-worth calculation correctness for positive and negative asset-debt combinations.

10.2 The product must validate debt compounding and missed-payment penalty behavior against configured rules.

10.3 The product must validate health crisis triggers and time-off-work penalties at threshold boundaries.

10.4 The product must validate recovery behavior when players repeatedly choose health and relationship repair actions.

10.5 The product must validate city relocation effects, including delayed activation timing.

10.6 The product must validate career-switch transition costs and temporary earnings disruption.

10.7 The product must validate deterministic randomness when the same seed and action sequence are replayed.

10.8 The product must validate that turn summaries include traceable explanations for major metric changes.

10.9 The product must validate multiplayer turn rotation consistency and save-resume continuity.

10.10 The product must validate campaign completion and reflection flow without forcing a win-state ranking.

## 11. Delivery Planning
Implementation sequencing is managed through the normal product backlog and release planning process. Until a separate backlog exists, use this section as the implementation handoff for agents.

### 11.1 Implemented in the current repository
1. The web UI supports local and AWS-backed game persistence.
2. The new-game setup flow captures game name, 2-6 players, avatar, city, education track, and career selection.
3. Starting a game persists an active game with `turnNumber`, `activePlayerIndex`, players, and an empty `moveHistory`.
4. New and resumed games enter the welcome screen before the player-turn screen.
5. The player-turn screen shows the persisted turn number and active player name, renders all players in seat order, and highlights the active player.
6. `Choose Action` and `Pass` currently behave as light turn actions: they record a move-history entry, save the updated game, rotate to the next player, and increment the turn number after the last player acts.
7. `See History` opens a modal scoped to the active player and lists only that player's saved moves.
8. New games initialize each player with basic persisted financial state from their education/job/city choices: cash, education debt, monthly income, monthly expenses, assets, and net worth.
9. Completing a current light turn action applies one deterministic monthly money update: income is added, living costs are subtracted, net worth is recalculated, and the money delta is saved on the move-history entry.

### 11.2 Current limitations
1. The player-turn financial, job, and location values now come from persisted state/catalog definitions, but health and modifier values remain shallow defaults until the fuller simulation lands.
2. Setup selections initialize the money-related parts of the PRD `PlayerState` contract, but they do not yet initialize the full career, city, health, status-effect, or action-history model from section 9.2.
3. Career/city options exist as UI catalog data, and money rules exist as a finance catalog, but there are not yet full canonical simulation definitions matching sections 7.2 and 7.4.
4. The monthly turn sequence from section 4.3 is only partially implemented. Basic income and living costs run, but debt interest/minimum payments, asset updates, health drift, events, action resolution, and end-of-turn summaries are not complete.
5. `Choose Action` does not yet open an action catalog or resolve intended/unintended outcomes beyond the same basic monthly money update used by `Pass`.

### 11.3 Next implementation slice
The next agent should implement the minimum real simulation foundation before building the full action picker.

Goal: when a new game starts, initialize each player with canonical persisted financial and health state; when a player passes, resolve one no-action monthly turn using deterministic rules, save the phase deltas, and advance the turn.

Recommended scope:
1. Add canonical career and city definition data with ids, labels, starting cash/debt, income, cost/tax/opportunity/health modifiers, and switch/move metadata needed by sections 7.2-7.5.
2. Expand created players into persisted `PlayerState` fields from section 9.2: `age`, `careerId`, `cityId`, `cash`, `debts`, `assets`, `netWorth`, `physicalHealth`, `mentalHealth`, `statusEffects`, and `actionHistory`.
3. Add a small turn-resolution module that applies the no-action version of section 4.3 in order: income/recurring costs/debt interest/minimum payments, basic health drift/stress effects, no event yet or an explicit empty event phase, no player action for `Pass`, and an end-of-turn summary.
4. Store a reviewable turn log entry with the pre-turn snapshot, phase deltas, explanation strings, post-turn snapshot, action type, player id, player name, and turn number.
5. Update the player-turn screen to read financial, job, health, and location values from persisted player state instead of `PLAY_TURN_PLACEHOLDER` values.
6. Keep `Choose Action` as the existing saved light action or temporarily disable it with clear copy until the action catalog is implemented; do not build a large action system before the turn-resolution foundation exists.
7. Add tests for player-state initialization, no-action turn resolution, net-worth calculation, turn rotation, and save/resume continuity.

Suggested first files to inspect or modify: `src/ui/src/App.jsx`, `src/ui/src/services/gameStorage.js`, `src/ui/src/components/pages/PlayGamePage.jsx`, `src/ui/src/data/wizardVisualCatalog.js`, `src/ui/src/test/testUtils.js`, and the UI test suites under `src/ui/src/components/__tests__/` and `src/ui/src/services/__tests__/`.

Verification commands: `npm --prefix src/ui run test:ci` and `npm --prefix src/ui run build`.

### 11.4 Later slices after the foundation
1. Implement the action catalog and action preview UI from section 6.
2. Add deterministic seeded randomness for events and probabilistic action outcomes.
3. Add richer life-event eligibility, explanation metadata, and cause-effect summaries.
4. Implement longitudinal trends and end-of-session reflection views.

## 12. Assumptions and Defaults
12.1 Platform default is a digital web implementation with cloud persistence.

12.2 v1 defaults must be 2-6 players, each player picks a location (US City), profession (pick from the Track [School, Trades, Street-Trained]) which affects starting money.

12.3 Advisor personas for wealth, physical health, and mental health are deferred beyond v1 but should remain enabled by retained event and action history data.

12.4 Financial and health values in this product are gameplay abstractions and must not be presented as professional financial, legal, medical, or mental-health advice.

## 13. Future Features (Not Currently implmented)
13.1 Assets - Assets like home, cars, can be turned into cash, but require an action and with cost (e.g. depreciation, cost of sale). Hard assets can't be turned into cash without a penalty. TBD.

13.2 Taxes - Are happening all the time. Your city, wage, and other decisions affect taxes. TBD.

13.3 Expenses - Costs change based on where you live and how big you family is. TBD.

13.4 Bankrupcy - When debt to income ratio is out of control, players may declare bankrupcy (lose assets, reset debt). TBD.

13.5 Advisors - To help with the learning, Advisors from various perspectives (e.g. Finance, Physical health, Mental health) weigh in on how to improve a facet of a player's life, and praise favorable actions/decisions. TBD.

13.6 Economy - The economy is constantly changing. It can affect jobs (layoffs, wage reductions), limit wage and asset growth. The Economy is cyclical and affects player options/actions. TBD.

13.7 Investing - Some assets grow faster than others. Some are more volitile. All need to be converted to cash to be used. TBD.

13.8 Housing - Players can live in a house (goes up in value) but are exposed to unexpected costs and debt. TBD.

13.9 Families - When conditions are met a family can start. It increases the cost of some actions (e.g. Vacations), and of regular expenses. Families have a Mental Health benefit?. TBD.
