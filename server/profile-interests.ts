import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"

import { isInterestSelection, type Interest } from "../src/data.ts"

export type ProfileInterestStore = {
  getInterests: () => Promise<string[] | null>

  replaceInterests: (selectedInterests: Interest[]) => Promise<boolean>
}

export function createProfileInterestsRouter(store: ProfileInterestStore) {
  const router = express.Router()

  router.get("/", async (_request, response, next) => {
    try {
      const selectedInterests = await store.getInterests()

      if (!selectedInterests) {
        response.status(404).json({ error: "Demo student profile not found." })

        return
      }

      response.json({ interests: selectedInterests })
    } catch (error) {
      next(error)
    }
  })

  router.put(
    "/",

    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const selectedInterests: unknown = request.body?.interests

        if (!isInterestSelection(selectedInterests)) {
          response.status(400).json({
            error: "Choose between 1 and 5 unique valid fields of interest.",
          })

          return
        }

        const profileExists = await store.replaceInterests(selectedInterests)

        if (!profileExists) {
          response
            .status(404)
            .json({ error: "Demo student profile not found." })

          return
        }

        response.json({ interests: selectedInterests })
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
