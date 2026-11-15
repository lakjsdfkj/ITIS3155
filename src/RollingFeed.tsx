import { useMemo, useState } from "react"
import Icon from "./icons"
import { interests } from "./data"

type Source = "Company" | "Employee" | "Student" | "School"
type Interest = (typeof interests)[number]

type NewsPost = {
  id: string
  source: Source
  author: string
  byline: string
  initials: string
  time: string
  title: string
  body: string
  interests: Interest[]
  reactions: number
  rating?: number
  callout?: string
}

const sources: Array<"All posts" | Source> = [
  "All posts",
  "Company",
  "Employee",
  "Student",
  "School",
]

const newsPosts: NewsPost[] = [
  {
    id: "n1",
    source: "Company",
    author: "HelixNova",
    byline: "Pipeline Engineering",
    initials: "HN",
    time: "38 min ago",
    title: "A new pathogen-surveillance pipeline is entering development",
    body: "Our pipeline team is beginning a semester-long build to help public-health partners compare genomic samples faster. We will be opening three paid student contributor roles focused on Python quality checks, Nextflow workflows, and clear technical documentation.",
    interests: ["Bioinformatics", "Data Engineering"],
    reactions: 42,
    callout: "Student contributor applications open Monday",
  },
  {
    id: "n2",
    source: "Employee",
    author: "Priya Shah",
    byline: "Bioinformatics Engineer at HelixNova",
    initials: "PS",
    time: "2 hrs ago",
    title: "What surprised me most about joining a genomics pipeline team",
    body: "The best part has been the amount of mentorship. New engineers pair on code reviews and are encouraged to ask why a workflow exists, not just how to run it. Release weeks can move quickly, but the team is thoughtful about planning and protecting focus time.",
    interests: ["Bioinformatics"],
    reactions: 31,
    rating: 4,
  },
  {
    id: "n3",
    source: "School",
    author: "College of Computing & Informatics",
    byline: "Experiential Learning Office",
    initials: "CCI",
    time: "Today · 9:15 AM",
    title: "Spring applied-computing project showcase announced",
    body: "Student teams can now propose projects for the spring showcase. Faculty mentors are especially interested in health-data visualization, responsible machine learning, and reproducible research tools. Proposals are welcome from individuals or teams of up to four.",
    interests: ["Health-tech", "Machine Learning"],
    reactions: 27,
    callout: "Proposal deadline · November 18",
  },
  {
    id: "n4",
    source: "Student",
    author: "Maya Chen",
    byline: "CS junior · Data Engineering",
    initials: "MC",
    time: "Yesterday",
    title: "What I learned migrating a student lab dataset to a lakehouse",
    body: "I expected the hard part to be writing transformations. It was actually defining what every column meant and agreeing on validation rules. The project gave me a much better understanding of SQL, Delta tables, and why data contracts matter.",
    interests: ["Data Engineering"],
    reactions: 54,
  },
  {
    id: "n5",
    source: "Company",
    author: "Genomara Labs",
    byline: "Computational Research",
    initials: "GL",
    time: "Yesterday",
    title: "We are expanding our rare-disease ML fellowship",
    body: "Next summer's fellowship will include six undergraduate researchers working alongside computational scientists. Fellows will benchmark variant-prioritization models, document evaluation choices, and present findings to clinical collaborators.",
    interests: ["Machine Learning", "Bioinformatics"],
    reactions: 68,
    callout: "Applications launch next month",
  },
  {
    id: "n6",
    source: "Employee",
    author: "Elena Torres",
    byline: "Data Analyst at Cascade Health Analytics",
    initials: "ET",
    time: "2 days ago",
    title: "A supportive first role for someone entering health analytics",
    body: "My manager gave me a clear ramp-up plan and time to complete privacy training before touching study data. The work is structured and documentation-heavy, which I enjoy. During reporting deadlines the pace can be intense, but expectations are communicated early.",
    interests: ["Health-tech", "Data Engineering"],
    reactions: 19,
    rating: 4,
  },
  {
    id: "n7",
    source: "Company",
    author: "Northwind Cloud",
    byline: "Research Platform Team",
    initials: "NC",
    time: "3 days ago",
    title: "University research sandbox reaches general availability",
    body: "Our new cloud sandbox gives student research teams a secure place to learn IAM, storage, and cost monitoring with realistic datasets. We are also recruiting campus ambassadors to develop onboarding guides and lead introductory workshops.",
    interests: ["Cloud & Security"],
    reactions: 36,
    callout: "Campus ambassador interest form is now live",
  },
  {
    id: "n8",
    source: "Student",
    author: "Noah Williams",
    byline: "Bioinformatics concentration · Senior",
    initials: "NW",
    time: "4 days ago",
    title: "My capstone team published our first reproducible workflow",
    body: "We turned a collection of manual sequence-analysis steps into a containerized Nextflow pipeline. Getting the same result on every teammate's machine felt like a small miracle. I shared our checklist and starter repository with the student bioinformatics club.",
    interests: ["Bioinformatics", "Cloud & Security"],
    reactions: 73,
  },
  {
    id: "n9",
    source: "Employee",
    author: "Marcus Lee",
    byline: "Platform Engineer at Meridian Biosciences",
    initials: "ML",
    time: "5 days ago",
    title: "Why I have stayed on Meridian's data platform team",
    body: "Scientists and engineers work closely here, and junior teammates get meaningful ownership. The legacy systems can be challenging and priorities occasionally shift, but leaders are transparent about tradeoffs and invest in tools that reduce repetitive work.",
    interests: ["Data Engineering", "Health-tech"],
    reactions: 22,
    rating: 4,
  },
  {
    id: "n10",
    source: "School",
    author: "CCI Career Services",
    byline: "Student Success",
    initials: "CS",
    time: "1 week ago",
    title: "Five employers join the fall technology co-op forum",
    body: "HelixNova, Genomara Labs, Cascade Health Analytics, Northwind Cloud, and Meridian Biosciences will host small-group conversations about early-career projects. Students can bring a résumé, but the event is designed for exploration rather than formal interviews.",
    interests: [
      "Bioinformatics",
      "Data Engineering",
      "Health-tech",
      "Machine Learning",
      "Cloud & Security",
    ],
    reactions: 47,
    callout: "Thursday · 4:00 PM · Innovation Hall",
  },
]

