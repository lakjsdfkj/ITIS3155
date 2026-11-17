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
cp .env.example .env
pnpm install
pnpm dev
```

In PowerShell, copy the template with `Copy-Item .env.example .env`.
The local environment file only configures development server ports. It does
not contain credentials; do not put production secrets in this file.

## Production build

```sh
pnpm build
pnpm preview
```

Run the automated API and pathway tests with:

```sh
pnpm test
```

The news feed, opportunities, and skill library use local sample data. Student
profile interests load from and save to the local development database; the
pathway view combines curated steps for all selected interests. Other account
actions remain demo interactions.

## [ADDED] Local development database

The development database is a SQLite file at `prisma/dev.db`. It is local-only,
ignored by Git, and must not contain production data. The Express API listens
on `127.0.0.1:3001`; Vite proxies `/api` requests to it.

The development database is SQLite so contributors can run and verify the
project without installing or sharing a separate database service. It is
intended for fictional local development data only, not production use.

```sh
pnpm db:generate
pnpm db:setup
pnpm dev
```

`pnpm db:setup` applies the checked-in Prisma migration and loads repeatable,
fictional development records based on the app's local sample data. Verify the
API-to-database connection at `http://localhost:8443/api/health/db`; sample
opportunities are available at `http://localhost:8443/api/opportunities`.

The API also reads and updates the seeded demo profile's interests. Health and
opportunity endpoints remain read-only. Authentication, uploads, and production
database configuration are not included. See
[Issue #3 verification](docs/issue-3-verification.md) for the field-to-pathway
mapping and test results.

## [ADDED] Vitest database tests

Run `pnpm test:vitest` to apply pending development migrations and execute the
Vitest/Prisma integration tests. They verify profile creation, multiple student
fields of interest, and rejection of an invalid interest relation. Tests use
temporary records and clean them afterward. Use `pnpm test:vitest:watch` for
watch mode. The existing `pnpm test` continues to run the Node test suite.
