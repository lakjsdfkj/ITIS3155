import { useEffect, useMemo, useRef, useState } from "react"
import Icon, { type IconName } from "./icons"
import Feed from "./Feed"
import Handbook from "./Handbook"
import ProfileBuilder from "./ProfileBuilder"
import RollingFeed from "./RollingFeed"
import { interests, isInterestSelection, type Interest } from "./data"
import { getPathwayNodes, pathwayNodes, type PathwayNode } from "./pathways"

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
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([
    "Bioinformatics",
  ])
  const [loadingInterests, setLoadingInterests] = useState(true)
  const [interestLoadError, setInterestLoadError] = useState("")
  const [skillId, setSkillId] = useState("python")
  const [cameFrom, setCameFrom] = useState("News Feed")
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<PathwayNode>("foundation")
  const [editingPath, setEditingPath] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const pathwayNodeIds = useMemo(
    () => getPathwayNodes(selectedInterests),
    [selectedInterests],
  )
  const pathwayConnections = useMemo(
    () =>
      pathwayNodeIds.slice(1).map((to, index) => {
        const from = pathwayNodeIds[index]
        if (!from) throw new Error("Pathway node sequence is invalid.")
        return { from, to }
      }),
    [pathwayNodeIds],
  )

  useEffect(() => {
    if (!pathwayNodeIds.includes(selectedNode)) {
      setSelectedNode(pathwayNodeIds[0] ?? "foundation")
    }
  }, [pathwayNodeIds, selectedNode])

  useEffect(() => {
    let active = true

    fetch("/api/profile/interests")
      .then(async (response) => {
        const result = (await response.json()) as {
          interests?: unknown
          error?: string
        }
        if (!response.ok) {
          throw new Error(result.error ?? "Could not load saved interests.")
        }
        if (!isInterestSelection(result.interests)) {
          throw new Error("The saved interests response was invalid.")
        }
        return result.interests
      })
      .then((savedInterests) => {
        if (active) setSelectedInterests(savedInterests)
      })
      .catch((error: unknown) => {
        if (active) {
          setInterestLoadError(
            error instanceof Error
              ? error.message
              : "Could not load saved interests.",
          )
        }
      })
      .finally(() => {
        if (active) setLoadingInterests(false)
      })

    return () => {
      active = false
    }
  }, [])

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
  const saveInterests = async (interests: Interest[]) => {
    const response = await fetch("/api/profile/interests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests }),
    })
    const result = (await response.json()) as {
      interests?: unknown
      error?: string
    }
    if (!response.ok) {
      throw new Error(result.error ?? "Could not save your fields of interest.")
    }
    if (!isInterestSelection(result.interests)) {
      throw new Error("The saved interests response was invalid.")
    }
    setInterestLoadError("")
    setSelectedInterests(result.interests)
  }
  const firstPathwayNode = pathwayNodes[pathwayNodeIds[0] ?? "foundation"]
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
          <p>Based on your {selectedInterests.join(" and ")} interests.</p>
          <button>
            View matches <Icon name="arrow" size={15} />
          </button>
        </div>
        <div className="profile">
          <div className="avatar">DO</div>
          <div>
            <strong>Dakota Oregon</strong>
            <span>Computer Science · {selectedInterests.join(", ")}</span>
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
              placeholder={
                activeNav === "News Feed"
                  ? "Search news, people, or companies..."
                  : "Search listings, companies, skills..."
              }
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
          {activeNav === "News Feed" && (
            <RollingFeed query={searchQuery} />
          )}
          {activeNav === "Opportunities" && (
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
            <ProfileBuilder
              onBack={() => go("News Feed")}
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
              onSave={saveInterests}
              loadingInterests={loadingInterests}
              interestLoadError={interestLoadError}
            />
          )}
          {isOverview && (
            <>
              <section className="welcome">
                <div>
                  <p className="kicker">Monday, October 12</p>
                  <h1>Good morning, Dakota.</h1>
                  <p>
                    Your {selectedInterests.join(" and ")} career plan is taking
                    shape. Here’s where to focus next.
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
                      {selectedInterests.join(" + ")} · Certification pathway
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
                        <dd>{selectedInterests.join(", ")}</dd>
                      </div>
                    </dl>
                    <span className="resume-status">
                      <Icon name="check" size={14} /> Résumé analyzed
                    </span>
                  </aside>

                  <div className="path-map-wrap">
                    <div className="path-legend">
                      <span>
                        <i className="current-dot" /> Start
                      </span>
                      <span>
                        <i /> Recommended steps
                      </span>
                    </div>
                    <div className="path-map">
                      <svg
                        className="path-lines"
                        viewBox="0 0 680 280"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        {pathwayConnections.map(({ from, to }) => {
                          const start = pathwayNodes[from].position
                          const end = pathwayNodes[to].position
                          const controlX = (start.x + end.x) / 2
                          return (
                            <path
                              key={`${from}-${to}`}
                              className="line-active"
                              d={`M ${start.x} ${start.y} C ${controlX} ${start.y}, ${controlX} ${end.y}, ${end.x} ${end.y}`}
                            />
                          )
                        })}
                      </svg>
                      {pathwayNodeIds.map((id, index) => {
                        const node = pathwayNodes[id]
                        const state =
                          index === 0
                            ? "current"
                            : index === pathwayNodeIds.length - 1
                              ? "goal"
                              : "suggested"
                        return (
                          <button
                            key={id}
                            className={`path-node ${state} ${
                              selectedNode === id ? "selected" : ""
                            }`}
                            style={{
                              left: `calc(${node.position.left}% - 40px)`,
                              top: node.position.top,
                            }}
                            onClick={() => setSelectedNode(id)}
                          >
                            <span>{index + 1}</span>
                            <strong>{node.label}</strong>
                            {state === "suggested" && <small>Suggested</small>}
                            {editingPath && <b aria-hidden="true">×</b>}
                          </button>
                        )
                      })}
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
                    across {selectedInterests.length} selected field
                    {selectedInterests.length === 1 ? "" : "s"} in your profile.
                  </span>
                  {pathwayNodeIds.includes("product") && (
                    <button onClick={() => setSelectedNode("product")}>
                      View compliance step
                    </button>
                  )}
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
                  <h2>Start {firstPathwayNode.title}</h2>
                  <p className="focus-description">
                    {firstPathwayNode.description}
                  </p>
                  <div className="focus-meta">
                    <span>
                      <Icon name="clock" size={16} /> 12 hours over 3 weeks
                    </span>
                    <span>
                      <Icon name="building" size={16} /> Recommended for{" "}
                      {selectedInterests.join(", ")}
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
