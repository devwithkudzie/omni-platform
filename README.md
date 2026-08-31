# OmniContact Platform Monorepo

This folder is a safe migration workspace for the future OmniContact platform.
It does not replace or modify the current working Vite/PHP project.

## Structure

```txt
omni-platform/
  frontend/   Next.js + Tailwind application
  backend/    PHP JSON API
  docs/       API contracts, migration notes, deployment notes
```

## Design Goal

The frontend communicates with the backend only through a stable API client and documented
JSON contracts. That means the backend can later move from PHP to another stack without
rewriting page components.

## Local Workflow

Install dependencies only when ready to test this new workspace:

```bash
npm install
npm run dev
```

The current production project remains in the repository root.

