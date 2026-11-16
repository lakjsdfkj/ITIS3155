// ADDED: Local development API for database connectivity and opportunity reads.

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"

import { interests } from "../src/data.ts"
import { prisma } from "./db.js"

const app = express()

const port = Number(process.env.API_PORT ?? 3001)
const demoProfileEmail = "student.demo@example.test"
const allowedInterests = new Set<string>(interests)

function isInterestSelection(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 5 &&
    value.every(
      (interest: unknown): interest is string =>
        typeof interest === "string" && allowedInterests.has(interest),
    ) &&
    new Set(value).size === value.length
  )
}

app.use(express.json())

app.get("/api/profile/interests", async (_request, response, next) => {
  try {
    const profile = await prisma.studentProfile.findFirst({
      where: { user: { email: demoProfileEmail } },
      include: { interests: { include: { interest: true } } },
    })

    if (!profile) {
      response.status(404).json({ error: "Demo student profile not found." })
      return
    }

    response.json({
      interests: profile.interests.map(({ interest }) => interest.name),
    })
  } catch (error) {
    next(error)
  }
})

app.put("/api/profile/interests", async (request, response, next) => {
  try {
    const requestInterests: unknown = request.body?.interests
    if (!isInterestSelection(requestInterests)) {
      response.status(400).json({
        error: "Choose between 1 and 5 unique valid fields of interest.",
      })
      return
    }
    const selectedInterests = requestInterests

    const profile = await prisma.studentProfile.findFirst({
      where: { user: { email: demoProfileEmail } },
      select: { id: true },
    })

    if (!profile) {
      response.status(404).json({ error: "Demo student profile not found." })
      return
    }

    const records = await prisma.interest.findMany({
      where: { name: { in: selectedInterests } },
      select: { id: true, name: true },
    })
    if (records.length !== selectedInterests.length) {
      throw new Error("A selected field of interest is missing from the database.")
    }

    const interestIds = new Map(
      records.map(({ id, name }) => [name, id] as const),
    )
    const profileInterests = selectedInterests.map((name) => {
      const interestId = interestIds.get(name)
      if (!interestId) {
        throw new Error(`Selected field of interest is missing: ${name}`)
      }
      return { profileId: profile.id, interestId }
    })

    await prisma.$transaction(async (transaction) => {
      await transaction.studentProfileInterest.deleteMany({
        where: { profileId: profile.id },
      })
      await transaction.studentProfileInterest.createMany({
        data: profileInterests,
      })
    })

    response.json({ interests: selectedInterests })
  } catch (error) {
    next(error)
  }
})

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

    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status < 500
        ? error.status
        : 500
    response.status(statusCode).json({
      error:
        statusCode === 400 ? "Invalid request payload" : "Internal server error",
    })
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
