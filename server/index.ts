// ADDED: Local development API for database connectivity and opportunity reads.

import "dotenv/config"

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"

import { prisma } from "./db.js"
import {
  createProfileInterestsRouter,
  type ProfileInterestStore,
} from "./profile-interests.js"

const app = express()

const port = Number(process.env.API_PORT ?? 3001)
const demoProfileEmail = "student.demo@example.test"

app.use(express.json())

const profileInterestStore: ProfileInterestStore = {
  getInterests: async () => {
    const profile = await prisma.studentProfile.findFirst({
      where: { user: { email: demoProfileEmail } },
      include: { interests: { include: { interest: true } } },
    })

    return profile?.interests.map(({ interest }) => interest.name) ?? null
  },
  replaceInterests: async (selectedInterests) => {
    const profile = await prisma.studentProfile.findFirst({
      where: { user: { email: demoProfileEmail } },
      select: { id: true },
    })

    if (!profile) return false

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
    return true
  },
}

app.use(
  "/api/profile/interests",
  createProfileInterestsRouter(profileInterestStore),
)

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
