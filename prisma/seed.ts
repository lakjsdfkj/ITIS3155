// ADDED: Idempotent, fictional development fixtures derived from src/data.ts.

import { scryptSync } from "node:crypto"

import { handbook, interests, posts } from "../src/data.ts"

import { prisma } from "../server/db.js"

const skillCategories: Record<string, string> = {
  python: "Programming",

  aws: "Cloud & security",

  databricks: "Data engineering",

  sas: "Data analytics",

  hipaa: "Compliance",

  genomics: "Bioinformatics",

  sql: "Data engineering",

  nextflow: "Workflow tools",

  ml: "AI & machine learning",

  stats: "Data analytics",

  docker: "Workflow tools",
}

const credentialIds = new Map<string, string>()

const interestIds = new Map<string, string>()

const companyIds = new Map<string, string>()

function parseHours(value: string): number {
  const hours = Number.parseInt(value, 10)

  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error(`Invalid estimated learning time: ${value}`)
  }

  return hours
}

function postedDate(value: string): Date {
  const match = /^(\d+)\s+(day|week)s?\s+ago$/i.exec(value)

  if (!match) throw new Error(`Unsupported sample posting date: ${value}`)

  const unit = match[2].toLowerCase().startsWith("week") ? 7 : 1

  const date = new Date()

  date.setDate(date.getDate() - Number(match[1]) * unit)

  return date
}

function deadlineDate(value: string): Date | null {
  const match = /^Applications close ([A-Za-z]+) (\d{1,2})$/i.exec(value)

  if (!match) return null

  const monthNames = [
    "january",

    "february",

    "march",

    "april",

    "may",

    "june",

    "july",

    "august",

    "september",

    "october",

    "november",

    "december",
  ]

  const monthName = match[1].toLowerCase()

  const month = monthNames.findIndex(
    (name) => name === monthName || name.slice(0, 3) === monthName,
  )

  const day = Number(match[2])

  if (month < 0 || day < 1 || day > 31) {
    throw new Error(`Unsupported sample deadline: ${value}`)
  }

  const now = new Date()

  let year = now.getFullYear()

  let deadline = new Date(Date.UTC(year, month, day, 23, 59, 59))

  if (deadline < now) {
    year += 1

    deadline = new Date(Date.UTC(year, month, day, 23, 59, 59))
  }

  return deadline
}

function opportunityType(title: string): string {
  const normalizedTitle = title.toLowerCase()

  if (normalizedTitle.includes("co-op")) return "Co-op"

  if (normalizedTitle.includes("intern")) return "Internship"

  return "Project"
}

