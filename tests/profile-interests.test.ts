import assert from "node:assert/strict"

import { createServer, type Server } from "node:http"

import { test } from "node:test"

import express from "express"

import { interests, type Interest } from "../src/data.ts"

import { getPathwayNodes, type PathwayNode } from "../src/pathways.ts"

import {
  createProfileInterestsRouter,
  type ProfileInterestStore,
} from "../server/profile-interests.ts"

type TestServer = {
  url: string

  readInterests: () => Interest[] | null

  close: () => Promise<void>
}

async function startTestServer(
  initialInterests: Interest[] | null = ["Bioinformatics"],
): Promise<TestServer> {
  let storedInterests = initialInterests

  const store: ProfileInterestStore = {
    getInterests: async () => storedInterests,

    replaceInterests: async (selectedInterests) => {
      if (storedInterests === null) return false

      storedInterests = [...selectedInterests]

      return true
    },
  }

  const app = express()

  app.use(express.json())

  app.use("/api/profile/interests", createProfileInterestsRouter(store))

  const server: Server = createServer(app)

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)

    server.listen(0, "127.0.0.1", resolve)
  })

  const address = server.address()

  if (!address || typeof address === "string") {
    throw new Error("Test server did not bind to a TCP port.")
  }

  return {
    url: `http://127.0.0.1:${address.port}/api/profile/interests`,

    readInterests: () => storedInterests,

    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
  }
}

async function responseInterests(response: Response): Promise<Interest[]> {
  const body = (await response.json()) as { interests: Interest[] }

  return body.interests
}

test("loads saved interests", async () => {
  const server = await startTestServer(["Bioinformatics", "Health-tech"])

  try {
    const response = await fetch(server.url)

    assert.equal(response.status, 200)

    assert.deepEqual(await responseInterests(response), [
      "Bioinformatics",

      "Health-tech",
    ])
  } finally {
    await server.close()
  }
})

test("saves and reloads all 31 non-empty interest combinations", async () => {
  const server = await startTestServer()

  try {
    for (let mask = 1; mask < 1 << interests.length; mask++) {
      const selection = interests.filter(
        (_, index) => (mask & (1 << index)) !== 0,
      )

      const saveResponse = await fetch(server.url, {
        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ interests: selection }),
      })

      assert.equal(saveResponse.status, 200, `combination ${mask}`)

      assert.deepEqual(await responseInterests(saveResponse), selection)

      const loadResponse = await fetch(server.url)

      assert.equal(loadResponse.status, 200, `reload combination ${mask}`)

      assert.deepEqual(await responseInterests(loadResponse), selection)

      assert.deepEqual(server.readInterests(), selection)
    }
  } finally {
    await server.close()
  }
})

test("rejects invalid interest payloads without changing saved interests", async () => {
  const initial: Interest[] = ["Bioinformatics"]

  const invalidSelections: unknown[] = [
    [],

    [...interests, "Bioinformatics"],

    ["Bioinformatics", "Bioinformatics"],

    ["Not a field"],

    [42],

    null,
  ]

  const server = await startTestServer(initial)

  try {
    for (const selection of invalidSelections) {
      const response = await fetch(server.url, {
        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ interests: selection }),
      })

      assert.equal(response.status, 400)

      assert.deepEqual(server.readInterests(), initial)
    }
  } finally {
    await server.close()
  }
})

test("reports a missing profile for reads and writes", async () => {
  const server = await startTestServer(null)

  try {
    const readResponse = await fetch(server.url)

    assert.equal(readResponse.status, 404)

    const writeResponse = await fetch(server.url, {
      method: "PUT",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ interests: ["Bioinformatics"] }),
    })

    assert.equal(writeResponse.status, 404)
  } finally {
    await server.close()
  }
})

test("maps each interest to curated pathway steps", () => {
  const expected: Record<Interest, PathwayNode[]> = {
    Bioinformatics: ["foundation", "requirements", "data", "certification"],

    "Data Engineering": ["foundation", "requirements", "data", "job"],

    "Health-tech": ["requirements", "systems", "product"],

    "Machine Learning": ["requirements", "data", "certification"],

    "Cloud & Security": ["foundation", "product", "job"],
  }

  for (const interest of interests) {
    assert.deepEqual(getPathwayNodes([interest]), expected[interest])
  }
})

test("all 31 interest combinations yield non-empty, de-duplicated pathways", () => {
  for (let mask = 1; mask < 1 << interests.length; mask++) {
    const selection = interests.filter(
      (_, index) => (mask & (1 << index)) !== 0,
    )

    const nodes = getPathwayNodes(selection)

    assert.ok(nodes.length > 0, `combination ${mask} has a pathway`)

    assert.equal(new Set(nodes).size, nodes.length, `combination ${mask}`)

    assert.deepEqual(nodes, getPathwayNodes([...selection].reverse()))
  }
})
