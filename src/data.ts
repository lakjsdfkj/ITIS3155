export type Handbook = {
  id: string
  name: string
  level: string
  hours: string
  summary: string
  why: string
  learn: string[]
  credential: string
}

export const handbook: Handbook[] = [
  {
    id: "python",
    name: "Python",
    level: "Foundational",
    hours: "18 hrs",
    summary:
      "The scripting language behind most bioinformatics pipelines, from parsing FASTA files to automating QC reports.",
    why: "Listed as required on 9 of 12 active internship posts.",
    learn: [
      "Functions, modules, and file I/O",
      "Pandas for tabular genomic data",
      "Biopython basics",
    ],
    credential: "PCEP Python Programmer",
  },
  {
    id: "aws",
    name: "AWS Cloud",
    level: "Foundational",
    hours: "12 hrs",
    summary:
      "Core cloud vocabulary: storage, compute, IAM, and how sequencing data moves through S3 and batch jobs.",
    why: "HelixNova engineers call this the most useful missing signal for new interns.",
    learn: [
      "S3, EC2, and IAM essentials",
      "Shared responsibility model",
      "Cost and region basics",
    ],
    credential: "AWS Certified Cloud Practitioner",
  },
  {
    id: "databricks",
    name: "Databricks",
    level: "Intermediate",
    hours: "24 hrs",
    summary:
      "A lakehouse platform for transforming high-volume data with Spark notebooks and Delta tables.",
    why: "Maps closely to how variant-calling output is cleaned at scale.",
    learn: ["Spark DataFrames", "Delta Lake tables", "Scheduling jobs"],
    credential: "Databricks Data Engineer Associate",
  },
  {
    id: "sas",
    name: "SAS",
    level: "Intermediate",
    hours: "30 hrs",
    summary:
      "Statistical programming used throughout clinical research and health-analytics teams.",
    why: "Requested by health-tech analytics groups working with trial data.",
    learn: [
      "DATA step and PROC SQL",
      "Clinical dataset prep",
      "Macros and reporting",
    ],
    credential: "SAS Base Programming Specialist",
  },
  {
    id: "hipaa",
    name: "HIPAA & CITI",
    level: "Foundational",
    hours: "4 hrs",
    summary:
      "The privacy and research-ethics standards that govern sensitive genomic and patient data.",
    why: "Often required before an intern can touch any real dataset.",
    learn: [
      "PHI and de-identification",
      "IRB and consent basics",
      "Secure data handling",
    ],
    credential: "CITI Biomedical Data & HIPAA",
  },
  {
    id: "genomics",
    name: "Genomics",
    level: "Foundational",
    hours: "10 hrs",
    summary:
      "Sequence alignment, variant calling, and the file formats (FASTQ, BAM, VCF) every pipeline touches.",
    why: "Shows you can connect coursework to real lab output.",
    learn: [
      "Reads, alignment, and variants",
      "FASTQ / BAM / VCF formats",
      "Reading a QC report",
    ],
    credential: "NVIDIA Genomics AI Certificate",
  },
  {
    id: "sql",
    name: "SQL",
    level: "Foundational",
    hours: "8 hrs",
    summary:
      "Querying and joining the clinical and sample-metadata tables that sit beside sequence data.",
    why: "A near-universal requirement across data and analytics roles.",
    learn: [
      "Joins and aggregates",
      "Window functions",
      "Query performance basics",
    ],
    credential: "Databricks Data Engineer Associate",
  },
  {
    id: "nextflow",
    name: "Nextflow",
    level: "Advanced",
    hours: "16 hrs",
    summary:
      "A workflow manager for reproducible, containerized bioinformatics pipelines.",
    why: "Desired by pipeline teams; a strong standout skill for juniors.",
    learn: [
      "Processes and channels",
      "nf-core pipelines",
      "Running on AWS Batch",
    ],
    credential: "AWS Data Engineer Associate",
  },
  {
    id: "ml",
    name: "Machine Learning",
    level: "Intermediate",
    hours: "20 hrs",
    summary:
      "Applying supervised models to genomic and clinical features, with a focus on honest evaluation.",
    why: "Desired by teams building variant-prioritization tools.",
    learn: [
      "scikit-learn workflows",
      "Train/test leakage in biology data",
      "Intro to PyTorch",
    ],
    credential: "NVIDIA Genomics AI Certificate",
  },
  {
    id: "stats",
    name: "Statistics",
    level: "Foundational",
    hours: "10 hrs",
    summary:
      "Hypothesis testing, multiple-comparison correction, and reading effect sizes in biological data.",
    why: "Required to defend any result you present to a research team.",
    learn: [
      "p-values and FDR",
      "Distributions and sampling",
      "Regression basics",
    ],
    credential: "SAS Base Programming Specialist",
  },
  {
    id: "docker",
    name: "Docker",
    level: "Intermediate",
    hours: "6 hrs",
    summary:
      "Containers that make an analysis run the same way on a laptop and in the cloud.",
    why: "Pipeline teams use it for every reproducible run.",
    learn: [
      "Images and containers",
      "Writing a Dockerfile",
      "Mounting data volumes",
    ],
    credential: "AWS Cloud Practitioner",
  },
]

export const fields = [
  "All fields",
  "Bioinformatics",
  "Data Engineering",
  "Health-tech",
  "Machine Learning",
  "Cloud & Security",
] as const

