// ADDED: SQLite/Prisma integration tests for student profile interest relations.

import { randomUUID } from "node:crypto"

import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { interests } from "../src/data"

import { prisma } from "../server/db"

const testId = randomUUID()

const testEmail = `vitest-${testId}@example.test`

const testInterestNames = [interests[0], interests[1]]

const createdInterestIds: string[] = []

let profileId: string

const interestIds: string[] = []

describe("student profile interests", () => {
  beforeAll(async () => {
    for (const name of testInterestNames) {
      if (!name) throw new Error("Expected at least two configured interests")

      const existing = await prisma.interest.findUnique({ where: { name } })

      if (existing) {
        interestIds.push(existing.id)

        continue
      }

      const created = await prisma.interest.create({ data: { name } })

      createdInterestIds.push(created.id)

      interestIds.push(created.id)
    }

    const user = await prisma.user.create({
      data: {
        email: testEmail,

        passwordHash: "test-only-not-a-real-credential",

        profile: { create: { displayName: "Vitest Student" } },
      },

      include: { profile: true },
    })

    if (!user.profile) throw new Error("Student profile creation failed")

    profileId = user.profile.id
  })

  afterAll(async () => {
    if (profileId) {
      await prisma.studentProfileInterest.deleteMany({ where: { profileId } })
    }

    await prisma.user.deleteMany({ where: { email: testEmail } })

    for (const interestId of createdInterestIds) {
      await prisma.interest.deleteMany({ where: { id: interestId } })
    }

    await prisma.$disconnect()
  })

  it("creates and reads a student profile", async () => {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    })

    expect(profile).toMatchObject({
      id: profileId,

      displayName: "Vitest Student",
    })
  })

  it("allows one student to have multiple fields of interest", async () => {
    await prisma.studentProfileInterest.createMany({
      data: interestIds.map((interestId) => ({ profileId, interestId })),
    })

    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },

      include: {
        interests: { include: { interest: { select: { name: true } } } },
      },
    })

    expect(
      profile?.interests.map((relation) => relation.interest.name).sort(),
    ).toEqual([...testInterestNames].sort())
  })

  it("rejects a relation to a nonexistent interest", async () => {
    await expect(
      prisma.studentProfileInterest.create({
        data: {
          profileId,

          interestId: `missing-${testId}`,
        },
      }),
    ).rejects.toMatchObject({ code: "P2003" })
  })
})
