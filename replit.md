# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Kreato (`artifacts/kreato`)
- Next.js 14 App Router
- Supabase authentication (`@supabase/ssr`)
- Tailwind CSS v3
- Pages: `/` (landing), `/login`, `/signup`, `/dashboard` (protected)
- Running on port 3000
- Environment: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (placeholders in `.env.local`)

### API Server (`artifacts/api-server`)
- Express 5 backend
- Running on port 8080 at `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/kreato run dev` — run Kreato Next.js app locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