export type Post = {
  id: string
  company: string
  initials: string
  tone: string
  posted: string
  field: Exclude<typeof fields[number], "All fields">
  title: string
  summary: string
  required: string[]
  desired: string[]
  details: string
  team: string
  duration: string
  location: string
  deadline: string
  deliverables: string[]
  featured?: boolean
}

export const posts: Post[] = [
  {
    id: "p1",
    company: "HelixNova",
    initials: "HN",
    tone: "a",
    posted: "2 days ago",
    field: "Bioinformatics",
    featured: true,
    title: "Summer intern: variant-calling pipeline QA",
    summary:
      "Help the pipeline team validate a new genomic data client's sequencing output before it reaches analysts.",
    required: ["python", "genomics", "aws"],
    desired: ["nextflow", "docker"],
    details:
      "You will join the Pipeline Engineering team as the first line of QA for incoming client data. Expect to write Python checks over VCF and BAM outputs, flag anomalies, and document fixes in the team runbook. Priya Shah's team pairs every intern with a mentor and a weekly code review.",
    team: "Pipeline Engineering · 6 people",
    duration: "12 weeks, Jun – Aug",
    location: "Boston, MA · Hybrid",
    deadline: "Applications close Nov 20",
    deliverables: [
      "A reusable QC script suite",
      "Dashboard of client data quality",
      "Final team demo",
    ],
  },
  {
    id: "p2",
    company: "Genomara Labs",
    initials: "GL",
    tone: "b",
    posted: "4 days ago",
    field: "Machine Learning",
    title: "Research assistant: variant prioritization models",
    summary:
      "Prototype ranking models that surface the variants most likely to matter for rare-disease cases.",
    required: ["python", "stats"],
    desired: ["ml", "genomics"],
    details:
      "Work alongside two research scientists to benchmark baseline classifiers on de-identified variant data. The role emphasizes careful evaluation and clear write-ups over raw model complexity.",
    team: "Computational Research · 4 people",
    duration: "10 weeks, Summer",
    location: "Remote (US)",
    deadline: "Applications close Dec 1",
    deliverables: ["Benchmark notebook", "Evaluation methods memo"],
  },
  {
    id: "p3",
    company: "Cascade Health Analytics",
    initials: "CH",
    tone: "c",
    posted: "1 week ago",
    field: "Health-tech",
    title: "Clinical data analyst co-op",
    summary:
      "Prepare and report on trial datasets for a mid-size health-analytics group.",
    required: ["sas", "sql", "hipaa"],
    desired: ["stats"],
    details:
      "A six-month co-op preparing clinical datasets and producing standard tables for study teams. You will complete HIPAA training in week one and work under a senior biostatistician.",
    team: "Biostatistics · 9 people",
    duration: "6 months, Jan – Jun",
    location: "Seattle, WA · On-site",
    deadline: "Applications close Nov 5",
    deliverables: [
      "Cleaned study datasets",
      "Standard report tables",
      "Documented SAS macros",
    ],
  },
  {
    id: "p4",
    company: "Northwind Cloud",
    initials: "NC",
    tone: "a",
    posted: "1 week ago",
    field: "Cloud & Security",
    title: "Cloud engineer intern: research data platform",
    summary:
      "Support the platform that lets university labs store and share regulated research data.",
    required: ["aws", "python"],
    desired: ["docker", "hipaa"],
    details:
      "Help build and document infrastructure that gives research groups secure, auditable storage. You will script deployments, review access policies, and write guides for lab staff.",
    team: "Research Platform · 8 people",
    duration: "12 weeks, Summer",
    location: "Austin, TX · Hybrid",
    deadline: "Applications close Dec 15",
    deliverables: ["Access-review automation", "Lab onboarding guide"],
  },
  {
    id: "p5",
    company: "Meridian Biosciences",
    initials: "MB",
    tone: "b",
    posted: "2 weeks ago",
    field: "Data Engineering",
    title: "Data engineering intern: lakehouse migration",
    summary:
      "Move legacy assay data into a governed lakehouse used by discovery scientists.",
    required: ["sql", "python", "databricks"],
    desired: ["aws", "nextflow"],
    details:
      "Join the data platform team migrating assay results into Delta tables. You will write transformation notebooks, validate row counts against the source, and help define data contracts with scientists.",
    team: "Data Platform · 7 people",
    duration: "12 weeks, Summer",
    location: "Cambridge, MA · Hybrid",
    deadline: "Applications close Jan 10",
    deliverables: [
      "Migrated assay tables",
      "Validation report",
      "Data contract drafts",
    ],
  },
  {
    id: "p6",
    company: "HelixNova",
    initials: "HN",
    tone: "a",
    posted: "3 weeks ago",
    field: "Data Engineering",
    title: "Pipeline tooling intern: reproducible runs",
    summary:
      "Containerize the analysis steps analysts run by hand so every result can be reproduced.",
    required: ["docker", "python"],
    desired: ["nextflow", "aws"],
    details:
      "Turn ad-hoc analysis scripts into containerized, versioned steps. A good fit if you enjoy tidying messy workflows and writing clear documentation.",
    team: "Pipeline Engineering · 6 people",
    duration: "10 weeks, Summer",
    location: "Boston, MA · Hybrid",
    deadline: "Applications close Dec 8",
    deliverables: ["Container images", "Migration checklist"],
  },
]
