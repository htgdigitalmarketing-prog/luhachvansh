"use client";
import { useEffect, useState, useRef, FormEvent } from "react";
import ProfilePicker from "./ProfilePicker";
import {
  Sprout,
  ShieldCheck,
  LockKeyhole,
  Users,
  Search,
  ArrowRight,
  LogOut,
  Settings,
  UserCheck,
  Heart,
  Globe,
  Plus,
  Mail,
  EyeOff,
  KeyRound,
  Check,
  X,
} from "lucide-react";
type Actor = {
  id: string;
  name: string;
  role: string;
  handle: string;
  verified: boolean;
};
type Person = {
  id: string;
  name: string;
  aliases?: string;
  village: string;
  kind: string;
  relationship?: string;
  claimOnly?: boolean;
  life?: string;
  audience?: string;
  contact?: { email: string; phone: string; city: string };
  settings?: Privacy;
};
type Privacy = {
  audience: string;
  life: string;
  contact_audience: string;
  email: string;
  phone: string;
  city: string;
};
type Claim = {
  id: string;
  person_id: string;
  person_name: string;
  account_id: string;
  account_name: string;
  status: string;
  reason: string;
  relationship: string;
  method?: string;
  decision?: string;
};
type Proposal = {
  id: string;
  author: string;
  author_name: string;
  anchor: string;
  payload: { name: string; relation: string; source: string };
  status: string;
  decision?: string;
  due: number;
  person_id?: string;
  objections: { reason: string }[];
};
type State = {
  actor: Actor;
  own: Person[];
  claims: Claim[];
  proposals: Proposal[];
  notifications: { id: string; body: string }[];
  invitations: {
    id: string;
    label: string;
    expires: number;
    used_by?: string;
    revoked: number;
  }[];
  members: Actor[];
  audit: { id: number; action: string; created: number }[];
};
type Family = {
  person: Person;
  parents: Person[];
  spouses: Person[];
  children: Person[];
  siblings: Person[];
};
async function call(action: string, data?: Record<string, unknown>) {
  const r = await fetch(
    "/api/members" + (data ? "" : "?" + action),
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...data }),
        }
      : { cache: "no-store" },
  );
  const result = await r.json();
  if (!r.ok)
    throw Object.assign(Error(result.error || "Request failed"), {
      status: r.status,
    });
  return result;
}
const when = (n: number) =>
  new Date(n).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export default function Members() {
  const [actor, setActor] = useState<Actor | null>(null),
    [state, setState] = useState<State | null>(null),
    [loaded, setLoaded] = useState(false),
    [setup, setSetup] = useState(false),
    [tab, setTab] = useState("home"),
    [mode, setMode] = useState("signin"),
    [hi, setHi] = useState(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [secret, setSecret] = useState<{ label: string; value: string } | null>(
      null,
    );
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<Person[]>([]),
    [selected, setSelected] = useState<Person | null>(null),
    [family, setFamily] = useState<Family | null>(null),
    [view, setView] = useState("birth");
  const [privacyPerson, setPrivacyPerson] = useState(""),
    [privacy, setPrivacy] = useState<Privacy>({
      audience: "private",
      life: "adult",
      contact_audience: "private",
      email: "",
      phone: "",
      city: "",
    });
  const t = (en: string, hindi: string) => (hi ? hindi : en);
  const secretRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!secret) return;
    const previous = document.activeElement as HTMLElement;
    secretRef.current?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes =
        secretRef.current?.querySelectorAll<HTMLElement>("textarea,button");
      if (!nodes?.length) return;
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === secretRef.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [secret]);
  async function refresh() {
    const s = await call("action=session");
    setActor(s.actor);
    setSetup(s.setupNeeded);
    if (s.actor) {
      const d = await call("action=state");
      setState(d);
    } else {
      setState(null);
      setFamily(null);
      setSelected(null);
      setResults([]);
    }
    setLoaded(true);
  }
  useEffect(() => {
    refresh().catch((e) => {
      setError(e.message);
      setLoaded(true);
    });
  }, []);
  useEffect(() => {
    document.documentElement.lang = hi ? "hi" : "en";
  }, [hi]);
  useEffect(() => {
    if (!actor) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          call("logout", {}).finally(() => {
            setActor(null);
            setState(null);
            setSelected(null);
            setFamily(null);
            setMessage("Signed out after 30 minutes of inactivity.");
          });
        },
        30 * 60 * 1000,
      );
    };
    reset();
    window.addEventListener("pointerdown", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [actor?.id]);
  useEffect(() => {
    if (!actor || tab !== "search") return;
    let active = true;
    const timer = setTimeout(
      () =>
        call("action=search&q=" + encodeURIComponent(query))
          .then((r) => {
            if (active) setResults(r.people);
          })
          .catch((e) => {
            if (active) setError(e.message);
          }),
      250,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, tab, actor?.id]);
  async function run(
    action: string,
    data: Record<string, unknown>,
    notice = "Saved.",
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await call(action, data);
      if (r.recovery)
        setSecret({ label: "Your one-time recovery code", value: r.recovery });
      if (r.code)
        setSecret({
          label: "Single-use invitation · expires in seven days",
          value: r.code,
        });
      await refresh();
      setMessage(notice);
      if (action === "privacy" || action === "restrict") {
        setFamily(null);
        setSelected(null);
      }
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function fields(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget).entries());
  }
  async function open(p: Person) {
    setSelected(p);
    setFamily(null);
    setView("birth");
    setError("");
    if (!p.claimOnly) {
      try {
        setFamily(await call("action=family&id=" + encodeURIComponent(p.id)));
      } catch (e) {
        setError((e as Error).message);
      }
    }
  }
  function editPrivacy(p: Person) {
    setPrivacyPerson(p.id);
    setPrivacy(p.settings!);
    setTab("privacy");
    setMessage("");
  }
  const card = (p: Person) => (
    <button className="m-person" key={p.id} onClick={() => open(p)}>
      <span className="m-avatar">{p.name.slice(0, 1)}</span>
      <span>
        <strong>{p.name}</strong>
        <small>{p.relationship || p.village}</small>
      </span>
      <ArrowRight size={16} />
    </button>
  );
  if (!loaded)
    return (
      <div className="loading">
        <Sprout size={40} />
        <h1>लुहाच परिवार</h1>
        <p>{error || "Opening the member area…"}</p>
      </div>
    );
  return (
    <div className="members-app">
      <div className="preview-bar">
        <span>
          <LockKeyhole size={12} />
          {t("LOCAL REVIEW · NOT PUBLISHED", "स्थानीय समीक्षा · प्रकाशित नहीं")}
        </span>
        <a href="/demo">
          {t("Fictional family demo", "काल्पनिक परिवार नमूना")} ↗
        </a>
      </div>
      <header className="header">
        <a className="brand" href="/">
          <span className="brand-symbol">
            <Sprout size={26} />
          </span>
          <span>
            <strong>लुहाच परिवार</strong>
            <small>LUHACH PARIVAR</small>
          </span>
        </a>
        <div className="header-actions">
          <button className="language" onClick={() => setHi(!hi)}>
            <Globe size={16} />
            {hi ? "English" : "हिन्दी"}
          </button>
          {actor && (
            <>
              <span className="m-account">
                {actor.name}
                <small>@{actor.handle}</small>
              </span>
              <button
                aria-label="Sign out"
                onClick={() => run("logout", {}, "Signed out.")}
              >
                <LogOut size={19} />
              </button>
            </>
          )}
        </div>
      </header>
      {error && (
        <div className="m-alert error" role="alert">
          {error}
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {message && (
        <div className="m-alert success" role="status">
          {message}
        </div>
      )}
      {!actor ? (
        <main className="m-welcome">
          <section className="m-intro">
            <span className="eyebrow">
              {t("A PLACE FOR OUR PEOPLE", "हमारे अपने लोगों के लिए")}
            </span>
            <h1>
              {t("Our roots connect us.", "हमारी जड़ें हमें जोड़ती हैं।")}
              <em>
                {t("Trust brings us closer.", "विश्वास हमें करीब लाता है।")}
              </em>
            </h1>
            <p>
              {t(
                "Join a family archive where each person has a voice, every connection can be checked, and you choose what to share.",
                "ऐसे परिवार अभिलेख से जुड़ें जहाँ हर व्यक्ति की जगह है, रिश्तों का सत्यापन होता है और साझा करने का निर्णय आपका है।",
              )}
            </p>
            <div className="m-promises">
              <div>
                <KeyRound />
                <span>
                  <strong>
                    {t("Your own secure account", "आपका अपना सुरक्षित खाता")}
                  </strong>
                  <small>
                    {t(
                      "Invitation, password and recovery code",
                      "निमंत्रण, पासवर्ड और पुनर्प्राप्ति कोड",
                    )}
                  </small>
                </span>
              </div>
              <div>
                <UserCheck />
                <span>
                  <strong>
                    {t(
                      "A connection checked by a person",
                      "प्रशासक द्वारा रिश्ते का सत्यापन",
                    )}
                  </strong>
                  <small>
                    {t(
                      "Signing in is separate from family verification",
                      "लॉगिन और परिवार सत्यापन अलग हैं",
                    )}
                  </small>
                </span>
              </div>
              <div>
                <EyeOff />
                <span>
                  <strong>
                    {t("Private until you choose", "आपकी अनुमति तक निजी")}
                  </strong>
                  <small>
                    {t(
                      "Contacts stay hidden. Children stay protected.",
                      "संपर्क जानकारी छिपी रहती है। बच्चों की जानकारी सुरक्षित है।",
                    )}
                  </small>
                </span>
              </div>
            </div>
          </section>
          <section className="m-login m-panel">
            <span className="m-icon">
              <ShieldCheck size={26} />
            </span>
            <h2>
              {mode === "signin"
                ? t("Welcome back", "फिर से स्वागत है")
                : mode === "register"
                  ? t("Join your community", "अपने समुदाय से जुड़ें")
                  : mode === "setup"
                    ? t("Set up the owner account", "प्रथम प्रशासक खाता बनाएँ")
                    : t("Recover your account", "खाता वापस पाएँ")}
            </h2>
            <p>
              {mode === "signin"
                ? t(
                    "Sign in with your member username.",
                    "अपने सदस्य यूज़रनेम से लॉगिन करें।",
                  )
                : mode === "setup"
                  ? "Use the private OWNER-SETUP.txt file on this computer. Choose your own password."
                  : mode === "register"
                    ? "An administrator can give you a single-use invitation."
                    : "Use the recovery code saved when you created your account."}
            </p>
            <form
              key={mode}
              onSubmit={async (e) => {
                const d = fields(e);
                if (
                  await run(
                    mode,
                    {
                      ...d,
                      adult: d.adult === "on",
                      consent: d.consent === "on",
                    },
                    "Welcome. Your account is ready.",
                  )
                )
                  setTab("home");
              }}
            >
              {(mode === "register" || mode === "setup") && (
                <label>
                  {t("Your name", "आपका नाम")}
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </label>
              )}
              <label>
                {t("Username", "यूज़रनेम")}
                <input
                  name="username"
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={40}
                  pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}"
                />
              </label>
              {mode !== "signin" && (
                <label>
                  {mode === "recover"
                    ? "Recovery code"
                    : mode === "setup"
                      ? "Private owner setup code"
                      : "Invitation code"}
                  <input
                    name="code"
                    required
                    autoComplete="off"
                    maxLength={200}
                  />
                </label>
              )}
              <label>
                {mode === "recover"
                  ? t("New password", "नया पासवर्ड")
                  : t("Password", "पासवर्ड")}
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  minLength={mode === "signin" ? 1 : 15}
                  maxLength={128}
                />
                {mode !== "signin" && (
                  <small>
                    At least 15 characters. A memorable phrase works well.
                  </small>
                )}
              </label>
              {(mode === "register" || mode === "setup") && (
                <>
                  <label className="m-check">
                    <input type="checkbox" name="adult" required />
                    {t(
                      "I am 18 or older.",
                      "मैं 18 वर्ष या उससे अधिक आयु का/की हूँ।",
                    )}
                  </label>
                  <label className="m-check">
                    <input type="checkbox" name="consent" required />
                    {t(
                      "I agree to the member privacy notice below.",
                      "मैं नीचे दिए गए सदस्य गोपनीयता विवरण से सहमत हूँ।",
                    )}
                  </label>
                  <details>
                    <summary>Member privacy notice</summary>
                    <p>
                      Your name, login, family claims and review history are
                      stored in this local database. Administrators see
                      verification requests and profiles for moderation.
                      Verified members see only profiles and contacts shared
                      with them. Historical entries are available to verified
                      members; new profiles start private. No public directory
                      or outbound email is enabled. Contact details do not
                      verify identity. Do not include identity documents,
                      government identifiers or exact home addresses in
                      requests. You can withdraw sharing at any time. Audit
                      events are retained to resolve family-record disputes.
                    </p>
                  </details>
                </>
              )}
              <button className="primary" disabled={busy}>
                {busy
                  ? t("Please wait…", "कृपया प्रतीक्षा करें…")
                  : mode === "signin"
                    ? t("Sign in", "लॉगिन")
                    : mode === "recover"
                      ? t("Recover account", "खाता पुनर्प्राप्त करें")
                      : t("Create account", "खाता बनाएँ")}
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="m-auth-links">
              <button
                onClick={() => {
                  setMode(mode === "register" ? "signin" : "register");
                  setError("");
                }}
              >
                {mode === "register"
                  ? "Already a member? Sign in"
                  : "Have an invitation? Join"}
              </button>
              <button
                onClick={() => {
                  setMode(mode === "recover" ? "signin" : "recover");
                  setError("");
                }}
              >
                {mode === "recover"
                  ? "Back to sign in"
                  : "Forgot your password?"}
              </button>
              {setup && (
                <button
                  onClick={() => {
                    setMode("setup");
                    setError("");
                  }}
                >
                  Set up owner
                </button>
              )}
            </div>
          </section>
        </main>
      ) : (
        <>
          <nav className="m-nav" aria-label="Member navigation">
            {[
              ["home", "Overview", "परिचय", HomeIcon],
              ["search", "Find family", "परिवार खोजें", Search],
              ["requests", "Requests", "अनुरोध", UserCheck],
              ["privacy", "Privacy & account", "गोपनीयता", Settings],
              ...(actor.role === "admin"
                ? [["admin", "Admin desk", "प्रशासक", ShieldCheck]]
                : []),
            ].map(([id, en, hn, Icon]) => (
              <button
                key={id as string}
                className={tab === id ? "active" : ""}
                onClick={() => {
                  setTab(id as string);
                  setError("");
                  setSelected(null);
                  setFamily(null);
                }}
              >
                {typeof Icon !== "string" && <Icon size={17} />}
                <span>{t(en as string, hn as string)}</span>
              </button>
            ))}
          </nav>
          <main className="m-content">
            {tab === "home" && (
              <>
                <section className="m-member-hero">
                  <div>
                    <span className="eyebrow">
                      {t(
                        "YOUR PLACE IN OUR FAMILY",
                        "हमारे परिवार में आपका स्थान",
                      )}
                    </span>
                    <h1>
                      {t("Welcome,", "स्वागत है,")} {actor.name.split(" ")[0]}.
                    </h1>
                    <p>
                      {actor.verified
                        ? t(
                            "Your account is verified. Explore your family and decide what you want to share.",
                            "आपका खाता सत्यापित है। अपना परिवार खोजें और जानकारी साझा करने के विकल्प चुनें।",
                          )
                        : t(
                            "Your account is ready. Now let us connect it to your family profile.",
                            "आपका खाता तैयार है। अब इसे परिवार की प्रोफ़ाइल से जोड़ें।",
                          )}
                    </p>
                  </div>
                  <span
                    className={"m-badge " + (actor.verified ? "verified" : "")}
                  >
                    <ShieldCheck size={17} />
                    {actor.role === "admin"
                      ? "Administrator"
                      : actor.verified
                        ? "Family verified"
                        : "Verification needed"}
                  </span>
                </section>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2>
                      {t("Your family profiles", "आपके परिवार की प्रोफ़ाइल")}
                    </h2>
                    {state?.own.length ? (
                      state.own.map((p) => (
                        <div className="m-owned" key={p.id}>
                          {card(p)}
                          <span className="m-badge">
                            <LockKeyhole size={13} />
                            {p.audience === "verified"
                              ? "Shared with verified members"
                              : "Private profile"}
                          </span>
                          {["self", "guardian"].includes(
                            p.relationship || "",
                          ) && (
                            <button
                              className="outline"
                              onClick={() => editPrivacy(p)}
                            >
                              Manage privacy
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="m-empty">
                        <Sprout size={35} />
                        <p>
                          {t(
                            "Start with your name in the family archive. If you are missing, request a new profile.",
                            "परिवार अभिलेख में अपना नाम खोजें। नाम न होने पर नई प्रोफ़ाइल का अनुरोध करें।",
                          )}
                        </p>
                        <button
                          className="primary"
                          onClick={() => setTab("search")}
                        >
                          Find my profile <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </section>
                  <aside className="m-panel">
                    <h2>{t("Your updates", "आपके अपडेट")}</h2>
                    {state?.notifications.length ? (
                      state.notifications.map((n) => (
                        <p className="m-update" key={n.id}>
                          {n.body}
                        </p>
                      ))
                    ) : (
                      <p className="m-muted">
                        Your verification and contribution updates will appear
                        here.
                      </p>
                    )}
                    <div className="m-note">
                      <LockKeyhole size={19} />
                      <p>
                        Only you and administrators can see your pending
                        verification request.
                      </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {tab === "search" && (
              <>
                <div className="m-title">
                  <span className="eyebrow">OUR SHARED ARCHIVE</span>
                  <h1>{t("Find your family", "अपना परिवार खोजें")}</h1>
                  <p>
                    {actor.verified
                      ? "Search names or villages. Private profiles are excluded."
                      : "Search an archival name or village to request verification. Family connections open after approval."}
                  </p>
                </div>
                <label className="m-search">
                  <Search size={20} />
                  <input
                    aria-label="Search family records"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name or village · नाम या गाँव"
                    maxLength={100}
                  />
                </label>
                <div className="m-results">{results.map(card)}</div>
                {query.length >= 2 && !results.length && (
                  <p className="m-muted">
                    No visible matches. Try the Hindi name or another spelling.
                  </p>
                )}
                <details className="m-panel">
                  <summary>
                    {t(
                      "Not in the archive? Request your own profile",
                      "अभिलेख में नाम नहीं है? अपनी प्रोफ़ाइल बनाएँ",
                    )}
                  </summary>
                  <p>
                    Search first to avoid duplicates. A new profile stays
                    private while an administrator checks your connection.
                  </p>
                  <form
                    className="m-form-grid"
                    onSubmit={async (e) => {
                      const form = e.currentTarget;
                      if (
                        await run(
                          "createProfile",
                          fields(e),
                          "Private profile requested. An administrator will review it.",
                        )
                      ) {
                        form.reset();
                        setTab("requests");
                      }
                    }}
                  >
                    <label>
                      Full name
                      <input
                        name="name"
                        required
                        maxLength={120}
                        defaultValue={actor.name}
                      />
                    </label>
                    <label>
                      Hindi / alternate name
                      <input name="aliases" maxLength={120} />
                    </label>
                    <label>
                      Ancestral village
                      <input name="village" required maxLength={120} />
                    </label>
                    <label className="m-wide">
                      Family connection and how to check it
                      <textarea
                        name="reason"
                        required
                        minLength={15}
                        maxLength={1000}
                        placeholder="Parent or relative's name, village and a family source. No identity documents or exact addresses."
                      />
                    </label>
                    <button className="primary" disabled={busy}>
                      Request verification <UserCheck size={16} />
                    </button>
                  </form>
                </details>
              </>
            )}
            {selected && (
              <section className="m-panel m-family">
                <button
                  className="m-close"
                  aria-label="Close family profile"
                  onClick={() => {
                    setSelected(null);
                    setFamily(null);
                  }}
                >
                  <X size={18} />
                </button>
                <span className="eyebrow">FAMILY PROFILE</span>
                <h2>{selected.name}</h2>
                <p>{selected.village}</p>
                {family && (
                  <>
                    <div className="m-tabs">
                      <button
                        className={view === "birth" ? "active" : ""}
                        onClick={() => setView("birth")}
                      >
                        Birth family
                      </button>
                      <button
                        className={view === "married" ? "active" : ""}
                        onClick={() => setView("married")}
                      >
                        Married family
                      </button>
                    </div>
                    {(view === "birth"
                      ? [
                          ["Parents", family.parents],
                          ["Brothers & sisters", family.siblings],
                        ]
                      : [
                          ["Spouse", family.spouses],
                          ["Children", family.children],
                        ]
                    ).map(([label, persons]) => (
                      <div key={label as string}>
                        <h3>{label as string}</h3>
                        <div className="m-results">
                          {(persons as Person[]).map(card)}
                        </div>
                        {!(persons as Person[]).length && (
                          <p className="m-muted">
                            No connections available to this account. An absent
                            card does not mean no relative exists.
                          </p>
                        )}
                      </div>
                    ))}
                    {family.person.contact &&
                      Object.values(family.person.contact).some(Boolean) && (
                        <div className="m-note">
                          <Mail size={19} />
                          <p>
                            {family.person.contact.email}
                            <br />
                            {family.person.contact.phone}
                            <br />
                            {family.person.contact.city}
                            <br />
                            <small>
                              Member-supplied contact information; not
                              independently verified.
                            </small>
                          </p>
                        </div>
                      )}
                  </>
                )}
                <details>
                  <summary>Request connection to this profile</summary>
                  <form
                    onSubmit={(e) => {
                      const d = fields(e);
                      run(
                        "claim",
                        { ...d, id: selected.id },
                        "Verification request sent to administrators.",
                      );
                    }}
                  >
                    <label>
                      Your connection
                      <select name="relationship">
                        <option value="self">This is me</option>
                        <option value="guardian">
                          I am the parent / guardian
                        </option>
                        <option value="relative">
                          I help this relative maintain their record
                        </option>
                      </select>
                    </label>
                    <label>
                      How can a reviewer verify it?
                      <textarea
                        name="reason"
                        required
                        minLength={15}
                        maxLength={1000}
                      />
                    </label>
                    <button className="primary" disabled={busy}>
                      Request verification
                    </button>
                  </form>
                </details>
                {actor.verified && family && (
                  <details>
                    <summary>Add a missing family member</summary>
                    <form
                      className="m-form-grid"
                      onSubmit={(e) =>
                        run(
                          "propose",
                          { id: selected.id, payload: fields(e) },
                          "Contribution saved for seven-day review. New profiles stay private.",
                        )
                      }
                    >
                      <label>
                        Relationship
                        <select name="relation">
                          <option value="daughter">Daughter</option>
                          <option value="mother">Mother</option>
                          <option value="spouse">
                            Spouse / daughter-in-law
                          </option>
                          <option value="son">Son</option>
                          <option value="father">Father</option>
                        </select>
                      </label>
                      <label>
                        Full name (leave blank when linking an existing person)
                        <input name="name" maxLength={120} />
                      </label>
                      <label>
                        Gender
                        <select name="gender">
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="unknown">Not recorded</option>
                        </select>
                      </label>
                      <label>
                        Village
                        <input
                          name="village"
                          required
                          defaultValue={selected.village}
                        />
                      </label>
                      <label className="m-wide">
                        Source / family reference
                        <textarea
                          name="source"
                          required
                          minLength={15}
                          maxLength={1000}
                        />
                      </label>
                      <ProfilePicker
                        name="existingId"
                        label="Already in the tree? Link that same person instead of creating a duplicate."
                      />
                      <ProfilePicker
                        name="secondId"
                        label="Optional second family link: for a spouse/daughter-in-law, choose her birth parent; for other relations, choose that person’s spouse."
                      />
                      <button className="primary" disabled={busy}>
                        Submit for review
                      </button>
                    </form>
                  </details>
                )}
              </section>
            )}
            {tab === "requests" && (
              <>
                <div className="m-title">
                  <span className="eyebrow">CHECKED CONNECTIONS</span>
                  <h1>{t("Requests & contributions", "अनुरोध और योगदान")}</h1>
                  <p>
                    Family verification requires a human decision. It is never
                    automatically approved.
                  </p>
                </div>
                {state?.claims
                  .filter((c) => c.account_id === actor.id)
                  .map((c) => (
                    <article className="m-panel m-request" key={c.id}>
                      <div>
                        <h3>{c.person_name}</h3>
                        <span className="m-badge">{c.status}</span>
                      </div>
                      <p>{c.reason}</p>
                      {c.decision && (
                        <p className="m-note">Review: {c.decision}</p>
                      )}
                    </article>
                  ))}
                {!state?.claims.some((c) => c.account_id === actor.id) && (
                  <div className="m-panel">
                    <p>No verification requests yet.</p>
                    <button
                      className="outline"
                      onClick={() => setTab("search")}
                    >
                      Find my profile
                    </button>
                  </div>
                )}
                {state?.proposals.map((p) => (
                  <article className="m-panel" key={p.id}>
                    <h3>
                      {p.payload.name} · {p.payload.relation}
                    </h3>
                    <span className="m-badge">{p.status}</span>
                    <p>{p.payload.source}</p>
                    <p>Review deadline: {when(p.due)}</p>
                    {p.decision && <p>{p.decision}</p>}
                    {p.person_id &&
                      p.author === actor.id &&
                      ["accepted", "auto_accepted"].includes(p.status) && (
                        <details>
                          <summary>
                            Request stewardship of the added person
                          </summary>
                          <form
                            onSubmit={(e) =>
                              run(
                                "claim",
                                { ...fields(e), id: p.person_id },
                                "Stewardship request submitted.",
                              )
                            }
                          >
                            <label>
                              Connection
                              <select name="relationship">
                                <option value="guardian">
                                  Parent / guardian of a child
                                </option>
                                <option value="relative">
                                  Adult relative helping maintain the record
                                </option>
                              </select>
                            </label>
                            <label>
                              How can it be checked?
                              <textarea name="reason" required minLength={15} />
                            </label>
                            <button className="outline" disabled={busy}>
                              Request verification
                            </button>
                          </form>
                        </details>
                      )}
                    {p.objections.map((o, i) => (
                      <p key={i}>Objection: {o.reason}</p>
                    ))}
                    {["pending", "disputed", "conflict"].includes(p.status) && (
                      <form
                        onSubmit={(e) =>
                          run(
                            p.author === actor.id ? "decide" : "object",
                            { ...fields(e), id: p.id, decision: "withdraw" },
                            "Review updated.",
                          )
                        }
                      >
                        <label>
                          Reason
                          <textarea name="reason" required minLength={15} />
                        </label>
                        <button className="outline" disabled={busy}>
                          {p.author === actor.id
                            ? "Withdraw proposal"
                            : "Raise objection"}
                        </button>
                      </form>
                    )}
                  </article>
                ))}
              </>
            )}
            {tab === "privacy" && (
              <>
                <div className="m-title">
                  <span className="eyebrow">YOU CHOOSE WHAT TO SHARE</span>
                  <h1>{t("Privacy & account", "गोपनीयता और खाता")}</h1>
                  <p>
                    Sharing applies inside the verified community. There is no
                    public member directory.
                  </p>
                </div>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2>Profile visibility</h2>
                    {!state?.own.some((p) =>
                      ["self", "guardian"].includes(p.relationship || ""),
                    ) ? (
                      <p>
                        After your own profile or guardian connection is
                        verified, your sharing controls appear here. Relatives
                        cannot publish someone else’s contact details.
                      </p>
                    ) : (
                      <>
                        <label>
                          Choose profile
                          <select
                            value={privacyPerson}
                            onChange={(e) => {
                              const p = state.own.find(
                                (p) => p.id === e.target.value,
                              );
                              if (p) {
                                setPrivacyPerson(p.id);
                                setPrivacy(p.settings!);
                              }
                            }}
                          >
                            <option value="">Select your profile</option>
                            {state.own
                              .filter((p) =>
                                ["self", "guardian"].includes(
                                  p.relationship || "",
                                ),
                              )
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                          </select>
                        </label>
                        {privacyPerson && (
                          <form
                            key={privacyPerson}
                            onSubmit={(e) => {
                              const d = fields(e);
                              run(
                                "privacy",
                                {
                                  ...d,
                                  id: privacyPerson,
                                  profileConsent: d.profileConsent === "on",
                                  contactConsent: d.contactConsent === "on",
                                },
                                "Privacy saved. New requests now use these settings.",
                              );
                            }}
                          >
                            <label>
                              Life stage
                              <select
                                name="life"
                                value={privacy.life}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    life: e.target.value,
                                  })
                                }
                              >
                                <option value="adult">Adult</option>
                                <option value="child">Child · under 18</option>
                                <option value="unknown">Not recorded</option>
                                <option value="deceased">Deceased</option>
                              </select>
                            </label>
                            <label>
                              Who can see this profile?
                              <select
                                name="audience"
                                value={privacy.audience}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    audience: e.target.value,
                                  })
                                }
                              >
                                <option value="private">
                                  Only verified stewards and administrators
                                </option>
                                <option value="verified">
                                  Verified community members
                                </option>
                              </select>
                            </label>
                            <label className="m-check">
                              <input type="checkbox" name="profileConsent" />I
                              consent to sharing this profile if I select
                              verified members.
                            </label>
                            <hr />
                            <h3>Contact details</h3>
                            <p className="m-muted">
                              Optional. Use a city only, never an exact home
                              address.
                            </p>
                            {(["email", "phone", "city"] as const).map(
                              (key) => (
                                <label key={key}>
                                  {key === "email"
                                    ? "Email"
                                    : key === "phone"
                                      ? "Phone"
                                      : "Current city"}
                                  <input
                                    name={key}
                                    value={privacy[key]}
                                    onChange={(e) =>
                                      setPrivacy({
                                        ...privacy,
                                        [key]: e.target.value,
                                      })
                                    }
                                    maxLength={
                                      key === "email"
                                        ? 254
                                        : key === "phone"
                                          ? 40
                                          : 120
                                    }
                                  />
                                </label>
                              ),
                            )}
                            <label>
                              Contact visibility
                              <select
                                name="contactAudience"
                                value={privacy.contact_audience}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    contact_audience: e.target.value,
                                  })
                                }
                              >
                                <option value="private">Keep private</option>
                                <option value="verified">
                                  Verified members · adult self-profile only
                                </option>
                              </select>
                            </label>
                            <label className="m-check">
                              <input type="checkbox" name="contactConsent" />
                              These are my contact details and I consent to
                              sharing them if selected.
                            </label>
                            <p className="m-note">
                              Children remain private. Administrators can
                              restrict a profile for safety, but cannot turn
                              sharing on for you.
                            </p>
                            <button className="primary" disabled={busy}>
                              Save privacy choices <Check size={16} />
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </section>
                  <aside className="m-panel">
                    <h2>Account security</h2>
                    <p>
                      Sessions expire after 30 minutes of inactivity or 24
                      hours. Password changes revoke all sessions and replace
                      your recovery code.
                    </p>
                    <form
                      onSubmit={async (e) => {
                        const f = e.currentTarget;
                        if (
                          await run(
                            "password",
                            fields(e),
                            "Password changed. Save your new recovery code.",
                          )
                        )
                          f.reset();
                      }}
                    >
                      <label>
                        Current password
                        <input
                          name="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          required
                        />
                      </label>
                      <label>
                        New password
                        <input
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          minLength={15}
                          maxLength={128}
                          required
                        />
                      </label>
                      <button className="outline" disabled={busy}>
                        Change password
                      </button>
                    </form>
                    <button
                      className="m-danger"
                      onClick={() =>
                        run("logoutAll", {}, "All sessions signed out.")
                      }
                    >
                      Sign out all devices
                    </button>
                    <div className="m-note">
                      <ShieldCheck size={20} />
                      <p>
                        No phone OTP or email verification is claimed here. Your
                        invitation and family review establish community access;
                        a username and password secure your account.
                      </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {tab === "admin" && actor.role === "admin" && (
              <>
                <div className="m-title">
                  <span className="eyebrow">COMMUNITY CARE</span>
                  <h1>Administrator desk</h1>
                  <p>
                    Check the person, their relationship and the source. A
                    verified login is not proof of ancestry.
                  </p>
                </div>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2>Invite a member</h2>
                    <p>
                      Create a single-use invitation. Share it yourself with the
                      intended person. No message is sent by this app.
                    </p>
                    <form
                      onSubmit={async (e) => {
                        const f = e.currentTarget;
                        if (
                          await run("invite", fields(e), "Invitation created.")
                        )
                          f.reset();
                      }}
                    >
                      <label>
                        Recipient label
                        <input
                          name="label"
                          placeholder="Name / family branch"
                          minLength={2}
                          maxLength={120}
                          required
                        />
                      </label>
                      <button className="primary" disabled={busy}>
                        Create invitation <Plus size={16} />
                      </button>
                    </form>
                    {state?.invitations.map((i) => (
                      <div className="m-invite" key={i.id}>
                        <span>
                          <strong>{i.label}</strong>
                          <small>
                            {i.used_by
                              ? "Used"
                              : i.revoked
                                ? "Revoked"
                                : "Expires " + when(i.expires)}
                          </small>
                        </span>
                        {!i.used_by && !i.revoked && (
                          <button
                            className="outline"
                            onClick={() =>
                              run(
                                "revokeInvite",
                                { id: i.id },
                                "Invitation revoked.",
                              )
                            }
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </section>
                  <aside className="m-panel">
                    <h2>Verification principles</h2>
                    <ol>
                      <li>
                        Confirm the person and their family connection through a
                        trusted source.
                      </li>
                      <li>
                        Record what you checked, without uploading identity
                        documents.
                      </li>
                      <li>
                        Keep self, guardian and relative stewardship distinct.
                      </li>
                      <li>
                        Decline conflicting ownership claims; never silently
                        replace a steward.
                      </li>
                    </ol>
                  </aside>
                </div>
                <h2 className="m-section-title">Profile verification</h2>
                {state?.claims
                  .filter((c) => c.status === "pending")
                  .map((c) => (
                    <section className="m-panel" key={c.id}>
                      <div className="m-row">
                        <h3>
                          {c.account_name} → {c.person_name}
                        </h3>
                        <span className="m-badge">{c.relationship}</span>
                      </div>
                      <p>{c.reason}</p>
                      <form
                        className="m-form-grid"
                        onSubmit={(e) => {
                          const d = fields(e);
                          run(
                            "verify",
                            { ...d, id: c.id, approve: d.approve === "yes" },
                            "Verification decision recorded.",
                          );
                        }}
                      >
                        <label>
                          Checked through
                          <select name="method">
                            <option value="family_knowledge">
                              Personal family knowledge
                            </option>
                            <option value="contacted_member">
                              Direct conversation with member / guardian
                            </option>
                            <option value="family_records">
                              Family records / trusted family reference
                            </option>
                          </select>
                        </label>
                        <label>
                          Decision
                          <select name="approve">
                            <option value="yes">Approve connection</option>
                            <option value="no">Decline request</option>
                          </select>
                        </label>
                        <label className="m-wide">
                          What did you check?
                          <textarea
                            name="reason"
                            minLength={15}
                            required
                            maxLength={1000}
                          />
                        </label>
                        <button
                          className="primary"
                          disabled={busy || c.account_id === actor.id}
                        >
                          Record decision
                        </button>
                      </form>
                    </section>
                  ))}
                {!state?.claims.some((c) => c.status === "pending") && (
                  <p className="m-muted">No pending profile requests.</p>
                )}
                <h2 className="m-section-title">Contribution decisions</h2>
                {state?.proposals.map((p) => (
                  <section className="m-panel" key={p.id}>
                    <h3>
                      {p.payload.name} · {p.payload.relation}
                    </h3>
                    <p>
                      {p.author_name} · {p.status}
                    </p>
                    <p>{p.payload.source}</p>
                    {p.objections.map((o, i) => (
                      <p key={i}>Objection: {o.reason}</p>
                    ))}
                    {[
                      "pending",
                      "disputed",
                      "conflict",
                      "accepted",
                      "auto_accepted",
                    ].includes(p.status) && (
                      <form
                        onSubmit={(e) =>
                          run(
                            "decide",
                            { ...fields(e), id: p.id },
                            "Decision recorded.",
                          )
                        }
                      >
                        <label>
                          Decision
                          <select name="decision">
                            {["accepted", "auto_accepted"].includes(
                              p.status,
                            ) ? (
                              <option value="revert">
                                Revert accepted change
                              </option>
                            ) : (
                              <>
                                <option value="accept">
                                  Accept after review
                                </option>
                                <option value="reject">Decline</option>
                              </>
                            )}
                          </select>
                        </label>
                        <label>
                          Reason
                          <textarea name="reason" minLength={15} required />
                        </label>
                        <button
                          className="outline"
                          disabled={busy || p.author === actor.id}
                        >
                          Save decision
                        </button>
                      </form>
                    )}
                  </section>
                ))}
                <h2 className="m-section-title">Appoint a second reviewer</h2>
                <section className="m-panel">
                  <p>
                    A second trusted reviewer can verify the owner's family
                    claim. This grants administrator access to all profiles and
                    verification requests. Confirm your password to appoint a
                    verified member.
                  </p>
                  <form
                    className="m-form-grid"
                    onSubmit={async (e) => {
                      const f = e.currentTarget;
                      if (
                        await run(
                          "appointReviewer",
                          fields(e),
                          "Reviewer appointed. They must sign in again.",
                        )
                      )
                        f.reset();
                    }}
                  >
                    <label>
                      Verified member
                      <select name="id" required>
                        <option value="">Choose a verified member</option>
                        {state?.members
                          .filter((m) => m.role !== "admin" && m.verified)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Your current password
                      <input
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                      />
                    </label>
                    <label className="m-wide">
                      Appointment reason
                      <textarea name="reason" required minLength={15} />
                    </label>
                    <button className="outline" disabled={busy}>
                      Appoint administrator
                    </button>
                  </form>
                </section>
                <h2 className="m-section-title">
                  Access & privacy interventions
                </h2>
                <div className="m-columns">
                  <section className="m-panel">
                    <h3>Revoke member verification</h3>
                    <p>
                      Immediately signs out the member and revokes their
                      approved stewardship. Retains review history.
                    </p>
                    <form
                      onSubmit={(e) =>
                        run(
                          "revokeVerification",
                          fields(e),
                          "Verification revoked and sessions closed.",
                        )
                      }
                    >
                      <label>
                        Member
                        <select name="id" required>
                          <option value="">Choose a verified member</option>
                          {state?.members
                            .filter((m) => m.role !== "admin" && m.verified)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} · @{m.handle}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        Reason
                        <textarea name="reason" required minLength={15} />
                      </label>
                      <button className="outline" disabled={busy}>
                        Revoke verification
                      </button>
                    </form>
                  </section>
                  <section className="m-panel">
                    <h3>Restrict a profile</h3>
                    <p>
                      Sets the profile and contact details to private. This
                      cannot grant sharing consent.
                    </p>
                    <form
                      onSubmit={(e) =>
                        run("restrict", fields(e), "Profile restricted.")
                      }
                    >
                      <label>
                        Profile ID
                        <input
                          name="id"
                          required
                          placeholder="Use a verified claim’s profile ID"
                        />
                      </label>
                      <label>
                        Reason
                        <textarea name="reason" required minLength={15} />
                      </label>
                      <button className="outline" disabled={busy}>
                        Restrict visibility
                      </button>
                    </form>
                    <details>
                      <summary>Resolve a privacy hold</summary>
                      <p>
                        Releases the administrative hold. The profile stays
                        private until its verified person chooses to share
                        again.
                      </p>
                      <form
                        onSubmit={(e) =>
                          run(
                            "releaseRestriction",
                            fields(e),
                            "Hold resolved; visibility stays private.",
                          )
                        }
                      >
                        <label>
                          Profile ID
                          <input name="id" required />
                        </label>
                        <label>
                          Resolution reason
                          <textarea name="reason" required minLength={15} />
                        </label>
                        <button className="outline" disabled={busy}>
                          Resolve hold
                        </button>
                      </form>
                    </details>
                    <details>
                      <summary>Profile IDs for reviewed claims</summary>
                      {state?.claims.map((c) => (
                        <p key={c.id}>
                          {c.person_name}: <code>{c.person_id}</code>
                        </p>
                      ))}
                    </details>
                  </section>
                </div>
                <details className="m-panel">
                  <summary>Recent audit events</summary>
                  {state?.audit.map((a) => (
                    <p key={a.id}>
                      {when(a.created)} · {a.action.replaceAll("_", " ")}
                    </p>
                  ))}
                </details>
              </>
            )}
          </main>
        </>
      )}
      <footer className="m-footer">
        <span>
          लुहाच परिवार ·{" "}
          {t(
            "Our roots. Our responsibility.",
            "हमारी जड़ें। हमारी ज़िम्मेदारी।",
          )}
        </span>
        <span>Member access · Local review</span>
      </footer>
      {secret && (
        <div className="m-secret-backdrop">
          <section
            ref={secretRef}
            tabIndex={-1}
            className="m-panel m-secret"
            role="dialog"
            aria-modal="true"
            aria-label={secret.label}
          >
            <KeyRound size={30} />
            <h2>{secret.label}</h2>
            <p>
              Save this somewhere private before closing. It is shown once and
              is never stored in readable form. Do not post it in the family
              archive.
            </p>
            <textarea
              readOnly
              aria-label="Private code"
              value={secret.value}
              onFocus={(e) => e.target.select()}
            />
            <button className="primary" onClick={() => setSecret(null)}>
              I have saved it privately <Check size={16} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function HomeIcon({ size = 17 }: { size?: number }) {
  return <Heart size={size} />;
}
