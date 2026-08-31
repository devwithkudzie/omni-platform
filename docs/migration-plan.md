# Migration Plan

## Phase 1: Scaffold

- Create isolated monorepo folder.
- Add Next.js frontend shell.
- Add PHP API shell.
- Define API contract and environment variables.

## Phase 2: Frontend Parity

- Migrate layout, navigation, footer, and design tokens.
- Migrate homepage.
- Migrate public marketing pages route by route.
- Migrate Lead Scout Assessment into its own feature module.
- Replace direct fetch calls with the frontend API client.

## Phase 3: Backend Organization

- Move PHP endpoints into route/controller/service structure.
- Normalize JSON responses.
- Centralize CORS, config, validation, and error handling.
- Keep legacy endpoint compatibility where needed.

## Phase 4: Integration

- Connect Next.js frontend to PHP API through `NEXT_PUBLIC_API_BASE_URL`.
- Test API contracts using docs examples.
- Compare old and new pages visually.

## Phase 5: Cutover

- Deploy new frontend separately.
- Deploy backend API separately.
- Switch domains only after parity and content verification.

