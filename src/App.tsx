import { useEffect, useRef, useState } from "react"
import Icon, { type IconName } from "./icons"
import Feed from "./Feed"
import Handbook from "./Handbook"
import ProfileBuilder from "./ProfileBuilder"

function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <span />
        <span />
        <span />
      </span>
      <span>SkillSync</span>
    </div>
  )
}

const nav: [IconName, string][] = [
  ["news", "News Feed"],
  ["compass", "Explore paths"],
  ["book", "Skill library"],
  ["briefcase", "Opportunities"],
]

const pathwayNodes = {
  foundation: {
    eyebrow: "Start here",
    title: "AWS Certified Cloud Practitioner",
    description:
      "Build the cloud vocabulary HelixNova uses to store, process, and secure large genomic datasets.",
    resources: ["AWS Cloud Essentials · 12 hours", "CLF-C02 practice exam"],
  },
  requirements: {
    eyebrow: "Suggested certification",
    title: "PCEP Python Programmer",
    description:
      "Validate the Python fundamentals used across the team’s bioinformatics scripts and pipeline utilities.",
    resources: ["Python Institute prep · 18 hours", "PCEP coding practice"],
  },
  data: {
    eyebrow: "Employer priority",
    title: "Databricks Data Engineer Associate",
    description:
      "Learn to prepare and transform high-volume data with tools that map closely to modern genomic pipelines.",
    resources: [
      "Databricks learning plan · 24 hours",
      "Lakehouse lab environment",
    ],
  },
  systems: {
    eyebrow: "Suggested certification",
    title: "SAS Base Programming Specialist",
    description:
      "Strengthen the statistical programming and data preparation skills requested by the health-tech analytics team.",
    resources: ["SAS exam prep · 30 hours", "Clinical data practice set"],
  },
  certification: {
    eyebrow: "Specialized option",
    title: "NVIDIA Genomics AI Certificate",
    description:
      "Explore accelerated genomics workflows and AI methods relevant to the company’s newest genomic data client.",
    resources: ["Genomics AI workshop · 8 hours", "GPU pipeline lab"],
  },
  job: {
    eyebrow: "Advanced certification",
    title: "AWS Data Engineer Associate",
    description:
      "Demonstrate that you can build and monitor reliable data pipelines after completing the foundational cloud route.",
    resources: ["DEA-C01 study plan · 40 hours", "Genomic pipeline capstone"],
  },
  product: {
    eyebrow: "Compliance option",
    title: "CITI Biomedical Data & HIPAA",
    description:
      "Learn the privacy and research standards that shape how sensitive genomic and health data can be handled.",
    resources: ["CITI training · 4 hours", "HIPAA scenario assessment"],
  },
} as const

type PathwayNode = keyof typeof pathwayNodes

const skills = [
  { name: "Python programming", value: 74, tone: "indigo" },
  { name: "Genomics foundations", value: 58, tone: "teal" },
  { name: "Cloud data pipelines", value: 24, tone: "amber" },
]

const recommendations = [
  {
    company: "HelixNova",
    initials: "HN",
    accent: "adobe",
    title: "Inside a bioinformatics data pipeline team",
    speaker: "Priya Shah · Bioinformatics Engineer",
    meta: "7 min testimony",
    tag: "Professional testimony",
  },
  {
    company: "HelixNova feed",
    initials: "HN",
    accent: "atlassian",
    title: "Welcoming a new genomic data client",
    speaker: "Company update · Pipeline Engineering",
    meta: "Posted 2 days ago",
    tag: "Company feed",
  },
]

