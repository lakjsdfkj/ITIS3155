# SkillSync

SkillSync is a React application that connects students' skills with employer
projects, learning resources, and career pathways.

## Stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4

## Development

Requires Node.js 22 and pnpm 10.34.3.

```sh
pnpm install
pnpm dev
```

## Production build

```sh
pnpm build
pnpm preview
```

The current UI uses local sample data. Search, filters, project details, skill
handbook navigation, and profile editing run in the browser; saving and other
account actions are demo interactions and are not connected to a backend.

## [ADDED] Local development database

The development database is a SQLite file at `prisma/dev.db`. It is local-only,
ignored by Git, and must not contain production data. The Express API listens
on `127.0.0.1:3001`; Vite proxies `/api` requests to it.

```sh
pnpm install
pnpm db:generate
pnpm db:setup
pnpm dev
```

`pnpm db:setup` applies the checked-in Prisma migration and loads repeatable,
fictional development records based on the app's local sample data. Verify the
API-to-database connection at `http://localhost:8443/api/health/db`; sample
opportunities are available at `http://localhost:8443/api/opportunities`.

The API currently provides read-only health and opportunity endpoints. The
React UI still uses its existing local demo data; authentication, writes, and
production database configuration are not included.
