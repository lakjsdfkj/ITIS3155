import { useEffect, useMemo, useState } from "react"
import Icon from "./icons"
import { fields, handbook, posts, type Post } from "./data"

type Props = {
  onOpenSkill: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
}

type SearchScope =
  | "All"
  | "Listings"
  | "Companies"
  | "Skills & certifications"
  | "Industries"

const scopes: SearchScope[] = [
  "All",
  "Listings",
  "Companies",
  "Skills & certifications",
  "Industries",
]
const levels = [
  "All levels",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const
type SearchLevel = (typeof levels)[number]
const resumeSkills = ["python", "genomics", "stats"]
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
const categories = [
  "All categories",
  ...new Set(Object.values(skillCategories)),
]
const certifications = [
  "All certifications",
  ...new Set(handbook.map((skill) => skill.credential)),
]
const companies = ["All companies", ...new Set(posts.map((post) => post.company))]
const opportunityTypes = [
  "All opportunities",
  "Internship",
  "Project",
  "Co-op",
] as const
type OpportunityType = (typeof opportunityTypes)[number]

const opportunityType = (post: Post): Exclude<
  OpportunityType,
  "All opportunities"
> => {
  const title = post.title.toLowerCase()
  if (title.includes("co-op")) return "Co-op"
  if (title.includes("intern")) return "Internship"
  return "Project"
}

const searchLevel = (level: string): SearchLevel =>
  level === "Foundational"
    ? "Beginner"
    : level === "Intermediate"
      ? "Intermediate"
      : level === "Advanced"
        ? "Advanced"
        : "Expert"

const skillName = (id: string) => handbook.find((h) => h.id === id)?.name ?? id

function SkillTag({
  id,
  desired,
  onOpen,
}: {
  id: string
  desired?: boolean
  onOpen: (id: string) => void
}) {
  return (
    <button
      className={desired ? "skill-tag desired" : "skill-tag"}
      onClick={(e) => {
        e.stopPropagation()
        onOpen(id)
      }}
      title={`Open the ${skillName(id)} handbook page`}
    >
      {skillName(id)}
      <Icon name="book" size={12} />
    </button>
  )
}

function DetailModal({
  post,
  onClose,
  onOpenSkill,
}: {
  post: Post
  onClose: () => void
  onOpenSkill: Props["onOpenSkill"]
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <div className={`company-mark tone-${post.tone}`}>
            {post.initials}
          </div>
          <div>
            <p className="eyebrow">
              {post.company} · {post.field}
            </p>
            <h2>{post.title}</h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close details"
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="modal-body">
          <p className="modal-copy">{post.details}</p>
          <dl className="facts">
            <div>
              <dt>
                <Icon name="users" size={14} /> Team
              </dt>
              <dd>{post.team}</dd>
            </div>
            <div>
              <dt>
                <Icon name="clock" size={14} /> Duration
              </dt>
              <dd>{post.duration}</dd>
            </div>
            <div>
              <dt>
                <Icon name="pin" size={14} /> Location
              </dt>
              <dd>{post.location}</dd>
            </div>
            <div>
              <dt>
                <Icon name="target" size={14} /> Deadline
              </dt>
              <dd>{post.deadline}</dd>
            </div>
          </dl>
          <div className="modal-cols">
            <div>
              <h3>Required skills</h3>
              <div className="tag-row">
                {post.required.map((s) => (
                  <SkillTag key={s} id={s} onOpen={onOpenSkill} />
                ))}
              </div>
              <h3>Nice to have</h3>
              <div className="tag-row">
                {post.desired.map((s) => (
                  <SkillTag key={s} id={s} desired onOpen={onOpenSkill} />
                ))}
              </div>
            </div>
            <div>
              <h3>What you will deliver</h3>
              <ul className="deliverables">
                {post.deliverables.map((d) => (
                  <li key={d}>
                    <Icon name="check" size={14} /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <footer className="modal-foot">
          <span>
            <Icon name="sparkles" size={15} /> Tap any skill to read its
            handbook page.
          </span>
          <button className="primary-button">
            Save to my plan <Icon name="bookmark" size={16} />
          </button>
        </footer>
      </div>
    </div>
  )
}

export default function Feed({
  onOpenSkill,
  query,
  onQueryChange,
}: Props) {
  const [field, setField] = useState<typeof fields[number]>("All fields")
  const [scope, setScope] = useState<SearchScope>("All")
  const [level, setLevel] = useState<SearchLevel>("All levels")
  const [category, setCategory] = useState("All categories")
  const [certification, setCertification] = useState("All certifications")
  const [company, setCompany] = useState("All companies")
  const [opportunity, setOpportunity] =
    useState<OpportunityType>("All opportunities")
  const [resumeOnly, setResumeOnly] = useState(false)
  const [excluded, setExcluded] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [open, setOpen] = useState<Post | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const excludedTerms = excluded
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean)

    return posts.filter((p) => {
      if (field !== "All fields" && p.field !== field) return false
      const postSkills = [...p.required, ...p.desired]
      const skillDetails = postSkills
        .map((id) => handbook.find((skill) => skill.id === id))
        .filter((skill) => skill !== undefined)
      const listingText = [
        p.title,
        p.summary,
        p.details,
        p.team,
        p.duration,
        p.location,
        p.deadline,
        ...p.deliverables,
      ]
        .join(" ")
        .toLowerCase()
      const companyText = p.company.toLowerCase()
      const industryText = p.field.toLowerCase()
      const skillsText = skillDetails
        .flatMap((skill) => [
          skill.name,
          skill.credential,
          skill.level,
          skillCategories[skill.id],
          skill.summary,
        ])
        .join(" ")
        .toLowerCase()
      const allText =
        `${listingText} ${companyText} ${industryText} ${skillsText}`

      if (excludedTerms.some((term) => allText.includes(term))) return false
      if (company !== "All companies" && p.company !== company) return false
      if (
        opportunity !== "All opportunities" &&
        opportunityType(p) !== opportunity
      ) {
        return false
      }
      if (
        category !== "All categories" &&
        !skillDetails.some(
          (skill) => skillCategories[skill.id] === category,
        )
      ) {
        return false
      }
      if (
        certification !== "All certifications" &&
        !skillDetails.some((skill) => skill.credential === certification)
      ) {
        return false
      }
      if (resumeOnly && !postSkills.some((id) => resumeSkills.includes(id))) {
        return false
      }
      if (
        level !== "All levels" &&
        !skillDetails.some((skill) => searchLevel(skill.level) === level)
      ) {
        return false
      }
      if (!q) return true

      const scopedText =
        scope === "Listings"
          ? listingText
          : scope === "Companies"
            ? companyText
            : scope === "Skills & certifications"
              ? skillsText
              : scope === "Industries"
                ? industryText
                : allText
      return scopedText.includes(q)
    })
  }, [
    category,
    certification,
    company,
    excluded,
    field,
    level,
    opportunity,
    query,
    resumeOnly,
    scope,
  ])

  const activeFilterCount =
    Number(scope !== "All") +
    Number(field !== "All fields") +
    Number(level !== "All levels") +
    Number(category !== "All categories") +
    Number(certification !== "All certifications") +
    Number(company !== "All companies") +
    Number(opportunity !== "All opportunities") +
    Number(resumeOnly) +
    Number(Boolean(excluded.trim()))

  const resetFilters = () => {
    onQueryChange("")
    setField("All fields")
    setScope("All")
    setLevel("All levels")
    setCategory("All categories")
    setCertification("All certifications")
    setCompany("All companies")
    setOpportunity("All opportunities")
    setResumeOnly(false)
    setExcluded("")
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p className="kicker">News Feed</p>
          <h1>What employers are building, Dakota.</h1>
          <p>
            Real projects and the skills teams want. Tap a skill to learn it.
          </p>
        </div>
      </section>

      <div className="feed-controls">
        <label className="feed-search">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search listings, companies, skills, certifications..."
            aria-label="Search the news feed"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </label>
        <div className="search-filter-bar">
          <div className="chip-row" role="group" aria-label="Search within">
            <span className="chip-label">Search in</span>
            {scopes.map((item) => (
              <button
                key={item}
                className={scope === item ? "chip active" : "chip"}
                aria-pressed={scope === item}
                onClick={() => setScope(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="filter-actions">
            {(query || activeFilterCount > 0) && (
              <button className="clear-filters" onClick={resetFilters}>
                Clear all
              </button>
            )}
            <button
              className={filtersOpen ? "filter-toggle active" : "filter-toggle"}
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
            >
              <Icon name="filter" size={14} />
              More filters
              {activeFilterCount > 0 && (
                <span className="filter-count">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>
        {filtersOpen && (
          <div className="advanced-filters">
            <label className="filter-field">
              <span>Skill level</span>
              <select
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value as SearchLevel)
                }
              >
                {levels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Skill category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Relevant certification</span>
              <select
                value={certification}
                onChange={(event) => setCertification(event.target.value)}
              >
                {certifications.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Company</span>
              <select
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              >
                {companies.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Opportunity type</span>
              <select
                value={opportunity}
                onChange={(event) =>
                  setOpportunity(event.target.value as OpportunityType)
                }
              >
                {opportunityTypes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Exclude results containing</span>
              <input
                value={excluded}
                onChange={(event) => setExcluded(event.target.value)}
                placeholder="e.g. on-site, AWS"
              />
              <small>Separate multiple terms with commas.</small>
            </label>
            <label className="resume-filter">
              <input
                type="checkbox"
                checked={resumeOnly}
                onChange={(event) => setResumeOnly(event.target.checked)}
              />
              <span>
                <strong>Match my resume</strong>
                <small>Prioritize listings matching your 3 profile skills.</small>
              </span>
            </label>
          </div>
        )}
        <div className="chip-row" role="group" aria-label="Filter by field">
          <span className="chip-label">
            <Icon name="filter" size={14} /> Field
          </span>
          {fields.map((f) => (
            <button
              key={f}
              className={field === f ? "chip active" : "chip"}
              aria-pressed={field === f}
              onClick={() => setField(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="feed-count">
        {visible.length} {visible.length === 1 ? "project" : "projects"}
        {field !== "All fields" && ` in ${field}`}
      </p>

      <div className="feed-grid">
        {visible.map((p) => (
          <article
            key={p.id}
            className={p.featured ? "post-card featured" : "post-card"}
          >
            <div className="post-head">
              <div className={`company-mark tone-${p.tone}`}>{p.initials}</div>
              <div>
                <strong>{p.company}</strong>
                <span>{p.posted}</span>
              </div>
              <span className="field-pill">{p.field}</span>
            </div>
            <h3>{p.title}</h3>
            <p className="post-summary">{p.summary}</p>
            <div className="post-skills">
              <span className="skill-label">Required</span>
              <div className="tag-row">
                {p.required.map((s) => (
                  <SkillTag key={s} id={s} onOpen={onOpenSkill} />
                ))}
              </div>
              <span className="skill-label">Desired</span>
              <div className="tag-row">
                {p.desired.map((s) => (
                  <SkillTag key={s} id={s} desired onOpen={onOpenSkill} />
                ))}
              </div>
            </div>
            <div className="post-foot">
              <span>
                <Icon name="pin" size={14} /> {p.location.split(" · ")[0]}
              </span>
              <button className="text-button" onClick={() => setOpen(p)}>
                View project details <Icon name="arrow" size={15} />
              </button>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <div className="feed-empty">
            <Icon name="search" size={26} />
            <strong>No projects match yet</strong>
            <p>Try a different skill, adjust your filters, or clear all.</p>
            <button
              className="edit-path"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {open && (
        <DetailModal
          post={open}
          onClose={() => setOpen(null)}
          onOpenSkill={(id) => {
            setOpen(null)
            onOpenSkill(id)
          }}
        />
      )}
    </>
  )
}
