import { useEffect, useRef, useState, type DragEvent } from "react"
import Icon from "./icons"
import { interests, MAX_INTERESTS, type Interest } from "./data"

type Props = {
  onBack: () => void
  selectedInterests: Interest[]
  onInterestsChange: (interests: Interest[]) => void
  onSave: (interests: Interest[]) => Promise<void>
  loadingInterests: boolean
  interestLoadError: string
}
const MAX_BIO = 400

function Dropzone({
  kind,
  accept,
  file,
  onFile,
  preview,
}: {
  kind: "photo" | "resume"
  accept: string
  file: File | null
  onFile: (f: File | null) => void
  preview?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const isPhoto = kind === "photo"

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  return (
    <div
      className={`dropzone${over ? " over" : ""}${file ? " filled" : ""}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div className="dz-file">
          {isPhoto && preview ? (
            <img src={preview} alt="Profile photo preview" />
          ) : (
            <span className="dz-icon">
              <Icon name="file" size={22} />
            </span>
          )}
          <div>
            <strong>{file.name}</strong>
            <span>{(file.size / 1024).toFixed(0)} KB · ready to save</span>
          </div>
          <button
            className="dz-remove"
            onClick={() => onFile(null)}
            aria-label={`Remove ${kind}`}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : (
        <button className="dz-empty" onClick={() => input.current?.click()}>
          <span className="dz-icon">
            <Icon name={isPhoto ? "image" : "upload"} size={22} />
          </span>
          <strong>
            {isPhoto ? "Upload profile photo" : "Upload your résumé"}
          </strong>
          <span>
            Drag a file here or <u>browse</u>
          </span>
          <small>
            {isPhoto
              ? "PNG or JPG, square works best"
              : "PDF or DOCX, up to 5 MB"}
          </small>
        </button>
      )}
    </div>
  )
}

export default function ProfileBuilder({
  onBack,
  selectedInterests,
  onInterestsChange,
  onSave,
  loadingInterests,
  interestLoadError,
}: Props) {
  const [showPw, setShowPw] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string>()
  const [resume, setResume] = useState<File | null>(null)
  const [bio, setBio] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [interestError, setInterestError] = useState("")

  useEffect(() => {
    if (!photo) return setPhotoUrl(undefined)
    const url = URL.createObjectURL(photo)
    setPhotoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const toggleInterest = (interest: Interest) => {
    setSaved(false)
    setInterestError("")
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length === 1) {
        setInterestError("Select at least one field of interest.")
        return
      }
      onInterestsChange(selectedInterests.filter((item) => item !== interest))
      return
    }
    if (selectedInterests.length < MAX_INTERESTS) {
      onInterestsChange([...selectedInterests, interest])
    }
  }

  const complete =
    40 +
    (photo ? 15 : 0) +
    (resume ? 20 : 0) +
    (bio.trim().length > 20 ? 25 : 0)

  return (
    <>
      <section className="welcome">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb">
            <button onClick={onBack}>News Feed</button>
            <Icon name="arrow" size={12} />
            <span>Profile Builder</span>
          </nav>
          <h1>Build your profile.</h1>
          <p>
            Employers see this when you save a project or reach out. Start with
            the basics.
          </p>
        </div>
        <div className="pb-meter" aria-label={`Profile ${complete}% complete`}>
          <strong>{complete}%</strong>
          <span>complete</span>
          <div className="skill-track">
            <span className="indigo" style={{ width: `${complete}%` }} />
          </div>
        </div>
      </section>

      <div className="pb-grid">
        <section className="card pb-card">
          <p className="eyebrow">From onboarding</p>
          <h2>Account basics</h2>
          <label className="field">
            <span>Email</span>
            <div className="input-wrap">
              <Icon name="mail" size={17} />
              <input
                type="email"
                defaultValue="dakota.oregon@university.edu"
                autoComplete="email"
              />
            </div>
          </label>
          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <Icon name="lock" size={17} />
              <input
                type={showPw ? "text" : "password"}
                defaultValue="skillsync-demo"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
              >
                <Icon name="eye" size={17} />
              </button>
            </div>
          </label>
          <p className="field-hint">
            <Icon name="check" size={13} /> Verified by your academic advisor
            invite.
          </p>
        </section>

        <section className="card pb-card">
          <p className="eyebrow">Uploads</p>
          <h2>Photo and résumé</h2>
          <div className="dz-grid">
            <Dropzone
              kind="photo"
              accept="image/*"
              file={photo}
              onFile={setPhoto}
              preview={photoUrl}
            />
            <Dropzone
              kind="resume"
              accept=".pdf,.doc,.docx"
              file={resume}
              onFile={setResume}
            />
          </div>
        </section>

        <section className="card pb-card pb-wide">
          <p className="eyebrow">Make it yours</p>
          <h2>About you</h2>
          <div className="pb-two">
            <label className="field">
              <span>About me</span>
              <textarea
                value={bio}
                maxLength={MAX_BIO}
                rows={6}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell employers who you are: what you study, what you have built, and what you want to learn next."
              />
              <small className="counter">
                {bio.length} / {MAX_BIO}
              </small>
            </label>
            <div className="field">
              <span id="interest-label">Fields of interest</span>
              <p className="field-hint">
                Select up to {MAX_INTERESTS} fields. Your pathway and
                recommendations will reflect your selections.
              </p>
              <div className="chip-row">
                {interests.map((i) => (
                  <button
                    key={i}
                    type="button"
                    className={
                      selectedInterests.includes(i) ? "chip active" : "chip"
                    }
                    aria-pressed={selectedInterests.includes(i)}
                    aria-label={
                      selectedInterests.includes(i)
                        ? `Remove ${i}`
                        : `Add ${i}`
                    }
                    disabled={
                      loadingInterests ||
                      saving ||
                      (!selectedInterests.includes(i) &&
                        selectedInterests.length >= MAX_INTERESTS)
                    }
                    onClick={() => toggleInterest(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <small className="counter">
                {selectedInterests.length} / {MAX_INTERESTS} selected
              </small>
              {loadingInterests && (
                <p className="field-hint">Loading saved interests…</p>
              )}
              {(interestError || interestLoadError) && (
                <p className="interest-error" role="alert">
                  {interestError || interestLoadError}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="pb-actions">
        <button className="edit-path" onClick={onBack}>
          Back to News Feed
        </button>
        <button
          className="primary-button"
          disabled={saving || loadingInterests}
          onClick={async () => {
            setSaving(true)
            setInterestError("")
            try {
              await onSave(selectedInterests)
              setSaved(true)
              setTimeout(() => setSaved(false), 2200)
            } catch (error) {
              setInterestError(
                error instanceof Error
                  ? error.message
                  : "Could not save your profile.",
              )
            } finally {
              setSaving(false)
            }
          }}
        >
          <Icon name="check" size={17} />{" "}
          {saving ? "Saving…" : saved ? "Profile saved" : "Save profile"}
        </button>
      </div>
    </>
  )
}