function App() {
  const [activeNav, setActiveNav] = useState("News Feed")
  const [skillId, setSkillId] = useState("python")
  const [cameFrom, setCameFrom] = useState("News Feed")
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<PathwayNode>("foundation")
  const [editingPath, setEditingPath] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", focusSearch)
    return () => window.removeEventListener("keydown", focusSearch)
  }, [])

  const go = (label: string) => {
    setActiveNav(label)
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }
  const openSkill = (id: string) => {
    setCameFrom(activeNav === "Skill library" ? "News Feed" : activeNav)
    setSkillId(id)
    go("Skill library")
  }
  const isOverview = ![
    "News Feed",
    "Skill library",
    "Opportunities",
    "Profile",
  ].includes(activeNav)

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <Logo />
          <button
            className="close-menu"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {nav.map(([icon, label]) => (
            <button
              key={label}
              className={activeNav === label ? "nav-item active" : "nav-item"}
              onClick={() => go(label)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "News Feed" && <span className="nav-count">{6}</span>}
              {label === "Opportunities" && (
                <span className="nav-count">3</span>
              )}
            </button>
          ))}
          <p className="nav-label nav-label-gap">You</p>
          <button
            className={activeNav === "Profile" ? "nav-item active" : "nav-item"}
            onClick={() => go("Profile")}
          >
            <Icon name="user" />
            <span>Profile</span>
          </button>
        </nav>
        <div className="sidebar-card">
          <span className="mini-icon">
            <Icon name="sparkles" size={18} />
          </span>
          <p className="eyebrow">Weekly pulse</p>
          <strong>2 new matches</strong>
          <p>Based on your bioinformatics interests.</p>
          <button>
            View matches <Icon name="arrow" size={15} />
          </button>
        </div>
        <div className="profile">
          <div className="avatar">DO</div>
          <div>
            <strong>Dakota Oregon</strong>
            <span>Computer Science · Bioinformatics</span>
          </div>
          <button
            aria-label="Open profile builder"
            onClick={() => go("Profile")}
          >
            <Icon name="user" size={16} />
          </button>
        </div>
      </aside>

      <div className="page">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="mobile-logo">
            <Logo />
          </div>
          <label className="search">
            <Icon name="search" size={18} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                if (
                  activeNav !== "News Feed" &&
                  activeNav !== "Opportunities"
                ) {
                  go("News Feed")
                }
              }}
              placeholder="Search listings, companies, skills..."
              aria-label="Search SkillSync"
            />
            {searchQuery ? (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                type="button"
              >
                <Icon name="close" size={14} />
              </button>
            ) : (
              <kbd>⌘ K</kbd>
            )}
          </label>
          <div className="header-actions">
            <button className="icon-button" aria-label="Notifications">
              <Icon name="bell" />
              <span />
            </button>
            <button
              className="header-avatar"
              onClick={() => go("Profile")}
              aria-label="Open profile builder"
            >
              DO
            </button>
          </div>
        </header>

        <main>
          {(activeNav === "News Feed" || activeNav === "Opportunities") && (
            <Feed
              onOpenSkill={openSkill}
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />
          )}
          {activeNav === "Skill library" && (
            <Handbook
              skillId={skillId}
              onSelect={setSkillId}
              onBack={() => go(cameFrom)}
              backLabel={cameFrom}
            />
          )}
          {activeNav === "Profile" && (
            <ProfileBuilder onBack={() => go("News Feed")} />
          )}
          {isOverview && (
            <>
              <section className="welcome">
                <div>
                  <p className="kicker">Monday, October 12</p>
                  <h1>Good morning, Dakota.</h1>
                  <p>
                    Your bioinformatics internship plan is taking shape. Here’s
                    where to focus next.
                  </p>
                </div>
                <button className="primary-button">
                  <Icon name="target" size={18} /> Update career goal
                </button>
              </section>

              <section className="pathway card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Your suggested pathway</p>
                    <h2>
                      Bioinformatics data internship · Certification pathway
                    </h2>
                  </div>
                  <div className="pathway-actions">
                    <span className="progress-copy">12% career-ready</span>
                    <button
                      className={editingPath ? "edit-path active" : "edit-path"}
                      onClick={() => setEditingPath(!editingPath)}
                    >
                      {editingPath ? "Done editing" : "Edit pathway"}
                    </button>
                  </div>
                </div>

                <div className="pathway-layout">
                  <aside className="path-profile">
                    <div className="path-profile-head">
                      <div className="avatar">DO</div>
                      <div>
                        <strong>Built around you</strong>
                        <span>Answers from your career profile</span>
                      </div>
                    </div>
                    <dl>
                      <div>
                        <dt>Concentration</dt>
                        <dd>Bioinformatics</dd>
                      </div>
                      <div>
                        <dt>Previous skills</dt>
                        <dd>Python, biology, data structures</dd>
                      </div>
                      <div>
                        <dt>Employment</dt>
                        <dd>Summer internship</dd>
                      </div>
                      <div>
                        <dt>Interests</dt>
                        <dd>Genomics & health-tech</dd>
                      </div>
                    </dl>
                    <span className="resume-status">
                      <Icon name="check" size={14} /> Résumé analyzed
                    </span>
                  </aside>

                  <div className="path-map-wrap">
                    <div className="path-legend">
                      <span>
                        <i className="complete-dot" /> Complete
                      </span>
                      <span>
                        <i className="current-dot" /> In progress
                      </span>
                      <span>
                        <i /> Suggested
                      </span>
                    </div>
                    <div className="path-map">
                      <svg
                        className="path-lines"
                        viewBox="0 0 680 280"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          className="line-complete"
                          d="M55 140 C110 140 120 140 175 140"
                        />
                        <path
                          className="line-active"
                          d="M215 140 C265 140 275 72 330 72"
                        />
                        <path
                          className="line-active"
                          d="M370 72 C420 72 420 140 470 140"
                        />
                        <path
                          className="line-active"
                          d="M510 140 C555 140 560 140 625 140"
                        />
                        <path d="M215 140 C265 140 275 218 330 218" />
                        <path d="M370 218 C430 218 425 155 470 140" />
                      </svg>
                      {[
                        ["foundation", "1", "AWS Cloud", "current"],
                        ["requirements", "2", "PCEP Python", "suggested"],
                        ["data", "3", "Databricks", "suggested"],
                        ["systems", "4", "SAS Base", "suggested"],
                        ["job", "5", "AWS Data", "goal"],
                        ["product", "A", "CITI + HIPAA", "alternate"],
                      ].map(([id, number, label, state]) => (
                        <button
                          key={id}
                          className={`path-node node-${id} ${state} ${
                            selectedNode === id ? "selected" : ""
                          }`}
                          onClick={() => setSelectedNode(id as PathwayNode)}
                        >
                          <span>
                            {state === "complete" ? (
                              <Icon name="check" size={17} />
                            ) : (
                              number
                            )}
                          </span>
                          <strong>{label}</strong>
                          {state === "suggested" && <small>Suggested</small>}
                          {editingPath && state !== "complete" && (
                            <b aria-hidden="true">×</b>
                          )}
                        </button>
                      ))}
                      <span className="recommended-label">
                        <Icon name="sparkles" size={14} /> Best match
                      </span>
                      <button
                        className={`path-node node-certification compact ${
                          selectedNode === "certification" ? "selected" : ""
                        }`}
                        onClick={() => setSelectedNode("certification")}
                      >
                        <span>+</span>
                        <strong>Genomics AI</strong>
                      </button>
                    </div>
                  </div>

                  <aside className="node-detail">
                    <span className="detail-kicker">
                      {pathwayNodes[selectedNode].eyebrow}
                    </span>
                    <h3>{pathwayNodes[selectedNode].title}</h3>
                    <p>{pathwayNodes[selectedNode].description}</p>
                    <div className="node-resources">
                      {pathwayNodes[selectedNode].resources.map(
                        (resource, index) => (
                          <button key={resource}>
                            <span>
                              <Icon
                                name={index === 0 ? "book" : "play"}
                                size={15}
                              />
                            </span>
                            {resource}
                            <Icon name="arrow" size={14} />
                          </button>
                        ),
                      )}
                    </div>
                    <button className="detail-button">
                      Open this step <Icon name="arrow" size={15} />
                    </button>
                    <p className="click-hint">
                      Select any certification to see its courses, practice, and
                      expected time.
                    </p>
                  </aside>
                </div>
                <div className="pathway-footer">
                  <span>
                    <Icon name="sparkles" size={15} /> This route is recommended
                    from your profile, HelixNova employee guidance, and 6 active
                    bioinformatics internships.
                  </span>
                  <button onClick={() => setSelectedNode("product")}>
                    Compare compliance route
                  </button>
                </div>
              </section>

              <div className="dashboard-grid">
                <section className="focus-card">
                  <div className="focus-top">
                    <span className="focus-icon">
                      <Icon name="sparkles" size={22} />
                    </span>
                    <span className="match-pill">Top priority</span>
                  </div>
                  <p className="eyebrow">Next best step</p>
                  <h2>Start AWS Cloud Practitioner</h2>
                  <p className="focus-description">
                    HelixNova employees identified cloud fluency as the most
                    useful missing signal for their bioinformatics data
                    internship.
                  </p>
                  <div className="focus-meta">
                    <span>
                      <Icon name="clock" size={16} /> 12 hours over 3 weeks
                    </span>
                    <span>
                      <Icon name="building" size={16} /> Suggested by HelixNova
                    </span>
                  </div>
                  <div className="focus-actions">
                    <button className="light-button">
                      <Icon name="play" size={17} /> Add to weekly plan
                    </button>
                    <button
                      className={`save-button ${saved ? "saved" : ""}`}
                      onClick={() => setSaved(!saved)}
                    >
                      {saved ? "Saved" : "Save for later"}
                    </button>
                  </div>
                </section>

                <section className="card skills-card">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Skill readiness</p>
                      <h2>Your strongest signals</h2>
                    </div>
                    <button className="text-button">
                      View assessment <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  <div className="skill-list">
                    {skills.map((skill) => (
                      <div className="skill-row" key={skill.name}>
                        <div>
                          <strong>{skill.name}</strong>
                          <span>{skill.value}%</span>
                        </div>
                        <div className="skill-track">
                          <span
                            className={skill.tone}
                            style={{ width: `${skill.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="benchmark">
                    <div className="benchmark-icon">
                      <Icon name="target" size={18} />
                    </div>
                    <p>
                      <strong>Strong academic foundation</strong>
                      <span>
                        Add two employer-requested credentials to become a
                        stronger internship match.
                      </span>
                    </p>
                  </div>
                </section>
              </div>

              <section className="recommendations">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Curated for you</p>
                    <h2>Learn from the people doing the work</h2>
                  </div>
                  <button className="text-button">
                    Browse all resources <Icon name="arrow" size={15} />
                  </button>
                </div>
                <div className="resource-grid">
                  {recommendations.map((item) => (
                    <article className="resource-card" key={item.company}>
                      <div className={`company-mark ${item.accent}`}>
                        {item.initials}
                      </div>
                      <div className="resource-content">
                        <span className="resource-tag">{item.tag}</span>
                        <h3>{item.title}</h3>
                        <p>{item.speaker}</p>
                        <span className="resource-meta">
                          <Icon name="clock" size={15} /> {item.meta}
                        </span>
                      </div>
                      <button
                        className="resource-arrow"
                        aria-label={`Open ${item.title}`}
                      >
                        <Icon name="arrow" />
                      </button>
                    </article>
                  ))}
                  <article className="resource-card opportunity-card">
                    <div className="company-mark capital">HN</div>
                    <div className="resource-content">
                      <span className="resource-tag">
                        Role-specific outreach
                      </span>
                      <h3>Ask the bioinformatics pipeline team</h3>
                      <p>2 HelixNova employees available</p>
                      <span className="resource-meta">
                        <span className="match-dot" /> Draft 3 targeted
                        questions
                      </span>
                    </div>
                    <button
                      className="resource-arrow"
                      aria-label="Open role-specific outreach"
                    >
                      <Icon name="arrow" />
                    </button>
                  </article>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      {menuOpen && (
        <button
          className="scrim"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  )
}

export default App
