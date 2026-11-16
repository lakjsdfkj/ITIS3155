import type { Interest } from "./data"

export const pathwayNodes = {
  foundation: {
    eyebrow: "Start here",

    label: "AWS Cloud",
    title: "AWS Certified Cloud Practitioner",
    description:
      "Build cloud fundamentals for storing, processing, and securing large research datasets.",

    resources: ["AWS Cloud Essentials · 12 hours", "CLF-C02 practice exam"],

    position: { left: 8, top: 112, x: 54, y: 140 },
  },

  requirements: {
    eyebrow: "Suggested certification",

    label: "PCEP Python",
    title: "PCEP Python Programmer",
    description:
      "Validate programming fundamentals used across analysis scripts and data workflows.",

    resources: ["Python Institute prep · 18 hours", "PCEP coding practice"],

    position: { left: 29, top: 112, x: 197, y: 140 },
  },

  data: {
    eyebrow: "Employer priority",

    label: "Databricks",
    title: "Databricks Data Engineer Associate",
    description:
      "Learn to prepare and transform high-volume data with modern analytics platforms.",

    resources: [
      "Databricks learning plan · 24 hours",

      "Lakehouse lab environment",
    ],

    position: { left: 52, top: 44, x: 354, y: 72 },
  },

  systems: {
    eyebrow: "Suggested certification",

    label: "SAS Base",

    title: "SAS Base Programming Specialist",

    description:
      "Strengthen the statistical programming and data preparation skills requested by the health-tech analytics team.",

    resources: ["SAS exam prep · 30 hours", "Clinical data practice set"],

    position: { left: 73, top: 112, x: 496, y: 140 },
  },

  certification: {
    eyebrow: "Specialized option",

    label: "Genomics AI",
    title: "NVIDIA Genomics AI Certificate",
    description:
      "Explore genomics workflows and AI methods using large-scale biological data.",

    resources: ["Genomics AI workshop · 8 hours", "GPU pipeline lab"],

    position: { left: 73, top: 205, x: 496, y: 233 },
  },

  job: {
    eyebrow: "Advanced certification",

    label: "AWS Data",
    title: "AWS Data Engineer Associate",
    description:
      "Demonstrate that you can build and monitor reliable data pipelines in the cloud.",

    resources: ["DEA-C01 study plan · 40 hours", "Genomic pipeline capstone"],

    position: { left: 95, top: 112, x: 646, y: 140 },
  },

  product: {
    eyebrow: "Compliance option",

    label: "CITI + HIPAA",

    title: "CITI Biomedical Data & HIPAA",

    description:
      "Learn the privacy and research standards that shape how sensitive genomic and health data can be handled.",

    resources: ["CITI training · 4 hours", "HIPAA scenario assessment"],

    position: { left: 52, top: 190, x: 354, y: 218 },
  },
} as const

export type PathwayNode = keyof typeof pathwayNodes

const interestPathways: Record<Interest, readonly PathwayNode[]> = {
  Bioinformatics: ["foundation", "requirements", "data", "certification"],

  "Data Engineering": ["foundation", "requirements", "data", "job"],

  "Health-tech": ["requirements", "systems", "product"],

  "Machine Learning": ["requirements", "data", "certification"],

  "Cloud & Security": ["foundation", "product", "job"],
}

const pathwayOrder: readonly PathwayNode[] = [
  "foundation",

  "requirements",

  "data",

  "systems",

  "product",

  "certification",

  "job",
]

export function getPathwayNodes(
  selectedInterests: readonly Interest[],
): PathwayNode[] {
  const selectedNodes = new Set(
    selectedInterests.flatMap((interest) => interestPathways[interest]),
  )

  return pathwayOrder.filter((node) => selectedNodes.has(node))
}
