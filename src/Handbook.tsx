import Icon from "./icons"
import { handbook } from "./data"

type Props = {
  skillId: string
  onSelect: (id: string) => void
  onBack: () => void
  backLabel: string
}

export default function Handbook({
  skillId,
  onSelect,
  onBack,
  backLabel,
}: Props) {
  const skill = handbook.find((h) => h.id === skillId) ?? handbook[0]
  return (
    <>
      <section className="welcome">
        <div>
          <button className="back-link" onClick={onBack}>
            <Icon name="arrow" size={14} /> Back to {backLabel}
          </button>
          <p className="kicker">Skill handbook</p>
          <h1>{skill.name}</h1>
          <p>{skill.summary}</p>
        </div>
      </section>
      <div className="handbook-layout">
        <nav className="card handbook-list" aria-label="Handbook pages">
          {handbook.map((h) => (
            <button
              key={h.id}
              className={h.id === skill.id ? "active" : ""}
              onClick={() => onSelect(h.id)}
            >
              {h.name}
              <small>{h.level}</small>
            </button>
          ))}
        </nav>
        <article className="card handbook-page">
          <div className="handbook-meta">
            <span className="field-pill">{skill.level}</span>
            <span>
              <Icon name="clock" size={14} /> {skill.hours} to get job-ready
            </span>
          </div>
          <h3>Why employers ask for it</h3>
          <p>{skill.why}</p>
          <h3>What to learn</h3>
          <ul className="deliverables">
            {skill.learn.map((l) => (
              <li key={l}>
                <Icon name="check" size={14} /> {l}
              </li>
            ))}
          </ul>
          <div className="benchmark">
            <div className="benchmark-icon">
              <Icon name="target" size={18} />
            </div>
            <p>
              <strong>Prove it: {skill.credential}</strong>
              <span>
                This credential is already mapped on your certification pathway.
              </span>
            </p>
          </div>
        </article>
      </div>
    </>
  )
}
