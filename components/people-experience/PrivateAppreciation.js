"use client";

import { useMemo, useState } from "react";
import {
  formatHiissaGlobalRecordTime,
  hiissaResolvedLocale,
  hiissaResolvedTimeZone,
} from "../../lib/hiissa-record-time";
import {
  HIISSA_PROTOTYPE_STAFF_DEPARTMENTS,
  HIISSA_PROTOTYPE_STAFF,
} from "../../lib/hiissa-prototype-staff-directory.js";
import styles from "./PrivateAppreciation.module.css";

const MAX_MESSAGE_LENGTH = 320;

const DEMO_DEPARTMENTS = HIISSA_PROTOTYPE_STAFF_DEPARTMENTS;

const CATEGORIES = Object.freeze([
  "Thank you",
  "Excellent customer care",
  "Going the extra mile",
  "Teamwork",
  "Growth & improvement",
  "Helping a colleague",
  "Handling a difficult situation well",
  "Consistency & reliability",
  "Milestone or achievement",
  "Something else",
]);

const TONES = Object.freeze([
  "Warm",
  "Professional",
  "Encouraging",
  "Celebratory",
  "Short",
  "Heartfelt",
]);

const CATEGORY_REASON = Object.freeze({
  "Thank you": "the care and effort you continue to bring to your work",
  "Excellent customer care": "the patience, care and respect you bring to the people you support",
  "Going the extra mile": "the extra thought and effort you gave when more was needed",
  Teamwork: "the way you supported the people around you and contributed to the team",
  "Growth & improvement": "the progress, reflection and steady effort you have shown",
  "Helping a colleague": "the generosity and care you showed in helping a colleague",
  "Handling a difficult situation well": "the calm judgement and care you brought to a difficult situation",
  "Consistency & reliability": "the steady care, reliability and attention you continue to bring",
  "Milestone or achievement": "the work and commitment behind this meaningful milestone",
  "Something else": "the contribution you made and the care you brought to it",
});

function hiissaSuggestions(category, tone, offset = 0) {
  const reason = CATEGORY_REASON[category] || CATEGORY_REASON["Something else"];
  const sets = {
    Warm: [
      `Thank you for ${reason}. It has been noticed, and I want you to know that your contribution is genuinely appreciated.`,
      `I wanted to take a quiet moment to recognise ${reason}. Thank you for what you continue to bring to HIISSA.`,
      `Your contribution matters. Thank you for ${reason}, and for the thoughtful way you continue to show up in your work.`,
    ],
    Professional: [
      `I would like to recognise ${reason}. Thank you for the professionalism, care and attention you continue to bring to your work.`,
      `Thank you for ${reason}. Your contribution has been noticed and is sincerely appreciated.`,
      `I want to acknowledge ${reason}. Thank you for the thoughtful and professional contribution you continue to make.`,
    ],
    Encouraging: [
      `I want you to know that ${reason} has been noticed. Please keep bringing that same care and thoughtfulness to your work.`,
      `Thank you for ${reason}. The progress and care behind your contribution are worth recognising.`,
      `Your effort has not gone unnoticed. Thank you for ${reason}, and for continuing to grow with care and purpose.`,
    ],
    Celebratory: [
      `It is worth taking a moment to recognise ${reason}. Thank you, and well done on a contribution that deserves to be acknowledged.`,
      `Today I want to celebrate ${reason}. Thank you for the care and commitment behind it.`,
      `This is a meaningful moment to recognise ${reason}. Thank you for the contribution you have made.`,
    ],
    Short: [
      `Thank you for ${reason}. Your contribution is noticed and appreciated.`,
      `I appreciate ${reason}. Thank you for the care you bring to HIISSA.`,
      `Your effort matters. Thank you for ${reason}.`,
    ],
    Heartfelt: [
      `I wanted to personally thank you for ${reason}. The care behind what you do matters, and I genuinely appreciate your contribution.`,
      `There are moments when it is important simply to say thank you. I have noticed ${reason}, and I am sincerely grateful for it.`,
      `Thank you for ${reason}. I hope you know that the care, thought and effort behind your contribution are genuinely valued.`,
    ],
  };
  const pool = sets[tone] || sets.Warm;
  return [0, 1, 2].map((index) => pool[(index + offset) % pool.length]);
}

