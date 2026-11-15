// ADDED: Local development API for database connectivity and opportunity reads.

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"

import { prisma } from "./db.js"

const app = express()

const port = Number(process.env.API_PORT ?? 3001)

app.get("/api/health/db", async (_request, response, next) => {
  try {
    const opportunities = await prisma.opportunity.count()

    response.json({
      status: "ok",

      database: "connected",

      opportunities,
    })
  } catch (error) {
    next(error)
  }
})

app.get("/api/opportunities", async (_request, response, next) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      orderBy: { postedAt: "desc" },

      include: {
        company: { select: { name: true, initials: true } },

        interest: { select: { name: true } },

        skills: {
          include: { skill: { select: { id: true, name: true } } },

          orderBy: { requirementType: "asc" },
        },

        deliverables: { orderBy: { position: "asc" } },
      },
    })

    response.json(opportunities)
  } catch (error) {
    next(error)
  }
})

app.use(
  (
    error: unknown,

    _request: Request,

    response: Response,

    _next: NextFunction,
  ) => {
    console.error("Development API request failed:", error)

    response.status(500).json({ error: "Internal server error" })
  },
)

const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Development API listening on http://127.0.0.1:${port}`)
})

const shutdown = () => {
  server.close(() => {
    void prisma.$disconnect()
  })
}

process.once("SIGINT", shutdown)

process.once("SIGTERM", shutdown)