async function seed() {
  for (const name of interests) {
    const interest = await prisma.interest.upsert({
      where: { name },

      create: { name },

      update: {},
    })

    interestIds.set(name, interest.id)
  }

  for (const skill of handbook) {
    const category = skillCategories[skill.id]

    if (!category) throw new Error(`Missing category for skill ${skill.id}`)

    await prisma.skill.upsert({
      where: { id: skill.id },

      create: {
        id: skill.id,

        name: skill.name,

        category,

        level: skill.level,

        estimatedHours: parseHours(skill.hours),

        summary: skill.summary,

        why: skill.why,
      },

      update: {
        name: skill.name,

        category,

        level: skill.level,

        estimatedHours: parseHours(skill.hours),

        summary: skill.summary,

        why: skill.why,
      },
    })

    await prisma.skillTopic.deleteMany({ where: { skillId: skill.id } })

    for (const [index, title] of skill.learn.entries()) {
      await prisma.skillTopic.create({
        data: { skillId: skill.id, position: index + 1, title },
      })
    }

    const credential = await prisma.credential.upsert({
      where: { name: skill.credential },

      create: { name: skill.credential },

      update: {},
    })

    credentialIds.set(skill.credential, credential.id)

    await prisma.skillCredential.upsert({
      where: {
        skillId_credentialId: {
          skillId: skill.id,

          credentialId: credential.id,
        },
      },

      create: { skillId: skill.id, credentialId: credential.id },

      update: {},
    })
  }

  const companies = new Map<
    string,
    { initials: string; industry: string }
  >()

  for (const post of posts) {
    if (!companies.has(post.company)) {
      companies.set(post.company, {
        initials: post.initials,

        industry: post.field,
      })
    }
  }

  for (const [name, company] of companies) {
    const record = await prisma.company.upsert({
      where: { name },

      create: { name, ...company },

      update: company,
    })

    companyIds.set(name, record.id)
  }

  const passwordHash = scryptSync(
    "development-only-seed",

    "skillsync-local-seed",

    64,
  ).toString("hex")

  const user = await prisma.user.upsert({
    where: { email: "student.demo@example.test" },

    create: {
      email: "student.demo@example.test",

      passwordHash,
    },

    update: { passwordHash },
  })

  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },

    create: {
      userId: user.id,

      displayName: "Dakota Oregon (Demo)",

      major: "Computer Science",

      concentration: "Bioinformatics",

      bio: "Fictional development profile for testing database relationships.",
    },

    update: {
      displayName: "Dakota Oregon (Demo)",

      major: "Computer Science",

      concentration: "Bioinformatics",

      bio: "Fictional development profile for testing database relationships.",
    },
  })

  await prisma.studentProfileInterest.deleteMany({
    where: { profileId: profile.id },
  })

  await prisma.studentProfileInterest.createMany({
    data: ["Bioinformatics", "Data Engineering"].map((name) => {
      const interestId = interestIds.get(name)

      if (!interestId) throw new Error(`Missing seeded interest: ${name}`)

      return { profileId: profile.id, interestId }
    }),
  })

  await prisma.studentProfileSkill.deleteMany({
    where: { profileId: profile.id },
  })

  await prisma.studentProfileSkill.createMany({
    data: [
      { profileId: profile.id, skillId: "python", source: "resume" },

      { profileId: profile.id, skillId: "genomics", source: "resume" },

      { profileId: profile.id, skillId: "stats", source: "assessment" },
    ],
  })

  for (const post of posts) {
    const companyId = companyIds.get(post.company)

    const interestId = interestIds.get(post.field)

    if (!companyId || !interestId) {
      throw new Error(`Missing seeded company or interest for ${post.id}`)
    }

    await prisma.opportunity.upsert({
      where: { id: post.id },

      create: {
        id: post.id,

        companyId,

        interestId,

        title: post.title,

        type: opportunityType(post.title),

        summary: post.summary,

        details: post.details,

        team: post.team,

        duration: post.duration,

        location: post.location,

        deadline: deadlineDate(post.deadline),

        postedAt: postedDate(post.posted),

        featured: post.featured ?? false,
      },

      update: {
        companyId,

        interestId,

        title: post.title,

        type: opportunityType(post.title),

        summary: post.summary,

        details: post.details,

        team: post.team,

        duration: post.duration,

        location: post.location,

        deadline: deadlineDate(post.deadline),

        postedAt: postedDate(post.posted),

        featured: post.featured ?? false,

        status: "Open",
      },
    })

    await prisma.opportunitySkill.deleteMany({
      where: { opportunityId: post.id },
    })

    await prisma.opportunitySkill.createMany({
      data: [
        ...post.required.map((skillId) => ({
          opportunityId: post.id,

          skillId,

          requirementType: "required",
        })),

        ...post.desired.map((skillId) => ({
          opportunityId: post.id,

          skillId,

          requirementType: "desired",
        })),
      ],
    })

    await prisma.opportunityDeliverable.deleteMany({
      where: { opportunityId: post.id },
    })

    await prisma.opportunityDeliverable.createMany({
      data: post.deliverables.map((description, index) => ({
        opportunityId: post.id,
        position: index + 1,
        description,
      })),
    })
  }

  const firstOpportunity = posts[0]
  if (!firstOpportunity) throw new Error("No sample opportunities are defined")
  await prisma.savedOpportunity.upsert({
    where: {
      profileId_opportunityId: {
        profileId: profile.id,
        opportunityId: firstOpportunity.id,
      },
    },
    create: {
      profileId: profile.id,
      opportunityId: firstOpportunity.id,
    },
    update: {},
  })

  const pathway = await prisma.careerPathway.upsert({
    where: { id: "pathway-demo-bioinformatics" },

    create: {
      id: "pathway-demo-bioinformatics",

      profileId: profile.id,

      title: "Bioinformatics data internship",

      description: "Fictional sample career pathway for local development.",
    },

    update: {
      profileId: profile.id,

      title: "Bioinformatics data internship",

      description: "Fictional sample career pathway for local development.",
    },
  })

  for (const [index, skillId] of ["aws", "python"].entries()) {
    const skill = handbook.find((item) => item.id === skillId)

    if (!skill) throw new Error(`Missing pathway skill: ${skillId}`)

    const credentialId = credentialIds.get(skill.credential)

    if (!credentialId) {
      throw new Error(`Missing pathway credential: ${skill.credential}`)
    }

    const step = await prisma.pathwayStep.upsert({
      where: {
        pathwayId_position: { pathwayId: pathway.id, position: index + 1 },
      },

      create: {
        pathwayId: pathway.id,

        position: index + 1,

        title: skill.credential,

        description: skill.summary,

        status: index === 0 ? "in_progress" : "suggested",

        estimatedHours: parseHours(skill.hours),

        skillId,

        credentialId,
      },

      update: {
        title: skill.credential,

        description: skill.summary,

        status: index === 0 ? "in_progress" : "suggested",

        estimatedHours: parseHours(skill.hours),

        skillId,

        credentialId,
      },
    })

    await prisma.pathwayResource.deleteMany({ where: { stepId: step.id } })

    await prisma.pathwayResource.createMany({
      data: [
        { stepId: step.id, position: 1, title: `${skill.name} learning plan` },

        { stepId: step.id, position: 2, title: `${skill.name} practice lab` },
      ],
    })
  }

  const helixNovaId = companyIds.get("HelixNova")

  if (!helixNovaId) throw new Error("Missing seeded company: HelixNova")

  const newsPost = await prisma.newsPost.upsert({
    where: { id: "news-demo-1" },

    create: {
      id: "news-demo-1",

      source: "Company",

      authorName: "HelixNova",

      byline: "Pipeline Engineering · Development sample",

      initials: "HN",

      companyId: helixNovaId,

      title: "Sample development news post",

      body: "Fictional feed content used to verify local news-post relationships.",

      callout: "Development data only",
    },

    update: {
      source: "Company",

      authorName: "HelixNova",

      byline: "Pipeline Engineering · Development sample",

      initials: "HN",

      companyId: helixNovaId,

      title: "Sample development news post",

      body: "Fictional feed content used to verify local news-post relationships.",

      callout: "Development data only",
    },
  })

  await prisma.newsPostInterest.deleteMany({ where: { postId: newsPost.id } })

  await prisma.newsPostInterest.createMany({
    data: ["Bioinformatics", "Data Engineering"].map((name) => {
      const interestId = interestIds.get(name)

      if (!interestId) throw new Error(`Missing seeded interest: ${name}`)

      return { postId: newsPost.id, interestId }
    }),
  })

  console.log(
    `Seeded ${handbook.length} skills, ${posts.length} opportunities, and fictional development profile/news/pathway data.`,
  )
}

seed()

  .catch((error: unknown) => {
    console.error("Development database seeding failed:", error)

    process.exitCode = 1
  })

  .finally(async () => {
    await prisma.$disconnect()
  })