function SourceIcon({ source }: { source: Source }) {
  const icon =
    source === "Company"
      ? "building"
      : source === "School"
        ? "book"
        : source === "Employee"
          ? "briefcase"
          : "user"
  return <Icon name={icon} size={13} />
}

export default function RollingFeed({ query }: { query: string }) {
  const [source, setSource] = useState<(typeof sources)[number]>("All posts")
  const [interest, setInterest] = useState<"All interests" | Interest>(
    "All interests",
  )
  const [saved, setSaved] = useState<string[]>([])

  const visible = useMemo(() => {
    const search = query.trim().toLowerCase()
    return newsPosts.filter((post) => {
      if (source !== "All posts" && post.source !== source) return false
      if (
        interest !== "All interests" &&
        !post.interests.includes(interest)
      ) {
        return false
      }
      if (!search) return true
      return [
        post.author,
        post.byline,
        post.title,
        post.body,
        post.source,
        ...post.interests,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    })
  }, [interest, query, source])

  const toggleSaved = (id: string) => {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id],
    )
  }

  return (
    <div className="rolling-feed-page">
      <section className="welcome rolling-welcome">
        <div>
          <p className="kicker">News Feed</p>
          <h1>Your career community, in one place.</h1>
          <p>
            Updates, honest perspectives, and projects from people and teams
            shaping your fields.
          </p>
        </div>
        <span className="live-feed-label">
          <span /> Updated today
        </span>
      </section>

      <section
        className="news-filter-panel card"
        aria-label="News feed filters"
      >
        <div className="news-filter-group">
          <span className="chip-label">Posted by</span>
          <div className="chip-row">
            {sources.map((item) => (
              <button
                key={item}
                className={source === item ? "chip active" : "chip"}
                aria-pressed={source === item}
                onClick={() => setSource(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="news-filter-group">
          <span className="chip-label">Your interests</span>
          <div className="chip-row">
            {(["All interests", ...interests] as const).map((item) => (
              <button
                key={item}
                className={interest === item ? "chip active" : "chip"}
                aria-pressed={interest === item}
                onClick={() => setInterest(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {(source !== "All posts" || interest !== "All interests") && (
          <button
            className="clear-filters news-clear"
            onClick={() => {
              setSource("All posts")
              setInterest("All interests")
            }}
          >
            Clear filters
          </button>
        )}
      </section>

      <div className="rolling-feed">
        <p className="feed-count">
          {visible.length} {visible.length === 1 ? "update" : "updates"} in your
          feed
        </p>
        {visible.map((post) => (
          <article className="news-story card" key={post.id}>
            <div className={`news-avatar source-${post.source.toLowerCase()}`}>
              {post.initials}
            </div>
            <div className="news-story-body">
              <header className="news-story-head">
                <div>
                  <strong>{post.author}</strong>
                  <span>{post.byline}</span>
                </div>
                <time>{post.time}</time>
              </header>
              <span className={`source-label source-${post.source.toLowerCase()}`}>
                <SourceIcon source={post.source} /> {post.source}
              </span>
              <h2>{post.title}</h2>
              {post.rating && (
                <div
                  className="employee-rating"
                  aria-label={`${post.rating} out of 5 rating`}
                >
                  <strong>{post.rating}.0</strong>
                  <span>out of 5 · Employee review</span>
                </div>
              )}
              <p>{post.body}</p>
              {post.callout && (
                <div className="news-callout">
                  <Icon name="sparkles" size={15} />
                  {post.callout}
                </div>
              )}
              <div className="news-interest-row">
                {post.interests.map((item) => (
                  <button key={item} onClick={() => setInterest(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <footer className="news-story-foot">
                <span>
                  <Icon name="users" size={15} /> {post.reactions} found this
                  useful
                </span>
                <button
                  className={saved.includes(post.id) ? "saved" : ""}
                  onClick={() => toggleSaved(post.id)}
                  aria-pressed={saved.includes(post.id)}
                >
                  <Icon name="bookmark" size={15} />
                  {saved.includes(post.id) ? "Saved" : "Save"}
                </button>
              </footer>
            </div>
          </article>
        ))}
        {visible.length === 0 && (
          <div className="feed-empty news-empty">
            <Icon name="news" size={26} />
            <strong>No updates match these filters</strong>
            <p>Try another interest, source, or search term.</p>
            <button
              className="edit-path"
              onClick={() => {
                setSource("All posts")
                setInterest("All interests")
              }}
            >
              Clear feed filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
