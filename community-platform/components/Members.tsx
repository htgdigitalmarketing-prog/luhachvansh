"use client";
import {hiText,hiError} from "../lib/hindi.mjs";
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
    throw Object.assign(Error(result.error || "अनुरोध पूरा नहीं हो सका।"), {
      status: r.status,
    });
  return result;
}
const when = (n: number) =>
  new Date(n).toLocaleDateString("hi-IN", {
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
    [hi, setHi] = useState(true);
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
      setError(hiError(e.message));
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
            setMessage("30 मिनट तक उपयोग न होने पर लॉगआउट कर दिया गया।");
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
            if (active) setError(hiError(e.message));
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
    notice = "सुरक्षित किया गया।",
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await call(action, data);
      if (r.recovery)
        setSecret({ label: "आपका एक बार दिखाया जाने वाला खाता पुनर्प्राप्ति कोड", value: r.recovery });
      if (r.code)
        setSecret({
          label: "एक बार उपयोग वाला निमंत्रण · सात दिन तक मान्य",
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
      setError(hiError((e as Error).message));
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
        setError(hiError((e as Error).message));
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
        <small>{p.relationship ? hiText(p.relationship) : p.village}</small>
      </span>
      <ArrowRight size={16} />
    </button>
  );
  if (!loaded)
    return (
      <div className="loading">
        <Sprout size={40} />
        <h1>लुहाच परिवार</h1>
        <p>{error || "सदस्य क्षेत्र खुल रहा है…"}</p>
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
            <small> हमारा अपना परिवार </small>
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
                aria-label="लॉगआउट करें"
                onClick={() => run("logout", {}, "लॉगआउट हो गया।")}
              >
                <LogOut size={19} />
              </button>
            </>
          )}
        </div>
      </header>
      {error && (
        <div className="m-alert error" role="alert">
          {hiError(error)}
          <button aria-label="संदेश बंद करें" onClick={() => setError("")}>
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
                  ? "इस कंप्यूटर में रखे निजी प्रशासक-स्थापना कोड से खाता बनाएँ। अपना पासवर्ड स्वयं चुनें।"
                  : mode === "register"
                    ? "प्रशासक से एक बार उपयोग वाला निमंत्रण प्राप्त करें।"
                    : "खाता बनाते समय सुरक्षित किया गया पुनर्प्राप्ति कोड इस्तेमाल करें।"}
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
                    "स्वागत है। आपका खाता तैयार है।",
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
                    ? "खाता पुनर्प्राप्ति कोड"
                    : mode === "setup"
                      ? "निजी प्रशासक-स्थापना कोड"
                      : "निमंत्रण कोड"}
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
                  ? t("नया पासवर्ड", "नया पासवर्ड")
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
                  <small> कम से कम 15 अक्षर रखें। याद रहने वाला लंबा वाक्य भी इस्तेमाल कर सकते हैं। </small>
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
                    <summary> सदस्य गोपनीयता विवरण </summary>
                    <p> आपका नाम, खाता, परिवार से रिश्ते के अनुरोध और समीक्षा का विवरण इस सेवा में रखा जाता है। प्रशासक सत्यापन अनुरोध और प्रोफ़ाइल देखते हैं। सत्यापित सदस्य केवल उनके साथ साझा की गई प्रोफ़ाइल और संपर्क देख सकते हैं। पुरानी वंशावली प्रविष्टियाँ सत्यापित सदस्यों को उपलब्ध हैं; नई प्रोफ़ाइल निजी रहती है। संपर्क विवरण पहचान का प्रमाण नहीं है। पहचान-पत्र, सरकारी पहचान संख्या या घर का पूरा पता अनुरोध में न दें। आप किसी भी समय जानकारी साझा करना बंद कर सकते हैं। परिवार के अभिलेख संबंधी विवादों के समाधान के लिए समीक्षा का इतिहास रखा जाता है। </p>
                  </details>
                </>
              )}
              <button className="primary" disabled={busy}>
                {busy
                  ? t("कृपया प्रतीक्षा करें…", "कृपया प्रतीक्षा करें…")
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
                  ? "पहले से सदस्य हैं? लॉगिन करें"
                  : "निमंत्रण मिला है? सदस्य बनें"}
              </button>
              <button
                onClick={() => {
                  setMode(mode === "recover" ? "signin" : "recover");
                  setError("");
                }}
              >
                {mode === "recover"
                  ? "लॉगिन पर वापस जाएँ"
                  : "पासवर्ड भूल गए?"}
              </button>
              {setup && (
                <button
                  onClick={() => {
                    setMode("setup");
                    setError("");
                  }}
                > प्रथम प्रशासक खाता बनाएँ </button>
              )}
            </div>
          </section>
        </main>
      ) : (
        <>
          <nav className="m-nav" aria-label="सदस्य नेविगेशन">
            {[
              ["home", "मुख्य जानकारी", "परिचय", HomeIcon],
              ["search", "परिवार खोजें", "परिवार खोजें", Search],
              ["requests", "अनुरोध", "अनुरोध", UserCheck],
              ["privacy", "गोपनीयता और खाता", "गोपनीयता", Settings],
              ...(actor.role === "admin"
                ? [["admin", "प्रशासक कक्ष", "प्रशासक", ShieldCheck]]
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
                            "आपका सत्यापन हो गया है। अपना परिवार खोजें और तय करें कि कौन-सी जानकारी साझा करनी है।",
                            "आपका खाता सत्यापित है। अपना परिवार खोजें और जानकारी साझा करने के विकल्प चुनें।",
                          )
                        : t(
                            "आपका खाता तैयार है। अब इसे परिवार की आपकी प्रोफ़ाइल से जोड़ें।",
                            "आपका खाता तैयार है। अब इसे परिवार की प्रोफ़ाइल से जोड़ें।",
                          )}
                    </p>
                  </div>
                  <span
                    className={"m-badge " + (actor.verified ? "verified" : "")}
                  >
                    <ShieldCheck size={17} />
                    {actor.role === "admin"
                      ? "प्रशासक"
                      : actor.verified
                        ? "परिवार का रिश्ता सत्यापित"
                        : "सत्यापन आवश्यक"}
                  </span>
                </section>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2>
                      {t("आपके परिवार की प्रोफ़ाइल", "आपके परिवार की प्रोफ़ाइल")}
                    </h2>
                    {state?.own.length ? (
                      state.own.map((p) => (
                        <div className="m-owned" key={p.id}>
                          {card(p)}
                          <span className="m-badge">
                            <LockKeyhole size={13} />
                            {p.audience === "verified"
                              ? "सत्यापित सदस्यों से साझा"
                              : "निजी प्रोफ़ाइल"}
                          </span>
                          {["self", "guardian"].includes(
                            p.relationship || "",
                          ) && (
                            <button
                              className="outline"
                              onClick={() => editPrivacy(p)}
                            > गोपनीयता चुनें </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="m-empty">
                        <Sprout size={35} />
                        <p>
                          {t(
                            "पहले वंशावली में अपना नाम खोजें। नाम नहीं मिले तो नई प्रोफ़ाइल का अनुरोध करें।",
                            "परिवार अभिलेख में अपना नाम खोजें। नाम न होने पर नई प्रोफ़ाइल का अनुरोध करें।",
                          )}
                        </p>
                        <button
                          className="primary"
                          onClick={() => setTab("search")}
                        > मेरी प्रोफ़ाइल खोजें <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </section>
                  <aside className="m-panel">
                    <h2>{t("आपके अनुरोधों की स्थिति", "आपके अपडेट")}</h2>
                    {state?.notifications.length ? (
                      state.notifications.map((n) => (
                        <p className="m-update" key={n.id}>
                          {hiText(n.body)}
                        </p>
                      ))
                    ) : (
                      <p className="m-muted"> सत्यापन और आपके योगदान की जानकारी यहाँ दिखाई देगी। </p>
                    )}
                    <div className="m-note">
                      <LockKeyhole size={19} />
                      <p> आपका लंबित सत्यापन अनुरोध केवल आप और प्रशासक देख सकते हैं। </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {tab === "search" && (
              <>
                <div className="m-title">
                  <span className="eyebrow"> हमारी साझा वंशावली </span>
                  <h1>{t("Find your family", "अपना परिवार खोजें")}</h1>
                  <p>
                    {actor.verified
                      ? "नाम या गाँव से खोजें। निजी प्रोफ़ाइल खोज में नहीं दिखाई जाती।"
                      : "सत्यापन के लिए संग्रह में अपना नाम या गाँव खोजें। स्वीकृति मिलने के बाद परिवार के रिश्ते खुलेंगे।"}
                  </p>
                </div>
                <label className="m-search">
                  <Search size={20} />
                  <input
                    aria-label="वंशावली में खोजें"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="नाम या गाँव"
                    maxLength={100}
                  />
                </label>
                <div className="m-results">{results.map(card)}</div>
                {query.length >= 2 && !results.length && (
                  <p className="m-muted"> कोई नाम नहीं मिला। हिंदी नाम या दूसरी वर्तनी से खोजें। </p>
                )}
                <details className="m-panel">
                  <summary>
                    {t(
                      "नाम नहीं मिला? अपनी प्रोफ़ाइल का अनुरोध करें",
                      "अभिलेख में नाम नहीं है? अपनी प्रोफ़ाइल बनाएँ",
                    )}
                  </summary>
                  <p> दोहरी प्रविष्टि से बचने के लिए पहले खोजें। प्रशासक के सत्यापन तक नई प्रोफ़ाइल निजी रहेगी। </p>
                  <form
                    className="m-form-grid"
                    onSubmit={async (e) => {
                      const form = e.currentTarget;
                      if (
                        await run(
                          "createProfile",
                          fields(e),
                          "निजी प्रोफ़ाइल का अनुरोध भेज दिया गया। प्रशासक इसकी जाँच करेंगे।",
                        )
                      ) {
                        form.reset();
                        setTab("requests");
                      }
                    }}
                  >
                    <label> पूरा नाम <input
                        name="name"
                        required
                        maxLength={120}
                        defaultValue={actor.name}
                      />
                    </label>
                    <label> हिंदी नाम / अन्य प्रचलित नाम <input name="aliases" maxLength={120} />
                    </label>
                    <label> पैतृक गाँव <input name="village" required maxLength={120} />
                    </label>
                    <label className="m-wide"> परिवार से रिश्ता और जाँच का तरीका <textarea
                        name="reason"
                        required
                        minLength={15}
                        maxLength={1000}
                        placeholder="माता-पिता या रिश्तेदार का नाम, गाँव और परिवार का संदर्भ दें। पहचान-पत्र या घर का पूरा पता न दें।"
                      />
                    </label>
                    <button className="primary" disabled={busy}> सत्यापन का अनुरोध भेजें <UserCheck size={16} />
                    </button>
                  </form>
                </details>
              </>
            )}
            {selected && (
              <section className="m-panel m-family">
                <button
                  className="m-close"
                  aria-label="प्रोफ़ाइल बंद करें"
                  onClick={() => {
                    setSelected(null);
                    setFamily(null);
                  }}
                >
                  <X size={18} />
                </button>
                <span className="eyebrow"> परिवार की प्रोफ़ाइल </span>
                <h2>{selected.name}</h2>
                <p>{selected.village}</p>
                {family && (
                  <>
                    <div className="m-tabs">
                      <button
                        className={view === "birth" ? "active" : ""}
                        onClick={() => setView("birth")}
                      > जन्म का परिवार </button>
                      <button
                        className={view === "married" ? "active" : ""}
                        onClick={() => setView("married")}
                      > विवाह का परिवार </button>
                    </div>
                    {(view === "birth"
                      ? [
                          ["माता-पिता", family.parents],
                          ["भाई-बहन", family.siblings],
                        ]
                      : [
                          ["पति / पत्नी", family.spouses],
                          ["बच्चे", family.children],
                        ]
                    ).map(([label, persons]) => (
                      <div key={label as string}>
                        <h3>{label as string}</h3>
                        <div className="m-results">
                          {(persons as Person[]).map(card)}
                        </div>
                        {!(persons as Person[]).length && (
                          <p className="m-muted"> इस खाते को कोई दर्ज रिश्ता उपलब्ध नहीं है। यहाँ नाम न दिखने का अर्थ यह नहीं कि रिश्तेदार नहीं है। </p>
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
                            <small> यह संपर्क सदस्य ने दिया है; इसका स्वतंत्र सत्यापन नहीं हुआ है। </small>
                          </p>
                        </div>
                      )}
                  </>
                )}
                <details>
                  <summary> इस प्रोफ़ाइल से अपना रिश्ता सत्यापित कराएँ </summary>
                  <form
                    onSubmit={(e) => {
                      const d = fields(e);
                      run(
                        "claim",
                        { ...d, id: selected.id },
                        "सत्यापन का अनुरोध प्रशासकों को भेज दिया गया।",
                      );
                    }}
                  >
                    <label> आपका रिश्ता <select name="relationship">
                        <option value="self"> यह मेरी प्रोफ़ाइल है </option>
                        <option value="guardian"> मैं माता-पिता / अभिभावक हूँ </option>
                        <option value="relative"> मैं इस रिश्तेदार की जानकारी सँभालता/सँभालती हूँ </option>
                      </select>
                    </label>
                    <label> प्रशासक इसकी जाँच कैसे कर सकते हैं? <textarea
                        name="reason"
                        required
                        minLength={15}
                        maxLength={1000}
                      />
                    </label>
                    <button className="primary" disabled={busy}> सत्यापन का अनुरोध भेजें </button>
                  </form>
                </details>
                {actor.verified && family && (
                  <details>
                    <summary> छूटा हुआ परिवार का सदस्य जोड़ें </summary>
                    <form
                      className="m-form-grid"
                      onSubmit={(e) =>
                        run(
                          "propose",
                          { id: selected.id, payload: fields(e) },
                          "जानकारी सात दिन की समीक्षा के लिए सुरक्षित है। नई प्रोफ़ाइल निजी रहेगी।",
                        )
                      }
                    >
                      <label> रिश्ता <select name="relation">
                          <option value="daughter"> बेटी </option>
                          <option value="mother"> माता </option>
                          <option value="spouse"> पति / पत्नी / बहू </option>
                          <option value="son"> बेटा </option>
                          <option value="father"> पिता </option>
                        </select>
                      </label>
                      <label> पूरा नाम (पहले से दर्ज व्यक्ति जोड़ रहे हों तो खाली रखें) <input name="name" maxLength={120} />
                      </label>
                      <label> लिंग <select name="gender">
                          <option value="female"> महिला </option>
                          <option value="male"> पुरुष </option>
                          <option value="unknown"> जानकारी दर्ज नहीं </option>
                        </select>
                      </label>
                      <label> गाँव <input
                          name="village"
                          required
                          defaultValue={selected.village}
                        />
                      </label>
                      <label className="m-wide"> स्रोत / परिवार का संदर्भ <textarea
                          name="source"
                          required
                          minLength={15}
                          maxLength={1000}
                        />
                      </label>
                      <ProfilePicker
                        name="existingId"
                        label="पहले से वंशावली में हैं? उसी व्यक्ति से जोड़ें, दूसरी प्रविष्टि न बनाएँ।"
                      />
                      <ProfilePicker
                        name="secondId"
                        label="दूसरे परिवार का वैकल्पिक रिश्ता: पत्नी / बहू के लिए उनके जन्म के परिवार के माता या पिता चुनें। अन्य रिश्तों के लिए उस व्यक्ति के पति या पत्नी चुनें।"
                      />
                      <button className="primary" disabled={busy}> समीक्षा के लिए भेजें </button>
                    </form>
                  </details>
                )}
              </section>
            )}
            {tab === "requests" && (
              <>
                <div className="m-title">
                  <span className="eyebrow"> सत्यापित रिश्ते </span>
                  <h1>{t("Requests & contributions", "अनुरोध और योगदान")}</h1>
                  <p> परिवार के रिश्ते का सत्यापन प्रशासक करते हैं। यह अपने-आप स्वीकृत नहीं होता। </p>
                </div>
                {state?.claims
                  .filter((c) => c.account_id === actor.id)
                  .map((c) => (
                    <article className="m-panel m-request" key={c.id}>
                      <div>
                        <h3>{c.person_name}</h3>
                        <span className="m-badge">{hiText(c.status)}</span>
                      </div>
                      <p>{c.reason}</p>
                      {c.decision && (
                        <p className="m-note"> समीक्षा: {c.decision}</p>
                      )}
                    </article>
                  ))}
                {!state?.claims.some((c) => c.account_id === actor.id) && (
                  <div className="m-panel">
                    <p> अभी कोई सत्यापन अनुरोध नहीं है। </p>
                    <button
                      className="outline"
                      onClick={() => setTab("search")}
                    > मेरी प्रोफ़ाइल खोजें </button>
                  </div>
                )}
                {state?.proposals.map((p) => (
                  <article className="m-panel" key={p.id}>
                    <h3>
                      {p.payload.name} · {hiText(p.payload.relation)}
                    </h3>
                    <span className="m-badge">{hiText(p.status)}</span>
                    <p>{p.payload.source}</p>
                    <p> समीक्षा की अंतिम तिथि: {when(p.due)}</p>
                    {p.decision && <p>{p.decision}</p>}
                    {p.person_id &&
                      p.author === actor.id &&
                      ["accepted", "auto_accepted"].includes(p.status) && (
                        <details>
                          <summary> जोड़े गए व्यक्ति की जानकारी सँभालने की अनुमति माँगें </summary>
                          <form
                            onSubmit={(e) =>
                              run(
                                "claim",
                                { ...fields(e), id: p.person_id },
                                "जानकारी सँभालने की अनुमति का अनुरोध भेज दिया गया।",
                              )
                            }
                          >
                            <label> रिश्ता <select name="relationship">
                                <option value="guardian"> बच्चे के माता-पिता / अभिभावक </option>
                                <option value="relative"> वयस्क रिश्तेदार की जानकारी सँभालने वाला सदस्य </option>
                              </select>
                            </label>
                            <label> इसकी जाँच कैसे होगी? <textarea name="reason" required minLength={15} />
                            </label>
                            <button className="outline" disabled={busy}> सत्यापन का अनुरोध भेजें </button>
                          </form>
                        </details>
                      )}
                    {p.objections.map((o, i) => (
                      <p key={i}> आपत्ति: {o.reason}</p>
                    ))}
                    {["pending", "disputed", "conflict"].includes(p.status) && (
                      <form
                        onSubmit={(e) =>
                          run(
                            p.author === actor.id ? "decide" : "object",
                            { ...fields(e), id: p.id, decision: "withdraw" },
                            "समीक्षा अद्यतन की गई।",
                          )
                        }
                      >
                        <label> कारण <textarea name="reason" required minLength={15} />
                        </label>
                        <button className="outline" disabled={busy}>
                          {p.author === actor.id
                            ? "अनुरोध वापस लें"
                            : "आपत्ति दर्ज करें"}
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
                  <span className="eyebrow"> साझा करना आपका निर्णय </span>
                  <h1>{t("गोपनीयता और खाता", "गोपनीयता और खाता")}</h1>
                  <p> जानकारी केवल सत्यापित सदस्य समुदाय में साझा होती है। संपर्क सूची आम पाठकों को नहीं दिखाई जाती। </p>
                </div>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2> प्रोफ़ाइल किसे दिखे </h2>
                    {!state?.own.some((p) =>
                      ["self", "guardian"].includes(p.relationship || ""),
                    ) ? (
                      <p> आपकी अपनी प्रोफ़ाइल या अभिभावक का रिश्ता सत्यापित होने के बाद ये विकल्प उपलब्ध होंगे। रिश्तेदार किसी और का संपर्क प्रकाशित नहीं कर सकते। </p>
                    ) : (
                      <>
                        <label> प्रोफ़ाइल चुनें <select
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
                            <option value=""> अपनी प्रोफ़ाइल चुनें </option>
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
                                "गोपनीयता सुरक्षित की गई। आगे के अनुरोधों पर ये विकल्प लागू होंगे।",
                              );
                            }}
                          >
                            <label> जीवन की स्थिति <select
                                name="life"
                                value={privacy.life}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    life: e.target.value,
                                  })
                                }
                              >
                                <option value="adult"> वयस्क </option>
                                <option value="child"> बच्चा · 18 वर्ष से कम </option>
                                <option value="unknown"> जानकारी दर्ज नहीं </option>
                                <option value="deceased"> दिवंगत </option>
                              </select>
                            </label>
                            <label> यह प्रोफ़ाइल कौन देख सकता है? <select
                                name="audience"
                                value={privacy.audience}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    audience: e.target.value,
                                  })
                                }
                              >
                                <option value="private"> केवल सत्यापित देखभालकर्ता और प्रशासक </option>
                                <option value="verified"> सत्यापित सदस्य </option>
                              </select>
                            </label>
                            <label className="m-check">
                              <input type="checkbox" name="profileConsent" /> सत्यापित सदस्य चुनने पर मैं इस प्रोफ़ाइल को उनके साथ साझा करने की सहमति देता/देती हूँ। </label>
                            <hr />
                            <h3> संपर्क विवरण </h3>
                            <p className="m-muted"> वैकल्पिक। केवल शहर लिखें, घर का पूरा पता न दें। </p>
                            {(["email", "phone", "city"] as const).map(
                              (key) => (
                                <label key={key}>
                                  {key === "email"
                                    ? "ईमेल"
                                    : key === "phone"
                                      ? "फ़ोन"
                                      : "वर्तमान शहर"}
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
                            <label> संपर्क किसे दिखे <select
                                name="contactAudience"
                                value={privacy.contact_audience}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    contact_audience: e.target.value,
                                  })
                                }
                              >
                                <option value="private"> निजी रखें </option>
                                <option value="verified"> सत्यापित सदस्य · केवल अपनी वयस्क प्रोफ़ाइल </option>
                              </select>
                            </label>
                            <label className="m-check">
                              <input type="checkbox" name="contactConsent" /> यह मेरा संपर्क विवरण है। साझा करने का विकल्प चुनने पर मैं इसकी सहमति देता/देती हूँ। </label>
                            <p className="m-note"> बच्चों की जानकारी निजी रहती है। प्रशासक सुरक्षा के लिए प्रोफ़ाइल छिपा सकते हैं, पर आपकी ओर से साझा करना शुरू नहीं कर सकते। </p>
                            <button className="primary" disabled={busy}> गोपनीयता के विकल्प सुरक्षित करें <Check size={16} />
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </section>
                  <aside className="m-panel">
                    <h2> खाते की सुरक्षा </h2>
                    <p> 30 मिनट उपयोग न होने या 24 घंटे बाद लॉगिन समाप्त होता है। पासवर्ड बदलने पर सभी उपकरण लॉगआउट होंगे और नया पुनर्प्राप्ति कोड मिलेगा। </p>
                    <form
                      onSubmit={async (e) => {
                        const f = e.currentTarget;
                        if (
                          await run(
                            "password",
                            fields(e),
                            "पासवर्ड बदल दिया गया। अपना नया पुनर्प्राप्ति कोड सुरक्षित रखें।",
                          )
                        )
                          f.reset();
                      }}
                    >
                      <label> वर्तमान पासवर्ड <input
                          name="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          required
                        />
                      </label>
                      <label> नया पासवर्ड <input
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          minLength={15}
                          maxLength={128}
                          required
                        />
                      </label>
                      <button className="outline" disabled={busy}> पासवर्ड बदलें </button>
                    </form>
                    <button
                      className="m-danger"
                      onClick={() =>
                        run("logoutAll", {}, "सभी उपकरण लॉगआउट हो गए।")
                      }
                    > सभी उपकरणों से लॉगआउट करें </button>
                    <div className="m-note">
                      <ShieldCheck size={20} />
                      <p> समुदाय में प्रवेश निमंत्रण और परिवार के रिश्ते की जाँच से मिलता है। यूज़रनेम और पासवर्ड से आपका खाता सुरक्षित होता है। फ़ोन या ईमेल से सत्यापन यहाँ उपलब्ध नहीं है। </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {tab === "admin" && actor.role === "admin" && (
              <>
                <div className="m-title">
                  <span className="eyebrow"> समुदाय की देखभाल </span>
                  <h1> प्रशासक कक्ष </h1>
                  <p> व्यक्ति, परिवार से रिश्ता और जानकारी का स्रोत जाँचें। केवल लॉगिन होने से वंश का रिश्ता सिद्ध नहीं होता। </p>
                </div>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2> सदस्य को निमंत्रण दें </h2>
                    <p> एक बार उपयोग वाला निमंत्रण बनाएँ और संबंधित व्यक्ति को स्वयं दें। यहाँ से अपने-आप संदेश नहीं भेजा जाता। </p>
                    <form
                      onSubmit={async (e) => {
                        const f = e.currentTarget;
                        if (
                          await run("invite", fields(e), "निमंत्रण तैयार है।")
                        )
                          f.reset();
                      }}
                    >
                      <label> जिसे निमंत्रण देना है <input
                          name="label"
                          placeholder="नाम / परिवार की शाखा"
                          minLength={2}
                          maxLength={120}
                          required
                        />
                      </label>
                      <button className="primary" disabled={busy}> निमंत्रण बनाएँ <Plus size={16} />
                      </button>
                    </form>
                    {state?.invitations.map((i) => (
                      <div className="m-invite" key={i.id}>
                        <span>
                          <strong>{i.label}</strong>
                          <small>
                            {i.used_by
                              ? "उपयोग हो चुका"
                              : i.revoked
                                ? "रद्द"
                                : "मान्य होने की अंतिम तिथि " + when(i.expires)}
                          </small>
                        </span>
                        {!i.used_by && !i.revoked && (
                          <button
                            className="outline"
                            onClick={() =>
                              run(
                                "revokeInvite",
                                { id: i.id },
                                "निमंत्रण रद्द कर दिया गया।",
                              )
                            }
                          > रद्द करें </button>
                        )}
                      </div>
                    ))}
                  </section>
                  <aside className="m-panel">
                    <h2> सत्यापन के नियम </h2>
                    <ol>
                      <li> विश्वसनीय स्रोत से व्यक्ति और परिवार के रिश्ते की पुष्टि करें। </li>
                      <li> जाँच का विवरण लिखें। पहचान-पत्र अपलोड न करें। </li>
                      <li> अपनी प्रोफ़ाइल, अभिभावक और रिश्तेदार की अनुमति अलग रखें। </li>
                      <li> परस्पर विरोधी दावों का समाधान करें। जानकारी सँभालने वाले व्यक्ति को बिना निर्णय के न बदलें। </li>
                    </ol>
                  </aside>
                </div>
                <h2 className="m-section-title"> प्रोफ़ाइल सत्यापन </h2>
                {state?.claims
                  .filter((c) => c.status === "pending")
                  .map((c) => (
                    <section className="m-panel" key={c.id}>
                      <div className="m-row">
                        <h3>
                          {c.account_name} → {c.person_name}
                        </h3>
                        <span className="m-badge">{hiText(c.relationship)}</span>
                      </div>
                      <p>{c.reason}</p>
                      <form
                        className="m-form-grid"
                        onSubmit={(e) => {
                          const d = fields(e);
                          run(
                            "verify",
                            { ...d, id: c.id, approve: d.approve === "yes" },
                            "सत्यापन का निर्णय दर्ज हो गया।",
                          );
                        }}
                      >
                        <label> जाँच का आधार <select name="method">
                            <option value="family_knowledge"> परिवार की व्यक्तिगत जानकारी </option>
                            <option value="contacted_member"> सदस्य / अभिभावक से सीधी बातचीत </option>
                            <option value="family_records"> परिवार के अभिलेख / विश्वसनीय संदर्भ </option>
                          </select>
                        </label>
                        <label> निर्णय <select name="approve">
                            <option value="yes"> रिश्ता स्वीकृत करें </option>
                            <option value="no"> अनुरोध अस्वीकार करें </option>
                          </select>
                        </label>
                        <label className="m-wide"> आपने क्या जाँचा? <textarea
                            name="reason"
                            minLength={15}
                            required
                            maxLength={1000}
                          />
                        </label>
                        <button
                          className="primary"
                          disabled={busy || c.account_id === actor.id}
                        > निर्णय दर्ज करें </button>
                      </form>
                    </section>
                  ))}
                {!state?.claims.some((c) => c.status === "pending") && (
                  <p className="m-muted"> कोई प्रोफ़ाइल अनुरोध लंबित नहीं है। </p>
                )}
                <h2 className="m-section-title"> योगदान पर निर्णय </h2>
                {state?.proposals.map((p) => (
                  <section className="m-panel" key={p.id}>
                    <h3>
                      {p.payload.name} · {hiText(p.payload.relation)}
                    </h3>
                    <p>
                      {p.author_name} · {hiText(p.status)}
                    </p>
                    <p>{p.payload.source}</p>
                    {p.objections.map((o, i) => (
                      <p key={i}> आपत्ति: {o.reason}</p>
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
                            "निर्णय दर्ज हो गया।",
                          )
                        }
                      >
                        <label> निर्णय <select name="decision">
                            {["accepted", "auto_accepted"].includes(
                              p.status,
                            ) ? (
                              <option value="revert"> स्वीकृत बदलाव वापस लें </option>
                            ) : (
                              <>
                                <option value="accept"> समीक्षा के बाद स्वीकार करें </option>
                                <option value="reject"> अस्वीकार करें </option>
                              </>
                            )}
                          </select>
                        </label>
                        <label> कारण <textarea name="reason" minLength={15} required />
                        </label>
                        <button
                          className="outline"
                          disabled={busy || p.author === actor.id}
                        > निर्णय सुरक्षित करें </button>
                      </form>
                    )}
                  </section>
                ))}
                <h2 className="m-section-title"> दूसरा समीक्षक नियुक्त करें </h2>
                <section className="m-panel">
                  <p> दूसरा विश्वसनीय समीक्षक मुख्य प्रशासक के परिवार के रिश्ते की जाँच कर सकता है। उसे सभी प्रोफ़ाइल और सत्यापन अनुरोधों पर प्रशासक अधिकार मिलेंगे। नियुक्ति के लिए अपना पासवर्ड दें। </p>
                  <form
                    className="m-form-grid"
                    onSubmit={async (e) => {
                      const f = e.currentTarget;
                      if (
                        await run(
                          "appointReviewer",
                          fields(e),
                          "समीक्षक नियुक्त हुआ। उन्हें फिर लॉगिन करना होगा।",
                        )
                      )
                        f.reset();
                    }}
                  >
                    <label> सत्यापित सदस्य <select name="id" required>
                        <option value=""> सत्यापित सदस्य चुनें </option>
                        {state?.members
                          .filter((m) => m.role !== "admin" && m.verified)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label> आपका वर्तमान पासवर्ड <input
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                      />
                    </label>
                    <label className="m-wide"> नियुक्ति का कारण <textarea name="reason" required minLength={15} />
                    </label>
                    <button className="outline" disabled={busy}> प्रशासक नियुक्त करें </button>
                  </form>
                </section>
                <h2 className="m-section-title"> प्रवेश और गोपनीयता संबंधी कार्य </h2>
                <div className="m-columns">
                  <section className="m-panel">
                    <h3> सदस्य का सत्यापन रद्द करें </h3>
                    <p> सदस्य तुरंत लॉगआउट होगा और उसकी जानकारी सँभालने की अनुमति समाप्त होगी। समीक्षा का इतिहास सुरक्षित रहेगा। </p>
                    <form
                      onSubmit={(e) =>
                        run(
                          "revokeVerification",
                          fields(e),
                          "सत्यापन रद्द हुआ और लॉगिन बंद हो गए।",
                        )
                      }
                    >
                      <label> सदस्य <select name="id" required>
                          <option value=""> सत्यापित सदस्य चुनें </option>
                          {state?.members
                            .filter((m) => m.role !== "admin" && m.verified)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} · @{m.handle}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label> कारण <textarea name="reason" required minLength={15} />
                      </label>
                      <button className="outline" disabled={busy}> सत्यापन रद्द करें </button>
                    </form>
                  </section>
                  <section className="m-panel">
                    <h3> प्रोफ़ाइल निजी करें </h3>
                    <p> प्रोफ़ाइल और संपर्क निजी हो जाएँगे। इससे साझा करने की सहमति नहीं मिलती। </p>
                    <form
                      onSubmit={(e) =>
                        run("restrict", fields(e), "प्रोफ़ाइल निजी कर दी गई।")
                      }
                    >
                      <label> प्रोफ़ाइल क्रमांक <input
                          name="id"
                          required
                          placeholder="सत्यापित अनुरोध का प्रोफ़ाइल क्रमांक दें"
                        />
                      </label>
                      <label> कारण <textarea name="reason" required minLength={15} />
                      </label>
                      <button className="outline" disabled={busy}> प्रोफ़ाइल छिपाएँ </button>
                    </form>
                    <details>
                      <summary> गोपनीयता रोक का समाधान करें </summary>
                      <p> प्रशासक की रोक हट जाएगी। व्यक्ति स्वयं दोबारा साझा करने का विकल्प चुने तब तक प्रोफ़ाइल निजी रहेगी। </p>
                      <form
                        onSubmit={(e) =>
                          run(
                            "releaseRestriction",
                            fields(e),
                            "रोक हटा दी गई; प्रोफ़ाइल अभी निजी है।",
                          )
                        }
                      >
                        <label> प्रोफ़ाइल क्रमांक <input name="id" required />
                        </label>
                        <label> समाधान का कारण <textarea name="reason" required minLength={15} />
                        </label>
                        <button className="outline" disabled={busy}> रोक का समाधान करें </button>
                      </form>
                    </details>
                    <details>
                      <summary> जाँचे गए अनुरोधों के प्रोफ़ाइल क्रमांक </summary>
                      {state?.claims.map((c) => (
                        <p key={c.id}>
                          {c.person_name}: <code>{c.person_id}</code>
                        </p>
                      ))}
                    </details>
                  </section>
                </div>
                <details className="m-panel">
                  <summary> हाल के कार्यों का विवरण </summary>
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
            "हमारी जड़ें। हमारी ज़िम्मेदारी।",
            "हमारी जड़ें। हमारी ज़िम्मेदारी।",
          )}
        </span>
        <span> सदस्य क्षेत्र </span>
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
            <p> बंद करने से पहले इसे निजी जगह सुरक्षित करें। यह केवल एक बार दिखता है और पढ़े जा सकने वाले रूप में रखा नहीं जाता। इसे परिवार के संग्रह में न डालें। </p>
            <textarea
              readOnly
              aria-label="निजी कोड"
              value={secret.value}
              onFocus={(e) => e.target.select()}
            />
            <button className="primary" onClick={() => setSecret(null)}> मैंने इसे निजी जगह सुरक्षित कर लिया है <Check size={16} />
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
