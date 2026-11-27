# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep API access in the shared frontend client and keep route-level views focused on rendering. Each capability must expose loading, meaningful empty, and accessible error states.
- Logic tier decision: Keep request validation and capability behavior in Express routes/services. Return deliberate 4xx responses for invalid input or missing records; do not expose database cast errors as 5xx responses.
- Data tier decision: Use Mongoose models as the source of required-field and relationship constraints. Keep seed data repeatable and non-destructive to unrelated records.
- Activity tracking approach: Accept only user ID, team ID, activity type, and minutes from the client. Validate both IDs and their records, then compute points and the occurrence date on the server.
- Team management approach: Require a name, preserve the submitted name and mascot, and persist member references without replacing or disturbing unrelated teams.
- Leaderboard approach: Aggregate activity points per team, sort by total points descending, and assign ranks starting at 1.
- Workout suggestions approach: Find the user by email, use their goal and recent activity to choose matching workouts, and include a reason for each suggestion. Return a deliberate 4xx response when no user matches.

## Test plan

Run the focused contract tests in tier order, then build both applications:

1. `npm run test:data --prefix octofit-tracker/backend` — model validation, relationships, and repeatable seed behavior; failures indicate a data-tier contract or persistence issue.
2. `npm run test:api --prefix octofit-tracker/backend` — request validation and API responses for activities, teams, leaderboard, and workout suggestions; failures indicate a logic-tier contract issue.
3. `npm test --prefix octofit-tracker/frontend` — API rendering and loading, empty, and accessible error states; failures indicate a presentation-tier integration or UX issue.
4. `npm run build --prefix octofit-tracker/backend` — backend TypeScript type-check; failures indicate a backend compile/type error.
5. `npm run build --prefix octofit-tracker/frontend` — frontend type-check and Vite production build; failures indicate a frontend compile or bundling error.

Baseline from the last contract-test run: data tests had 4 failures and 1 pass; API tests had 4 failures; frontend tests had 15 failures. These are pre-implementation failures, not evidence that the planned changes pass.
