# Issue #3: Multiple Student Fields Interest

**Verified:** November 15, 2026

## Behavior

The profile editor accepts one to five distinct interests, lets students remove
individual interests, and persists the selection through the profile-interest
API. The app loads those interests when it starts so the pathway and profile
views use the saved selection.

The pathway combines existing curated steps for all selected fields, removes
duplicate steps, and renders connections in a consistent order:

| Field of interest | Curated steps |
| --- | --- |
| Bioinformatics | AWS Cloud, PCEP Python, Databricks, Genomics AI |
| Data Engineering | AWS Cloud, PCEP Python, Databricks, AWS Data |
| Health-tech | PCEP Python, SAS Base, CITI + HIPAA |
| Machine Learning | PCEP Python, Databricks, Genomics AI |
| Cloud & Security | AWS Cloud, CITI + HIPAA, AWS Data |

For multi-field selections, the pathways are combined and shared steps appear
only once. The existing pathway node content remains the source for each step's
details and learning resources; routes are curated rather than generated from
an employer or skills-matching algorithm.

## Verification

- `pnpm test`: six tests passed. The API tests cover loading, saving, all 31
  non-empty interest combinations, invalid selections, and a missing profile.
- Pathway tests cover each single-interest mapping and confirm every one of the
  31 combinations produces a non-empty route with no duplicate steps.
- The profile-interest API was also exercised against the local SQLite database
  for all 31 combinations; the seeded interests were restored afterward.
- UI smoke check through Vite: loaded the seeded two-interest profile, removed
  one interest and saved, confirmed the pathway reduced to that field's steps,
  then restored and saved the seeded interests.
- `pnpm run build`, the frontend TypeScript check, and a targeted API/test
  TypeScript check passed.

## Scope

The API persists interests for the seeded demo profile. Authentication and
multiple signed-in user profiles are outside this issue's current scope.
