// ADDED: Server-only Prisma client; never import this module into browser code.

import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()
