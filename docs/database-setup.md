# Development Database Verification

**Environment:** Local development only - SQLite at `prisma/dev.db`
**Verified:** November 15, 2026

## Database choice

SQLite keeps the development setup self-contained: each contributor can apply
the checked-in migration and use fictional seed data without provisioning or
sharing a database server. This is a local development choice, not a production
hosting recommendation; production storage and credentials are outside this
sprint's scope.

## Connection test

Started the Express API and Vite development server, then requested:

- `GET http://localhost:8443/api/health/db`
- `GET http://localhost:8443/api/opportunities`
- `GET http://localhost:8443/api/profile/interests`
- `PUT http://localhost:8443/api/profile/interests` with one or more valid
  interests

Vite proxied the requests to the local Express API, which queried SQLite through
Prisma.

## Result

- Database health returned `status: ok` and `database: connected`.
- Six seeded development opportunities were returned.
- Opportunity results included related company and skill data (five skills on
  the first opportunity).
- Profile interest selections were saved and reloaded through the API across
  all 31 non-empty combinations against the local API; the profile UI also
  loaded and saved selections through the Vite proxy.
- Prisma reported the database schema was up to date; the repeatable seed
  completed successfully.
- `pnpm test` passed all six automated tests, including all 31 interest
  combinations and invalid payload checks.
- `pnpm run build` and the frontend/API TypeScript checks passed.

**Conclusion:** The development connection path
Vite -> Express -> Prisma -> SQLite was verified.

## Scope

This verifies the local development database and the demo profile interest
read/write path. Automated router tests use an in-memory store; repeat the
database steps above against each contributor's local database before marking
their verification complete. This does not verify production infrastructure or
authentication.

## Team verification

Record a successful local `pnpm db:setup`, API health check, opportunity read,
and profile interest save/reload for every team member. Only the current
workspace verification is recorded; peer verification is pending.

| Team member | Database setup | API and interest verification | Verified date |
| --- | --- | --- | --- |
| Ryan (`rmangus4`) | Passed | Passed, including all 31 combinations | November 15, 2026 |
| Additional team members | Pending | Pending | |
