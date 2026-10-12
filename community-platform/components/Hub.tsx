"use client";
import { useEffect, useState, FormEvent } from "react";
type Row = Record<string, any>;
async function api(path: string, data?: Row) {
  const r = await fetch(
    path,
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : { cache: "no-store" },
  );
  const j = await r.json();
  if (!r.ok) throw Error(j.error || "Request failed");
  return j;
}
const date = (n: number) => new Date(n).toLocaleDateString("en-IN");
function Form({
  children,
  onSubmit,
  label = "Save",
}: {
  children: React.ReactNode;
  onSubmit: (b: Row) => Promise<void>;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="hub-form"
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (busy) return;
        const b = Object.fromEntries(new FormData(e.currentTarget));
        setBusy(true);
        try {
          await onSubmit(b);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      <button disabled={busy} className="primary">
        {busy ? "Working…" : label}
      </button>
    </form>
  );
}
function Finder({
  label,
  onPick,
}: {
  label: string;
  onPick: (p: Row) => void;
}) {
  const [items, setItems] = useState<Row[]>([]),
    [err, setErr] = useState("");
  return (
    <div className="hub-finder">
      <Form
        label="Search profiles"
        onSubmit={async (b) => {
          try {
            setItems(
              (
                await api(
                  "/api/members?action=search&q=" + encodeURIComponent(b.q),
                )
              ).people,
            );
            setErr("");
          } catch (e) {
            setErr((e as Error).message);
          }
        }}
      >
        <label>
          {label}
          <input
            name="q"
            required
            minLength={2}
            placeholder="Name or village / नाम या गाँव"
          />
        </label>
      </Form>
      {err && <p role="alert">{err}</p>}
      <div className="hub-results">
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              onPick(p);
              setItems([]);
            }}
          >
            {p.name}
            <small>{p.village}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
export default function Hub() {
  const [me, setMe] = useState<Row | null>(null),
    [state, setState] = useState<Row | null>(null),
    [archive, setArchive] = useState<Row[]>([]),
    [content, setContent] = useState<Row[]>([]),
    [tab, setTab] = useState("villages"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [hi, setHi] = useState(false);
  const [village, setVillage] = useState(""),
    [filter, setFilter] = useState(""),
    [people, setPeople] = useState<Row[]>([]),
    [conversation, setConversation] = useState(""),
    [from, setFrom] = useState<Row | null>(null),
    [researchPerson, setResearchPerson] = useState<Row | null>(null),
    [to, setTo] = useState<Row | null>(null),
    [path, setPath] = useState<Row | null>(null),
    [answer, setAnswer] = useState<Row | null>(null),
    [media, setMedia] = useState(""),
    [uploading, setUploading] = useState(false);
  const t = (en: string, hn: string) => (hi ? hn : en);
  async function refresh() {
    const m = await api("/api/members?action=state");
    setMe(m);
    if (m.actor.verified) {
      const [s, c, h] = await Promise.all([
        api("/api/hub"),
        api("/api/hub?action=content"),
        api("/api/research"),
      ]);
      setState(s);
      setContent(c);
      setArchive(h.villages);
    }
  }
  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!me) return;
    let last = Date.now();
    const active = () => {
      last = Date.now();
    };
    const timer = window.setInterval(() => {
      if (Date.now() - last >= 30 * 60 * 1000) {
        setMe(null);
        setState(null);
        setContent([]);
        setPeople([]);
        setAnswer(null);
        setPath(null);
        setError("Your session has been idle for 30 minutes. Sign in again.");
        api("/api/members", { action: "logout" }).catch(() => {});
      }
    }, 15000);
    window.addEventListener("pointerdown", active);
    window.addEventListener("keydown", active);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", active);
      window.removeEventListener("keydown", active);
    };
  }, [me?.actor.id]);
  async function act(action: string, b: Row = {}) {
    setError("");
    setNotice("");
    try {
      await api("/api/hub", { action, ...b });
      await refresh();
      setNotice("Saved. / सुरक्षित किया गया।");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function research(b: Row) {
    setError("");
    setAnswer(null);
    try {
      setAnswer(
        await api("/api/research", {
          ...b,
          person: researchPerson?.id,
          ai: b.ai === "on",
          consent: b.consent === "on",
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const selected = archive.find((v) => v.name === village),
    thread = state?.conversations.find((c: Row) => c.id === conversation),
    admin = me?.actor.role === "admin";
  if (loading)
    return (
      <main className="hub-wrap">
        <p>Opening your community…</p>
      </main>
    );
  if (!me?.actor.verified)
    return (
      <main className="hub-wrap">
        <section className="hub-card">
          <h1>Your community, with trust.</h1>
          <p>
            {me
              ? "Your family profile needs independent verification before you can browse community records or contact members."
              : "Sign in to explore the community archive and meet verified members."}
          </p>
          <p role="alert">{error}</p>
          <a className="button primary" href="/members">
            Sign in & verify your profile
          </a>
          {me && (
            <>
              <p>
                <a
                  href="/api/hub?action=export"
                  download="luhach-my-records.json"
                >
                  Download my account data
                </a>
              </p>
              <details>
                <summary>Close my unverified account</summary>
                <p>
                  Login credentials are removed and pending requests are
                  withdrawn. Audit evidence and prior contributions are
                  retained.
                </p>
                <Form
                  label="Close my account permanently"
                  onSubmit={async (b) => {
                    try {
                      if (b.confirm !== "CLOSE")
                        throw Error("Type CLOSE to confirm.");
                      await api("/api/hub", { action: "close", ...b });
                      window.location.href = "/";
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  <label>
                    Current password
                    <input
                      type="password"
                      name="password"
                      required
                      autoComplete="current-password"
                    />
                  </label>
                  <label>
                    Type CLOSE
                    <input name="confirm" required pattern="CLOSE" />
                  </label>
                </Form>
              </details>
            </>
          )}
        </section>
      </main>
    );
  return (
    <main className="hub-wrap">
      <header className="hub-title">
        <div>
          <span className="eyebrow">लुहाच परिवार · COMMUNITY</span>
          <p className="hub-help">Signed in as {me.actor.name}</p>
          <h1>
            {t("Our stories. Our people.", "अपनी कहानियाँ। अपना परिवार।")}
          </h1>
          <p>
            {t(
              "A living archive, built together and shared by choice.",
              "मिलकर सहेजी विरासत, अपनी सहमति से साझा करें।",
            )}
          </p>
        </div>
        <button onClick={() => setHi(!hi)}>{hi ? "English" : "हिन्दी"}</button>
      </header>
      <nav className="hub-tabs" aria-label="Community sections">
        {[
          ["villages", "Villages", "गाँव"],
          ["stories", "Stories & photos", "कहानियाँ और तस्वीरें"],
          ["connect", "Find members", "सदस्य खोजें"],
          ["inbox", "Messages", "संदेश"],
          ["research", "Ask the archive", "विरासत से पूछें"],
          ["account", "My data", "मेरा डेटा"],
          ...(admin ? [["moderate", "Review desk", "समीक्षा"]] : []),
        ].map(([id, en, hn]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => {
              setTab(id);
              setError("");
              setNotice("");
            }}
          >
            {t(en, hn)}
          </button>
        ))}
      </nav>
      {error && (
        <p className="hub-alert" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="hub-notice" role="status">
          {notice}
        </p>
      )}
      {tab === "villages" && (
        <>
          <div className="hub-section-title">
            <h2>
              {t("46 villages. A shared history.", "46 गाँव। एक साझा इतिहास।")}
            </h2>
            <label>
              Search villages / गाँव खोजें
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="गाँव का नाम"
              />
            </label>
          </div>
          {selected ? (
            <article className="hub-card">
              <button onClick={() => setVillage("")}>
                ← All villages / सभी गाँव
              </button>
              <h2>{selected.name}</h2>
              <p className="hub-label">
                Preserved archive · source review pending
              </p>
              <div className="hub-prose">{selected.text}</div>
              <a href={selected.source} target="_blank" rel="noreferrer">
                Original website source ↗
              </a>
              <p>
                Help correct a place name, add a source or preserve a memory.
              </p>
              <button onClick={() => setTab("stories")}>
                Contribute to this village
              </button>
            </article>
          ) : (
            <div className="hub-grid">
              {archive
                .filter((v) => v.name.includes(filter))
                .map((v) => (
                  <button
                    className="hub-village"
                    key={v.name}
                    onClick={() => setVillage(v.name)}
                  >
                    <span>⌂</span>
                    <h3>{v.name}</h3>
                    <p>
                      {v.text
                        .replace(/लुहाच परिवार|इतिहास|show vanshavali/g, "")
                        .trim()
                        .slice(0, 100)}
                      …
                    </p>
                    <strong>Read the village story →</strong>
                  </button>
                ))}
            </div>
          )}
        </>
      )}
      {tab === "stories" && (
        <>
          <h2>{t("The community collection", "समुदाय का संग्रह")}</h2>
          <p>
            Every memory keeps its source. New submissions have a seven-day
            objection window.
          </p>
          <div className="hub-gallery">
            {[
              "village-road.webp",
              "gathering.webp",
              "community-event.webp",
            ].map((f, i) => (
              <figure key={f}>
                <img
                  src={"/heritage/" + f}
                  alt={
                    [
                      "Village road sign from the earlier website",
                      "Community gathering from the earlier website",
                      "Seated community gathering from the earlier website",
                    ][i]
                  }
                />
                <figcaption>
                  Earlier website archive · date and identities unverified
                </figcaption>
              </figure>
            ))}
          </div>
          <details className="hub-card">
            <summary>
              Add a village story, biography or photograph / योगदान करें
            </summary>
            <Form
              label="Submit for community review"
              onSubmit={async (b) => {
                await act("contribute", {
                  ...b,
                  consent: b.consent === "on",
                  media_id: media,
                });
              }}
            >
              <label>
                Contribution type
                <select name="kind">
                  <option value="village">Village information</option>
                  <option value="biography">
                    Person’s biography / remembrance
                  </option>
                  <option value="photo">Photograph</option>
                </select>
              </label>
              <label>
                Title
                <input name="title" required minLength={4} maxLength={160} />
              </label>
              <label>
                Village
                <select name="village" defaultValue={village}>
                  <option value="">Community-wide</option>
                  {archive.map((v) => (
                    <option key={v.name}>{v.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Linked person (required for a biography)
                <select name="person_id">
                  <option value="">No individual profile</option>
                  {me.own.map((p: Row) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="hub-help">
                Living people need an approved steward’s consent. Children’s
                biographies are excluded. Request stewardship through the family
                area before writing a biography.
              </p>
              <label>
                Story or description
                <textarea
                  name="body"
                  required
                  minLength={20}
                  maxLength={12000}
                  rows={5}
                />
              </label>
              <label>
                Source, page, date or first-hand account
                <textarea
                  name="source"
                  required
                  minLength={10}
                  maxLength={1000}
                />
              </label>
              <label>
                Photograph (JPEG, PNG or WebP, up to 8 MB)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploading(true);
                    setMedia("");
                    try {
                      const r = await fetch("/api/media", {
                        method: "POST",
                        headers: { "Content-Type": f.type },
                        body: f,
                      });
                      const j = await r.json();
                      if (!r.ok) throw Error(j.error);
                      setMedia(j.id);
                      setNotice(
                        "Photo prepared; camera metadata removed. Submit the contribution to attach it.",
                      );
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              {media && (
                <img
                  className="hub-upload"
                  src={"/api/media?id=" + media}
                  alt="Your uploaded photograph"
                />
              )}
              <label className="hub-check">
                <input name="consent" type="checkbox" required />I have
                permission to share this text/photo and the consent of
                identifiable living people.
              </label>
            </Form>
          </details>
          <div className="hub-grid">
            {content.map((c) => (
              <article className="hub-card" key={c.id}>
                {c.media_id && (
                  <img
                    className="hub-photo"
                    src={"/api/media?id=" + c.media_id}
                    alt={c.title}
                  />
                )}
                <span className={"hub-label " + c.status}>
                  {c.status} · {c.kind}
                </span>
                <h3>{c.title}</h3>
                <small>
                  {c.village} · {c.author_name} · {date(c.created)}
                </small>
                <p className="hub-prose">{c.body}</p>
                <p>
                  <strong>Source:</strong> {c.source}
                </p>
                {c.status === "pending" && (
                  <p>
                    Objections close {date(c.due)}. Acceptance records the
                    review result, not historical certainty.
                  </p>
                )}
                {c.decision && <p>{c.decision}</p>}
                {c.objections.map((o: Row, i: number) => (
                  <p key={i} className="hub-alert">
                    Objection: {o.reason}
                  </p>
                ))}
                {["pending", "accepted"].includes(c.status) && (
                  <details>
                    <summary>Raise a correction or objection</summary>
                    <Form
                      label="Pause for review"
                      onSubmit={(b) => act("objectContent", { ...b, id: c.id })}
                    >
                      <label>
                        Reason
                        <textarea required minLength={10} name="reason" />
                      </label>
                    </Form>
                  </details>
                )}
                {c.author === me.actor.id && c.status !== "withdrawn" && (
                  <Form
                    label="Withdraw my contribution"
                    onSubmit={(b) => act("withdrawContent", { ...b, id: c.id })}
                  >
                    <label>
                      Withdrawal reason
                      <input required minLength={10} name="reason" />
                    </label>
                  </Form>
                )}
              </article>
            ))}
          </div>
          {!content.length && (
            <p className="hub-empty">
              The new collection is ready for its first contribution.
            </p>
          )}
        </>
      )}
      {tab === "connect" && (
        <>
          <h2>
            {t(
              "Find a familiar connection, wherever you go.",
              "जहाँ जाएँ, अपने समुदाय से जुड़ें।",
            )}
          </h2>
          <p>
            Search a city, state or country. Only verified adults who opt in
            appear here. Phone numbers and email addresses are not included.
          </p>
          <details className="hub-card">
            <summary>My directory visibility / मेरी उपलब्धता</summary>
            <p>
              Turning this off hides you and pauses your conversations. Exact
              addresses are never requested.
            </p>
            <Form
              label="Save directory preference"
              onSubmit={(b) =>
                act("directory", {
                  ...b,
                  enabled: b.enabled === "on",
                  consent: b.consent === "on",
                })
              }
            >
              <label>
                My verified self-profile
                <select
                  name="person_id"
                  defaultValue={state?.directory?.person_id || ""}
                >
                  <option value="">Choose your own profile</option>
                  {state?.myClaims
                    .filter((c: Row) => c.relationship === "self")
                    .map((c: Row) => (
                      <option key={c.id} value={c.person_id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                City
                <input
                  name="city"
                  defaultValue={state?.directory?.city || ""}
                  maxLength={80}
                />
              </label>
              <label>
                State / region
                <input
                  name="state"
                  defaultValue={state?.directory?.state || ""}
                  maxLength={80}
                />
              </label>
              <label>
                Country
                <input
                  name="country"
                  defaultValue={state?.directory?.country || ""}
                  maxLength={80}
                />
              </label>
              <label className="hub-check">
                <input
                  name="enabled"
                  type="checkbox"
                  defaultChecked={!!state?.directory?.enabled}
                />
                Show me to verified members and allow connection requests.
              </label>
              <label className="hub-check">
                <input name="consent" type="checkbox" />I consent to sharing
                this city-level location. My profile visibility must also allow
                verified members.
              </label>
            </Form>
            <a href="/members">Manage family profile privacy →</a>
          </details>
          <Form
            label="Find members"
            onSubmit={async (b) => {
              try {
                setPeople(
                  await api(
                    "/api/hub?action=directory&q=" + encodeURIComponent(b.q),
                  ),
                );
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <label>
              City, state, country or member name
              <input name="q" placeholder="Jaipur, Haryana, India…" />
            </label>
          </Form>
          <div className="hub-grid">
            {people.map((p) => (
              <article className="hub-card" key={p.id}>
                <h3>{p.name}</h3>
                <p>{[p.city, p.state, p.country].filter(Boolean).join(", ")}</p>
                <Form
                  label="Request a connection"
                  onSubmit={(b) => act("connect", { ...b, target: p.id })}
                >
                  <label>
                    Introduce yourself
                    <textarea
                      name="note"
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </label>
                </Form>
                <button onClick={() => act("block", { target: p.id })}>
                  Block member
                </button>
              </article>
            ))}
          </div>
        </>
      )}
      {tab === "inbox" && (
        <>
          <h2>{t("Conversations, by invitation.", "सहमति से बातचीत।")}</h2>
          <p>
            Accept a request before messages can be exchanged. Share contact
            details only when you choose. Messages are stored by this service;
            they are not end-to-end encrypted. Administrators see messages you
            explicitly report.
          </p>
          <button onClick={() => refresh().catch((e) => setError(e.message))}>
            Refresh messages
          </button>
          <div className="hub-split">
            <aside>
              {state?.conversations.map((c: Row) => (
                <button
                  className="hub-thread"
                  key={c.id}
                  onClick={() => setConversation(c.id)}
                >
                  <strong>
                    {c.sender === me.actor.id
                      ? c.recipient_name
                      : c.sender_name}
                  </strong>
                  <small>
                    {c.status}
                    {c.blocked ? " · blocked" : ""}
                  </small>
                </button>
              ))}
            </aside>
            <section className="hub-card">
              {thread ? (
                <>
                  <h3>
                    {thread.sender === me.actor.id
                      ? thread.recipient_name
                      : thread.sender_name}
                  </h3>
                  <p>{thread.note}</p>
                  {thread.status === "pending" &&
                    thread.recipient === me.actor.id && (
                      <div className="hub-actions">
                        <button
                          className="primary"
                          onClick={() =>
                            act("connection", {
                              id: thread.id,
                              status: "accepted",
                            })
                          }
                        >
                          Accept connection
                        </button>
                        <button
                          onClick={() =>
                            act("connection", {
                              id: thread.id,
                              status: "declined",
                            })
                          }
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  {thread.messages.map((m: Row) => (
                    <div
                      key={m.id}
                      className={
                        "hub-message " +
                        (m.sender === me.actor.id ? "mine" : "")
                      }
                    >
                      <small>
                        {m.sender === me.actor.id
                          ? "You"
                          : thread.sender === m.sender
                            ? thread.sender_name
                            : thread.recipient_name}{" "}
                        · {new Date(m.created).toLocaleString("en-IN")}
                      </small>
                      <p>{m.body}</p>
                      <details>
                        <summary>Report this message</summary>
                        <Form
                          label="Send report to administrators"
                          onSubmit={(b) =>
                            act("report", {
                              ...b,
                              id: thread.id,
                              message_id: m.id,
                            })
                          }
                        >
                          <label>
                            Concern
                            <textarea name="reason" required minLength={10} />
                          </label>
                        </Form>
                      </details>
                    </div>
                  ))}
                  {thread.status === "accepted" &&
                    !thread.blocked &&
                    thread.available && (
                      <Form
                        label="Send message"
                        onSubmit={(b) =>
                          act("message", { ...b, id: thread.id })
                        }
                      >
                        <label>
                          Your message
                          <textarea name="body" required maxLength={3000} />
                        </label>
                      </Form>
                    )}
                  <div className="hub-actions">
                    <button
                      onClick={() =>
                        act("connection", { id: thread.id, status: "closed" })
                      }
                    >
                      Close conversation
                    </button>
                    <button
                      onClick={() =>
                        act("block", {
                          target:
                            thread.sender === me.actor.id
                              ? thread.recipient
                              : thread.sender,
                        })
                      }
                    >
                      Block member
                    </button>
                  </div>
                </>
              ) : (
                <p>
                  Select a conversation. Requests from other members appear
                  here.
                </p>
              )}
            </section>
          </div>
          <details className="hub-card">
            <summary>Blocked members</summary>
            {state?.blocked.map((b: Row) => (
              <p key={b.target}>
                {b.name}{" "}
                <button
                  onClick={() =>
                    act("block", { target: b.target, enabled: false })
                  }
                >
                  Unblock (a new request will be needed)
                </button>
              </p>
            ))}
          </details>
        </>
      )}
      {tab === "research" && (
        <>
          <h2>
            {t(
              "Ask the archive. Follow the evidence.",
              "विरासत से पूछें। स्रोत देखें।",
            )}
          </h2>
          <div className="hub-card">
            <h3>How are two people connected? / रिश्ता खोजें</h3>
            <p>
              Paths use recorded parent and spouse links. Private profiles and
              missing relationships are never guessed. Mothers, daughters and
              both sides of a married family have equal place.
            </p>
            <div className="hub-two">
              <Finder
                label="First person"
                onPick={(p) => {
                  setFrom(p);
                  setPath(null);
                }}
              />
              <Finder
                label="Second person"
                onPick={(p) => {
                  setTo(p);
                  setPath(null);
                }}
              />
            </div>
            <p>
              {from?.name || "Choose first person"} →{" "}
              {to?.name || "Choose second person"}
            </p>
            <button
              className="primary"
              disabled={!from || !to}
              onClick={async () => {
                try {
                  setPath(
                    await api(
                      "/api/hub?action=lineage&from=" +
                        encodeURIComponent(from!.id) +
                        "&to=" +
                        encodeURIComponent(to!.id),
                    ),
                  );
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Trace recorded relationship
            </button>
            {path &&
              (path.found ? (
                <ol className="hub-lineage">
                  <li>
                    <strong>{path.from.name}</strong>
                    <small>{path.from.village}</small>
                  </li>
                  {path.steps.map((s: Row, i: number) => (
                    <li key={i}>
                      <span>{s.relation} → </span>
                      <strong>{s.person.name}</strong>
                      <small>
                        {s.person.village} · Source: {s.source}
                      </small>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{path.message}</p>
              ))}
          </div>
          <div className="hub-card">
            <h3>Community assistant / समुदाय से पूछें</h3>
            <p>
              Gemini can summarize the earlier website’s archive. Family
              profiles, contact details and private messages stay out of these
              AI requests.
            </p>
            <Finder
              label="For a family question, select the person"
              onPick={setResearchPerson}
            />
            {researchPerson && <p>Selected: {researchPerson.name}</p>}
            <Form label="Ask the archive" onSubmit={research}>
              <label>
                Question type
                <select name="mode">
                  <option value="history">
                    Village history (source search or optional AI)
                  </option>
                  <option value="family">
                    Who is this person’s mother, father, spouse or child? (local
                    records)
                  </option>
                  <option value="directory">
                    Who is in this city, state or country? (opt-in directory)
                  </option>
                </select>
              </label>
              <label>
                Choose a village (helps Hindi/English questions)
                <select name="village">
                  <option value="">Search the full archive</option>
                  {archive.map((v) => (
                    <option key={v.name}>{v.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Question (for location search, enter the place name)
                <textarea
                  name="question"
                  required
                  minLength={4}
                  maxLength={600}
                  placeholder="इस गाँव के बसने के बारे में क्या लिखा है?"
                />
              </label>
              <label className="hub-check">
                <input name="ai" type="checkbox" />
                Use AI to summarize the sources.
              </label>
              <label className="hub-check">
                <input name="consent" type="checkbox" />
                Send this question and matching archive passages to Google
                Gemini. I will not include private personal information.
              </label>
            </Form>
            {answer && (
              <article>
                <p className="hub-label">
                  {answer.mode === "ai"
                    ? "AI-assisted answer"
                    : "Source search"}
                </p>
                <p className="hub-prose">{answer.answer}</p>
                {answer.notice && <p>{answer.notice}</p>}
                {answer.sources.map((s: Row) => (
                  <details key={s.id}>
                    <summary>
                      Source [{s.id}] · {s.village}
                    </summary>
                    <p className="hub-prose">{s.text}</p>
                    <a href={s.source} target="_blank" rel="noreferrer">
                      Original village page ↗
                    </a>
                    <p>{s.status}</p>
                  </details>
                ))}
              </article>
            )}
          </div>
        </>
      )}
      {tab === "account" && (
        <>
          <h2>Your information, your choices / आपका डेटा</h2>
          <div className="hub-card">
            <h3>Download your records</h3>
            <p>
              Includes your profile, contributions, requests and sent messages.
              Excludes passwords, recovery codes and other members’ private
              messages.
            </p>
            <button
              onClick={async () => {
                try {
                  const j = await api("/api/hub?action=export"),
                    url = URL.createObjectURL(
                      new Blob([JSON.stringify(j, null, 2)], {
                        type: "application/json",
                      }),
                    ),
                    a = document.createElement("a");
                  a.href = url;
                  a.download = "luhach-my-records.json";
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Download my data
            </button>
          </div>
          <details className="hub-card">
            <summary>Transfer family stewardship</summary>
            <p>
              A second administrator checks consent and the relationship. This
              also supports a child reaching adulthood. Existing privacy
              settings are reset to private.
            </p>
            <Form
              label="Request independent transfer review"
              onSubmit={(b) => act("transfer", b)}
            >
              <label>
                Current stewardship
                <select name="claim" required>
                  <option value="">Select</option>
                  {state?.myClaims.map((c: Row) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.relationship}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Receiving member’s account ID
                <input name="target" required />
              </label>
              <label>
                Consent, relationship and reason
                <textarea name="reason" required minLength={15} />
              </label>
            </Form>
            <p>
              Your account ID: <code>{me.actor.id}</code> (share it with a
              steward only if a transfer is intended).
            </p>
            {state?.transfers.map((r: Row) => (
              <p key={r.id}>
                {r.status}: {r.reason}
              </p>
            ))}
          </details>
          <details className="hub-card">
            <summary>Close my account</summary>
            <p>
              This signs you out, removes login credentials, hides your profiles
              and directory entry, and withdraws pending contributions. Accepted
              heritage contributions, lineage records, existing messages and
              audit evidence are retained for continuity. Your account name
              becomes “Former member”. Administrators must first hand over their
              role.
            </p>
            <Form
              label="Close my account permanently"
              onSubmit={async (b) => {
                if (b.confirm !== "CLOSE") {
                  setError("Type CLOSE to confirm.");
                  return;
                }
                try {
                  await api("/api/hub", { action: "close", ...b });
                  window.location.href = "/";
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <label>
                Current password
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <label>
                Type CLOSE
                <input name="confirm" required pattern="CLOSE" />
              </label>
            </Form>
          </details>
        </>
      )}
      {tab === "moderate" && admin && (
        <>
          <h2>Community review desk / सामुदायिक समीक्षा</h2>
          <p>
            Family verification and lineage decisions remain in{" "}
            <a href="/members">Admin desk →</a>. Review your own contributions
            through a different administrator.
          </p>
          {content
            .filter((c) =>
              ["pending", "disputed", "accepted"].includes(c.status),
            )
            .map((c) => (
              <article className="hub-card" key={c.id}>
                <span className="hub-label">{c.status}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <p>Source: {c.source}</p>
                {c.objections.map((o: Row, i: number) => (
                  <p key={i}>Objection: {o.reason}</p>
                ))}
                <Form
                  label="Record review decision"
                  onSubmit={(b) => act("reviewContent", { ...b, id: c.id })}
                >
                  <label>
                    Decision
                    <select name="status">
                      <option value="accepted">Accept</option>
                      <option value="rejected">Reject</option>
                      <option value="removed">Remove from collection</option>
                    </select>
                  </label>
                  <label>
                    Evidence and explanation
                    <textarea name="reason" required minLength={10} />
                  </label>
                </Form>
              </article>
            ))}
          <h3>Member safety reports</h3>
          {state?.reports.map((r: Row) => (
            <article className="hub-card" key={r.id}>
              <p>
                {r.reason} · {r.status}
              </p>
              {r.reported_message && (
                <blockquote>{r.reported_message}</blockquote>
              )}
              <p>{r.decision}</p>
              {r.status === "open" && (
                <Form
                  label="Resolve report"
                  onSubmit={(b) => act("resolveReport", { ...b, id: r.id })}
                >
                  <label>
                    Action and explanation
                    <textarea name="reason" required minLength={10} />
                  </label>
                </Form>
              )}
            </article>
          ))}
          <h3>Stewardship transfers</h3>
          {state?.transfers
            .filter((r: Row) => r.status === "pending")
            .map((r: Row) => (
              <article className="hub-card" key={r.id}>
                <p>{r.reason}</p>
                <p>
                  From {r.author} to {r.recipient}
                </p>
                <Form
                  label="Record transfer decision"
                  onSubmit={(b) =>
                    act("reviewTransfer", {
                      ...b,
                      id: r.id,
                      accept: b.accept === "yes",
                    })
                  }
                >
                  <label>
                    Decision
                    <select name="accept">
                      <option value="no">Reject</option>
                      <option value="yes">
                        Approve after checking consent
                      </option>
                    </select>
                  </label>
                  <label>
                    New relationship
                    <select name="relationship">
                      <option value="self">Self</option>
                      <option value="guardian">Guardian of child</option>
                      <option value="relative">Relative steward</option>
                    </select>
                  </label>
                  <label>
                    Evidence of consent
                    <textarea name="reason" required minLength={15} />
                  </label>
                </Form>
              </article>
            ))}
          <details className="hub-card">
            <summary>Remove an administrator’s role</summary>
            <p>
              Another administrator must perform this action. Both accounts are
              signed out afterward.
            </p>
            <Form
              label="Remove administrator role"
              onSubmit={async (b) => {
                try {
                  await api("/api/hub", { action: "demote", ...b });
                  window.location.href = "/members";
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <label>
                Administrator
                <select name="target" required>
                  {me.members
                    .filter(
                      (m: Row) => m.role === "admin" && m.id !== me.actor.id,
                    )
                    .map((m: Row) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Reason
                <textarea name="reason" required minLength={15} />
              </label>
              <label>
                Your current password
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
            </Form>
          </details>
        </>
      )}
    </main>
  );
}