const ALL_DEMO_PEOPLE = HIISSA_PROTOTYPE_STAFF;

function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "there";
}

export default function PrivateAppreciation({
  mode = "founder-preview",
  isFounderPreview = false,
}) {
  const [departmentId, setDepartmentId] = useState("customer_support");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [writingMode, setWritingMode] = useState("help");
  const [messageMode, setMessageMode] = useState("same");
  const [category, setCategory] = useState("Thank you");
  const [tone, setTone] = useState("Warm");
  const [suggestionOffset, setSuggestionOffset] = useState(0);
  const [message, setMessage] = useState("");
  const [personalised, setPersonalised] = useState({});
  const [founderNote, setFounderNote] = useState("");
  const [deliveryTiming, setDeliveryTiming] = useState("now");
  const [preview, setPreview] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const selectedPeople = useMemo(
    () => ALL_DEMO_PEOPLE.filter((person) => selectedIds.includes(person.id)),
    [selectedIds]
  );

  const visiblePeople = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    return ALL_DEMO_PEOPLE.filter((person) => {
      const departmentMatch =
        departmentId === "all" || person.departmentId === departmentId;
      if (!departmentMatch) return false;
      if (!normalised) return true;
      return (
        person.name.toLowerCase().includes(normalised) ||
        person.role.toLowerCase().includes(normalised) ||
        person.departmentLabel.toLowerCase().includes(normalised)
      );
    });
  }, [departmentId, query]);

  const suggestions = useMemo(
    () => hiissaSuggestions(category, tone, suggestionOffset),
    [category, tone, suggestionOffset]
  );

  const selectedDepartments = new Set(
    selectedPeople.map((person) => person.departmentId)
  ).size;

  if (mode === "recipient-empty") {
    return (
      <section className={styles.recipientSurface} aria-label="Private Appreciation & Recognition">
        <div className={styles.kicker}>HIISSA · PRIVATE APPRECIATION & RECOGNITION</div>
        <div className={styles.surfaceHeading}>
          <div>
            <h3>A private place for recognition</h3>
            <p>
              Appreciation is private by default. It is not a score, ranking,
              leaderboard or popularity signal.
            </p>
          </div>
          <span className={styles.foundationPill}>STAGING FOUNDATION</span>
        </div>

        <div className={styles.emptyState}>
          <strong>No saved appreciation source is connected yet.</strong>
          <p>
            This Staging interface does not fetch, store or deliver appreciation
            messages. When the real delivery layer is separately approved, a
            staff member will receive their own private card here and may later
            revisit it in My Appreciations.
          </p>
          <p>
            A future optional response can be simple and human, such as
            “Thank you” or “This meant a lot”. A response will never be required.
          </p>
          {isFounderPreview ? (
            <small>
              Founder Preview — no appreciation is being delivered to a real staff member.
            </small>
          ) : null}
        </div>
      </section>
    );
  }

  function togglePerson(id) {
    setPreview(null);
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function selectVisible() {
    setPreview(null);
    setSelectedIds((current) =>
      Array.from(new Set([...current, ...visiblePeople.map((person) => person.id)]))
    );
  }

  function clearVisible() {
    const visible = new Set(visiblePeople.map((person) => person.id));
    setPreview(null);
    setSelectedIds((current) => current.filter((id) => !visible.has(id)));
  }

  function useSuggestion(value) {
    setMessage(value.slice(0, MAX_MESSAGE_LENGTH));
    setWritingMode("self");
    setPreview(null);
  }

  function personalisedMessage(person) {
    return (
      personalised[person.id] ||
      (message
        ? `${firstName(person.name)}, ${message.charAt(0).toLowerCase()}${message.slice(1)}`
        : "")
    );
  }

  function updatePersonalised(person, value) {
    setPersonalised((current) => ({
      ...current,
      [person.id]: value.slice(0, MAX_MESSAGE_LENGTH),
    }));
    setPreview(null);
  }

  function savePreviewDraft() {
    setDraftSaved(true);
  }

  function buildReview() {
    if (!selectedPeople.length || !message.trim()) return;
    const timestamp = new Date();
    setPreview({
      timestamp,
      people: selectedPeople,
      message: message.trim(),
      messageMode,
      deliveryTiming,
    });
  }

  return (
    <section className={styles.founderSurface} aria-label="Private Appreciation & Recognition preview">
      <div className={styles.kicker}>HIISSA · PEOPLE EXPERIENCE</div>
      <div className={styles.surfaceHeading}>
        <div>
          <h3>Private Appreciation & Recognition</h3>
          <p>
            One private recognition space for one person, a team, or selected
            people across departments — without competition or performance scoring.
          </p>
        </div>
        <span className={styles.foundationPill}>STAGING · PREVIEW ONLY</span>
      </div>

      <div className={styles.identityNotice}>
        <strong>HIISSA writing identity</strong>
        <span>
          Warm · calm · kind · respectful · emotionally intelligent · grounded · non-judgmental.
          HIISSA helps you find the words; it does not invent achievements and it never auto-sends.
        </span>
      </div>

      <div className={styles.appreciationMoment}>
        <div>
          <span className={styles.previewLabel}>APPRECIATION MOMENT</span>
          <strong>Is there someone whose contribution you would like to recognise today?</strong>
        </div>
        <span>Optional, never a pressure or performance prompt.</span>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.stepHeading}>
          <span>1</span>
          <div>
            <strong>Choose who you want to appreciate</strong>
            <small>Fictional Staging directory — no real employee records.</small>
          </div>
        </div>

        <div className={styles.departmentChips}>
          <button
            type="button"
            className={departmentId === "all" ? styles.choiceActive : styles.choice}
            onClick={() => setDepartmentId("all")}
          >
            All departments
          </button>
          {DEMO_DEPARTMENTS.map((department) => (
            <button
              type="button"
              key={department.id}
              className={departmentId === department.id ? styles.choiceActive : styles.choice}
              onClick={() => setDepartmentId(department.id)}
            >
              {department.label}
            </button>
          ))}
        </div>

        <div className={styles.directoryTools}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a person, role or department…"
            aria-label="Search fictional Staging staff"
          />
          <button type="button" className={styles.secondaryButton} onClick={selectVisible}>
            Select all shown
          </button>
          <button type="button" className={styles.textButton} onClick={clearVisible}>
            Clear shown
          </button>
        </div>

        <div className={styles.peopleGrid}>
          {visiblePeople.map((person) => (
            <label className={styles.personCard} key={person.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(person.id)}
                onChange={() => togglePerson(person.id)}
              />
              <span>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
                <small>{person.departmentLabel}</small>
              </span>
            </label>
          ))}
        </div>

        <div className={styles.selectionSummary}>
          <strong>{selectedPeople.length} people selected</strong>
          <span>
            {selectedPeople.length
              ? `across ${selectedDepartments} department${selectedDepartments === 1 ? "" : "s"}`
              : "Choose one person, several people, a whole department, or people across departments."}
          </span>
        </div>

        <div className={styles.savedGroups}>
          <span className={styles.previewLabel}>QUICK GROUP EXAMPLES · CURRENT SESSION ONLY</span>
          <button
            type="button"
            className={styles.textButton}
            onClick={() =>
              setSelectedIds(
                ALL_DEMO_PEOPLE.filter((person) => person.departmentId === "customer_support").map((person) => person.id)
              )
            }
          >
            Customer Support team
          </button>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setSelectedIds(["demo-sarah", "demo-john", "demo-amina"])}
          >
            Cross-department example
          </button>
          <small>Persistent saved groups/favourites will require the later approved data layer.</small>
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.stepHeading}>
          <span>2</span>
          <div>
            <strong>Choose how you want to write</strong>
            <small>You stay in control of the meaning and the final words.</small>
          </div>
        </div>

        <div className={styles.modeRow}>
          <button
            type="button"
            className={writingMode === "self" ? styles.choiceActive : styles.choice}
            onClick={() => setWritingMode("self")}
          >
            Write it myself
          </button>
          <button
            type="button"
            className={writingMode === "help" ? styles.choiceActive : styles.choice}
            onClick={() => setWritingMode("help")}
          >
            Help me write it
          </button>
        </div>

        {writingMode === "help" ? (
          <div className={styles.writingHelp}>
            <div className={styles.helpControls}>
              <label>
                What would you like to recognise?
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                How should it feel?
                <select value={tone} onChange={(event) => setTone(event.target.value)}>
                  {TONES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>

            <div className={styles.suggestionHeader}>
              <strong>HIISSA suggestions</strong>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => setSuggestionOffset((value) => (value + 1) % 3)}
              >
                Give me more suggestions
              </button>
            </div>

            <div className={styles.suggestionGrid}>
              {suggestions.map((suggestion, index) => (
                <article className={styles.suggestionCard} key={`${tone}-${category}-${index}`}>
                  <p>{suggestion}</p>
                  <button type="button" className={styles.secondaryButton} onClick={() => useSuggestion(suggestion)}>
                    Use this suggestion
                  </button>
                </article>
              ))}
            </div>

            <p className={styles.safetyNote}>
              This Staging foundation uses curated HIISSA-aligned examples to demonstrate the approved
              writing behaviour. No external AI-generation service is connected yet, and HIISSA does not
              invent a reason for praise.
            </p>
          </div>
        ) : null}

        <div className={styles.composePanel}>
          <label htmlFor="hiissa-private-appreciation-message">
            Your private appreciation
          </label>
          <textarea
            id="hiissa-private-appreciation-message"
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setDraftSaved(false);
              setPreview(null);
            }}
            placeholder="Write a sincere private note of appreciation…"
          />
          <div className={styles.composeMeta}>
            <span>{message.length}/{MAX_MESSAGE_LENGTH}</span>
            <span>Current browser session only · not stored</span>
          </div>
        </div>

        <div className={styles.messageMode}>
          <span>For several recipients:</span>
          <button
            type="button"
            className={messageMode === "same" ? styles.choiceActive : styles.choice}
            onClick={() => setMessageMode("same")}
          >
            Same message for everyone
          </button>
          <button
            type="button"
            className={messageMode === "personalised" ? styles.choiceActive : styles.choice}
            onClick={() => setMessageMode("personalised")}
          >
            Personalise for each person
          </button>
        </div>

        {messageMode === "personalised" && selectedPeople.length ? (
          <div className={styles.personalisedList}>
            {selectedPeople.map((person) => (
              <details key={person.id}>
                <summary>{person.name} · {person.departmentLabel}</summary>
                <textarea
                  rows={4}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={personalisedMessage(person)}
                  onChange={(event) => updatePersonalised(person, event.target.value)}
                  aria-label={`Personalised appreciation for ${person.name}`}
                />
              </details>
            ))}
          </div>
        ) : null}

        <label className={styles.founderNote}>
          Optional Founder-only context note
          <textarea
            rows={2}
            value={founderNote}
            onChange={(event) => setFounderNote(event.target.value)}
            placeholder="Private context for your own future reference — never a hidden performance score."
          />
          <small>Not shown to the recipient. Not stored in this Staging foundation.</small>
        </label>

        <div className={styles.draftRow}>
          <button type="button" className={styles.secondaryButton} onClick={savePreviewDraft}>
            Save draft for this preview
          </button>
          {draftSaved ? <span>Draft held in this browser session only.</span> : null}
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.stepHeading}>
          <span>3</span>
          <div>
            <strong>Choose delivery timing</strong>
            <small>Global behaviour must respect the recipient’s local context.</small>
          </div>
        </div>

        <div className={styles.modeRow}>
          <button
            type="button"
            className={deliveryTiming === "now" ? styles.choiceActive : styles.choice}
            onClick={() => setDeliveryTiming("now")}
          >
            Send now
          </button>
          <button
            type="button"
            className={deliveryTiming === "local-hours" ? styles.choiceActive : styles.choice}
            onClick={() => setDeliveryTiming("local-hours")}
          >
            Deliver in recipient’s local working hours
          </button>
        </div>
        <p className={styles.safetyNote}>
          Scheduling is not connected yet. The final service must preserve one authoritative timestamp
          while displaying date, day and time appropriately for each viewer’s locale and timezone.
        </p>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.stepHeading}>
          <span>4</span>
          <div>
            <strong>Review before anything can be sent</strong>
            <small>Exact people, departments, message and timing must be visible first.</small>
          </div>
        </div>

        <button
          type="button"
          className={styles.previewButton}
          disabled={!selectedPeople.length || !message.trim()}
          onClick={buildReview}
        >
          Preview final delivery
        </button>

        {preview ? (
          <div className={styles.finalReview}>
            <div className={styles.reviewTop}>
              <div>
                <span className={styles.previewLabel}>FINAL STAGING REVIEW</span>
                <h4>
                  {preview.people.length} private appreciation
                  {preview.people.length === 1 ? "" : "s"} · {selectedDepartments} department
                  {selectedDepartments === 1 ? "" : "s"}
                </h4>
              </div>
              <span className={styles.foundationPill}>NOT SENT</span>
            </div>

            <div className={styles.recipientReviewList}>
              {preview.people.map((person) => (
                <article key={person.id}>
                  <div>
                    <strong>{person.name}</strong>
                    <span>{person.departmentLabel} · {person.role}</span>
                  </div>
                  <small>
                    Viewer-local preview: {formatHiissaGlobalRecordTime(preview.timestamp, {
                      locale: person.locale,
                      timeZone: person.timeZone,
                    })}
                  </small>
                  <p>
                    {preview.messageMode === "personalised"
                      ? personalisedMessage(person)
                      : preview.message}
                  </p>
                  <small>
                    Future route: permanent staff identity → private workspace notification.
                    Other recipients remain hidden.
                  </small>
                </article>
              ))}
            </div>

            <div className={styles.globalEvidence}>
              <strong>Founder-side timestamp preview</strong>
              <span>
                {formatHiissaGlobalRecordTime(preview.timestamp, {
                  locale: hiissaResolvedLocale(),
                  timeZone: hiissaResolvedTimeZone(),
                })}
              </span>
              <small>
                Authoritative instant preserved: {preview.timestamp.toISOString()}.
                {preview.deliveryTiming === "local-hours"
                  ? " Real delivery would wait for each recipient’s configured local working-hours policy."
                  : " Real delivery would use the approved immediate-delivery path."}
              </small>
            </div>

            <div className={styles.deliveryBoundary}>
              <strong>Preview complete — there is deliberately no Send button yet.</strong>
              <p>
                No appreciation was sent, scheduled or stored. Real delivery, duplicate-send protection,
                delivery status, history, staff replies and My Appreciations require the separately approved
                persistence and permissions layer.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.boundaryNote}>
        <strong>Protected boundary:</strong> no leaderboard, popularity score, positivity score,
        employee ranking, public comparison or hidden performance consequence. Bulk recognition remains
        private person-by-person delivery.
      </div>
    </section>
  );
}
