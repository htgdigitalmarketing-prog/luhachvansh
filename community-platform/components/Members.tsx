"use client";
import {Text,useLanguage} from "./Language";
import {hiText,hiError} from "../lib/hindi.mjs";
import { useEffect, useState, useRef, FormEvent } from "react";
import ProfilePicker from "./ProfilePicker";
import NodeOnboarding from "./NodeOnboarding";
import RelativeForm from "./RelativeForm";
import MemberTree from "./MemberTree";
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
  person_village?: string;
  person_parent?: string;
  person_generation?: string;
  person_kind?: string;
  search_name?: string;
  search_village?: string;
  search_parent?: string;
  candidates?: number;
  similar?: number;
};
type Proposal = {
  id: string;
  author: string;
  author_name: string;
  anchor: string;
  anchor_name?: string;
  identity_verified?: boolean;
  person_code?: string | null;
  payload: { name: string; relation: string; source: string; relative?: boolean; villageUnknown?: boolean; life?: string; sourceType?: string; birthFamily?: string; marriage?: string; existingId?: string; secondId?: string };
  status: string;
  decision?: string;
  due: number;
  person_id?: string;
  objections: { reason: string }[];
};
type State = {
  actor: Actor;
  onboarding?: { required: boolean; claim: { id: string; status: string; person_id: string; person_name: string; person_village: string; person_code?: string; person_generation?: string; person_parent?: string } | null };
  canConfirmOwnNode?: boolean;
  recoveryOwner?: boolean;
  recoveryRequests?: {id:string;name:string;handle:string;note:string;created:number}[];
  introduction?: { about_hi: string; about_en: string; family_hi: string; family_en: string; updated: number };
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
  const {language,setLanguage,tr}=useLanguage();
  const hi=language==="hi";
  const [actor, setActor] = useState<Actor | null>(null),
    [state, setState] = useState<State | null>(null),
    [loaded, setLoaded] = useState(false),
    [setup, setSetup] = useState(false),
    [tab, setTab] = useState("home"),
    [mode, setMode] = useState("signin"),
    [unusedLanguageFlag] = useState(true);
  const [error, setError] = useState(""),
    [setupPrepared, setSetupPrepared] = useState(false),
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
  const t = (en: string, hindi: string) => (hi ? hindi : tr(en));
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
  const [inviteCode, setInviteCode] = useState("");
  useEffect(() => {
    // "?mode=register" opens account creation. An invitation shared as "#invite=…" stays in the fragment
    // (never sent to the server or in referrers); it is copied into the form and removed from the address bar.
    const params = new URLSearchParams(window.location.search);
    const invite = new URLSearchParams(window.location.hash.slice(1)).get("invite");
    if (params.get("mode") === "register" || invite) setMode("register");
    if (invite) {
      setInviteCode(invite.slice(0, 200));
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
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
      if (r.code)
        setSecret({
          label: action === "issueRecovery" ? "सदस्य की खाता सहायता का निजी कोड" : "एक बार उपयोग वाला निमंत्रण · सात दिन तक मान्य",
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
  // Relative proposals: objection window once the proposer is verified; children always need an administrator.
  const moderation = (p: Proposal) =>
    p.payload.relative && p.status === "pending"
      ? !p.identity_verified
        ? hi ? "प्रस्तावक की पहचान की पुष्टि की प्रतीक्षा" : "Waiting for the proposer's identity check"
        : p.payload.life === "child"
          ? hi ? "बच्चे की जानकारी — प्रशासक का निर्णय आवश्यक" : "Child's record — needs an administrator"
          : hi ? `आपत्ति अवधि ${when(p.due)} तक; आपत्ति न हो तो स्वीकृत` : `Objection window until ${when(p.due)}; accepted if no objection`
      : tr(p.status);
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
  const onboarding = !!state?.onboarding?.required;
  const personal = state?.onboarding?.claim || null;
  if (!loaded)
    return (
      <div className="loading">
        <Sprout size={40} />
        <h1> <Text value="लुहाच परिवार"/> </h1>
        <p>{error || "सदस्य क्षेत्र खुल रहा है…"}</p>
      </div>
    );
  return (
    <div className="members-app">
      <div className="preview-bar">
        <span>
          <LockKeyhole size={12} />
          {t("REVIEW WEBSITE · SEPARATE FROM THE LIVE SITE", "समीक्षा वेबसाइट · लाइव साइट से अलग")}
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
            <strong> <Text value="लुहाच परिवार"/> </strong>
            <small> <Text value="हमारा अपना परिवार"/> </small>
          </span>
        </a>
        <div className="header-actions">
          <button className="language" onClick={() => setLanguage(hi?"en":"hi")}>
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
                aria-label={tr("लॉगआउट करें")}
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
          {tr(hiError(error))}
          <button aria-label={tr("संदेश बंद करें")} onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {message && (
        <div className="m-alert success" role="status">
          {tr(message)}
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
                      "Simple sign-in and help from your administrator",
                      "सरल लॉगिन और प्रशासक की सहायता",
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
            {(mode === "signin" || mode === "register") && (
              <div className="m-auth-switch" role="group" aria-label={t("Sign in or create an account", "लॉगिन या नया खाता")}>
                <button type="button" aria-pressed={mode === "signin"} className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>
                  <KeyRound size={16} /> {t("Sign in", "लॉगिन")}
                </button>
                <button type="button" aria-pressed={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>
                  <Plus size={16} /> {hi ? "खाता बनाएँ" : "Create account"}
                </button>
              </div>
            )}
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
                  ? t("Create your first administrator account. Choose a password you can remember.", "पहला प्रशासक खाता बनाएँ। अपनी पसंद का याद रहने वाला पासवर्ड चुनें।")
                  : mode === "help" ? (hi ? "नाम और गाँव बताकर प्रशासक से सहायता माँगें।" : "Ask the administrator for help using your name and village.") : mode === "register"
                    ? (hi ? "खाता बनाने के लिए प्रशासक से मिला एक बार उपयोग वाला निमंत्रण कोड चाहिए। खाता बनते ही अगला चरण वंशावली में अपनी प्रविष्टि चुनना है।" : "You need the one-time invitation code from an administrator. Right after creating the account, the next step is choosing your own entry in the family tree.")
                    : "खाता बनाते समय सुरक्षित किया गया पुनर्प्राप्ति कोड इस्तेमाल करें।"}
            </p>
            {mode === "help" ? <form onSubmit={e=>run("requestRecovery",fields(e),hi ? "यदि यह सदस्य खाता मौजूद है, तो सहायता अनुरोध प्रशासक तक पहुँचा दिया गया है।" : "If this account exists, your request has reached the administrator.")}>
              <p>{hi ? "कोड याद रखने की ज़रूरत नहीं। प्रशासक से अपनी पहचान की जाँच कराकर सहायता लें।" : "You do not need to remember a code. Ask the administrator to check your identity and help."}</p>
              <label>{hi ? "नाम या यूज़रनेम" : "Name or username"}<input name="username" required maxLength={120}/></label>
              <label>{hi ? "प्रशासक आपको कैसे पहचानें?" : "How can the administrator identify you?"}<textarea name="note" required minLength={5} maxLength={500} placeholder={hi ? "नाम, गाँव या परिचित रिश्तेदार बताएँ। पहचान-पत्र या पूरा पता न दें।" : "Name, village or a known relative. No identity documents or home address."}/></label>
              <button className="primary" disabled={busy}>{hi ? "प्रशासक से सहायता माँगें" : "Ask the administrator for help"}</button>
            </form> : <form
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
                <label hidden={mode === "setup" && setupPrepared} style={mode === "setup" && setupPrepared ? {display:"none"} : undefined}>
                  {mode === "recover"
                    ? "खाता पुनर्प्राप्ति कोड"
                    : mode === "setup"
                      ? "निजी प्रशासक-स्थापना कोड"
                      : (hi ? "निमंत्रण कोड" : "Invitation code")}
                  <input
                    name="code"
                    type="password"
                    required
                    autoComplete="off"
                    maxLength={200}
                    defaultValue={mode === "register" ? inviteCode : undefined}
                    onChange={e => { if (mode === "setup") setSetupPrepared(e.target.value.length >= 32); }}
                  />
                </label>
              )}
              {mode === "setup" && setupPrepared && <p className="m-muted">{hi ? "पहले प्रशासक की स्थापना तैयार है। अब अपना पासवर्ड चुनें।" : "Administrator setup is ready. Choose your password."}</p>}
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
                  minLength={1}
                  maxLength={128}
                />
                {mode !== "signin" && (
                  <small>{hi ? "अपनी पसंद का याद रहने वाला पासवर्ड रखें।" : "Choose a password you can remember."}</small>
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
                    <summary> <Text value="सदस्य गोपनीयता विवरण"/> </summary>
                    <p> <Text value="आपका नाम, खाता, परिवार से रिश्ते के अनुरोध और समीक्षा का विवरण इस सेवा में रखा जाता है। प्रशासक सत्यापन अनुरोध और प्रोफ़ाइल देखते हैं। सत्यापित सदस्य केवल उनके साथ साझा की गई प्रोफ़ाइल और संपर्क देख सकते हैं। पुरानी वंशावली प्रविष्टियाँ सत्यापित सदस्यों को उपलब्ध हैं; नई प्रोफ़ाइल निजी रहती है। संपर्क विवरण पहचान का प्रमाण नहीं है। पहचान-पत्र, सरकारी पहचान संख्या या घर का पूरा पता अनुरोध में न दें। आप किसी भी समय जानकारी साझा करना बंद कर सकते हैं। परिवार के अभिलेख संबंधी विवादों के समाधान के लिए समीक्षा का इतिहास रखा जाता है।"/> </p>
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
            </form>}
            <div className="m-auth-links">
              <button onClick={()=>{setMode(mode === "help" ? "signin" : "help");setError("");}}>{hi ? (mode === "help" ? "लॉगिन पर वापस जाएँ" : "पासवर्ड भूल गए? प्रशासक से सहायता लें") : (mode === "help" ? "Back to sign in" : "Forgot your password? Ask the administrator")}</button>
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
                  : (hi ? "सुरक्षा कोड है? उससे खाता वापस पाएँ" : "Have a recovery code? Use it")}
              </button>
              {setup && (
                <button
                  onClick={() => {
                    setMode("setup");
                    setError("");
                  }}
                > <Text value="प्रथम प्रशासक खाता बनाएँ"/> </button>
              )}
            </div>
          </section>
        </main>
      ) : (
        <>
          <nav className="m-nav" aria-label={tr("सदस्य नेविगेशन")}>
            {[
              ["home", onboarding ? "Link to the family tree" : "मुख्य जानकारी", onboarding ? "वंशावली से जुड़ें" : "परिचय", HomeIcon],
              // Until the account is linked to a node, members only see onboarding and account security.
              ...(onboarding && actor.role !== "admin"
                ? []
                : [
                    ...(personal?.status === "approved" ? [["tree", "My family tree", "मेरा वंश-वृक्ष", Users]] : []),
                    ["search", "परिवार खोजें", "परिवार खोजें", Search],
                    ["requests", "अनुरोध", "अनुरोध", UserCheck],
                  ]),
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
                      ? t("Administrator", "प्रशासक")
                      : actor.verified
                        ? t("Family connection verified", "परिवार का रिश्ता सत्यापित")
                        : t("Verification required", "सत्यापन आवश्यक")}
                  </span>
                </section>
                {onboarding && (
                  <NodeOnboarding
                    actorName={actor.name}
                    onDone={async (notice) => {
                      await refresh();
                      setMessage(notice);
                    }}
                  />
                )}
                {personal && (
                  <section className="m-panel m-personal">
                    <h2>{hi ? "वंशावली में आपकी प्रविष्टि" : "Your entry in the family tree"}</h2>
                    <p>
                      <strong>{personal.person_name}</strong> · {personal.person_village}
                    </p>
                    <span className={"m-badge " + (personal.status === "approved" ? "verified" : "")}>
                      <ShieldCheck size={15} />
                      {personal.status === "approved"
                        ? hi ? "पहचान सत्यापित" : "Identity verified"
                        : state?.canConfirmOwnNode
                          ? hi ? "आपकी अपनी स्पष्ट पुष्टि लंबित है" : "Waiting for your own explicit confirmation"
                          : hi ? "एक अलग समीक्षक की जाँच लंबित है" : "Waiting for an independent reviewer"}
                    </span>
                    {personal.status === "pending" && state?.canConfirmOwnNode && (
                      <form
                        className="m-form-grid m-owner-confirm"
                        onSubmit={(e) => {
                          const d = fields(e);
                          run(
                            "confirmOwnNode",
                            { id: personal.id, confirm: d.confirm === "on", statement: d.statement },
                            hi ? "आपकी प्रविष्टि की पुष्टि दर्ज हो गई और लॉग में सुरक्षित है।" : "Your own entry is confirmed and recorded in the audit log.",
                          );
                        }}
                      >
                        <h3 className="m-wide">{hi ? "मूल मुख्य प्रशासक: अपनी प्रविष्टि की स्वयं पुष्टि" : "Original owner: confirm your own entry"}</h3>
                        <p className="m-muted m-wide">
                          {hi
                            ? "यह विकल्प केवल साइट के मूल मुख्य प्रशासक खाते को, केवल उसकी अपनी प्रविष्टि के लिए मिलता है। अन्य सदस्यों और नियुक्त समीक्षकों के अनुरोध पहले की तरह किसी अलग समीक्षक से जाँचे जाते हैं। पुष्टि अपने-आप नहीं होती; यह निर्णय कारण सहित स्थायी लॉग में दर्ज होगा।"
                            : "Only the site's original owner account gets this option, and only for its own entry. Other members' and appointed reviewers' requests are still checked by a separate reviewer. Nothing is confirmed automatically; this decision is kept in the permanent audit log with your statement."}
                        </p>
                        <dl className="m-claim-context m-wide">
                          <dt>{hi ? "नाम" : "Name"}</dt><dd>{personal.person_name}</dd>
                          <dt>{hi ? "गाँव" : "Village"}</dt><dd>{personal.person_village || (hi ? "दर्ज नहीं" : "not recorded")}</dd>
                          <dt>{hi ? "मूल क्रमांक" : "Record no."}</dt><dd><code>{personal.person_code || "—"}</code></dd>
                          <dt>{hi ? "दर्ज पिता / माता" : "Recorded parent"}</dt><dd>{personal.person_parent || (hi ? "दर्ज नहीं" : "not recorded")}</dd>
                          {personal.person_generation && <><dt>{hi ? "पीढ़ी" : "Generation"}</dt><dd>{personal.person_generation}</dd></>}
                        </dl>
                        <label className="m-wide">{hi ? "आप कैसे जानते हैं कि यह आपकी प्रविष्टि है?" : "How do you know this entry is yours?"}
                          <textarea name="statement" required minLength={15} maxLength={1000} />
                        </label>
                        <label className="m-check m-wide">
                          <input type="checkbox" name="confirm" required />
                          {hi
                            ? "मैं मूल मुख्य प्रशासक हूँ और पुष्टि करता/करती हूँ कि ऊपर दिखाई गई नाम, गाँव, मूल क्रमांक और पिता वाली प्रविष्टि मेरी अपनी है।"
                            : "I am the original owner and confirm that the entry above, with this name, village, record number and parent, is my own."}
                        </label>
                        <button className="primary" disabled={busy}>{hi ? "अपनी प्रविष्टि की पुष्टि करें" : "Confirm my own entry"}</button>
                      </form>
                    )}
                    {personal.status === "approved" && (
                      <button
                        className="outline"
                        onClick={() => open({ id: personal.person_id, name: personal.person_name, village: personal.person_village, kind: "archive" })}
                      >
                        {hi ? "मेरा परिवार देखें" : "Open my family"} <ArrowRight size={15} />
                      </button>
                    )}
                    {personal.status === "approved" && (
                      <button className="primary" onClick={() => { setTab("tree"); setSelected(null); setFamily(null); }}>
                        {hi ? "मेरा वंश-वृक्ष देखें" : "View my family tree"} <ArrowRight size={15} />
                      </button>
                    )}
                  </section>
                )}
                {personal && (
                  <RelativeForm
                    anchorName={personal.person_name}
                    identityVerified={personal.status === "approved"}
                    busy={busy}
                    submit={(d) =>
                      run(
                        "proposeRelative",
                        d,
                        hi
                          ? "प्रस्ताव सुरक्षित हुआ। आपत्ति अवधि पूरी होने और स्वीकार होने तक यह वंशावली में नहीं जुड़ेगा।"
                          : "Proposal saved. It joins the family tree only after its objection window ends and it is accepted.",
                      )
                    }
                  />
                )}
                <section className="m-panel">
                  <h2>{hi ? "मेरा परिचय और परिवार" : "About me and my family"}</h2>
                  <p className="m-muted">{hi ? "यह निजी मसौदा केवल आपके खाते में दिखता है। इसे सहेजने से वंशावली में कोई रिश्ता नहीं जुड़ता और पहचान सत्यापित नहीं होती। घर का पता, पहचान-पत्र या पासवर्ड न लिखें।" : "This private draft is visible only in your account. Saving it does not add genealogy links or verify an identity. Leave out home addresses, identity documents and passwords."}</p>
                  <form className="m-form-grid" key={state?.introduction?.updated || "new-introduction"}
                    onSubmit={async e => { await run("saveIntroduction", fields(e), hi ? "आपका निजी परिचय सहेज लिया गया।" : "Your private introduction was saved."); }}>
                    <label>{hi ? "मेरे बारे में — हिन्दी" : "About me — Hindi"}<textarea name="about_hi" maxLength={3000} rows={5} defaultValue={state?.introduction?.about_hi || ""} /></label>
                    <label>{hi ? "मेरे बारे में — English" : "About me — English"}<textarea name="about_en" maxLength={3000} rows={5} defaultValue={state?.introduction?.about_en || ""} /></label>
                    <label>{hi ? "परिवार का परिचय — हिन्दी" : "Family introduction — Hindi"}<textarea name="family_hi" maxLength={3000} rows={5} defaultValue={state?.introduction?.family_hi || ""} /></label>
                    <label>{hi ? "परिवार का परिचय — English" : "Family introduction — English"}<textarea name="family_en" maxLength={3000} rows={5} defaultValue={state?.introduction?.family_en || ""} /></label>
                    <button className="primary" disabled={busy}>{hi ? "निजी परिचय सहेजें" : "Save private introduction"}</button>
                  </form>
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
                            {p.audience === "public"
                              ? hi ? "सार्वजनिक वंशावली में (सहमति से)" : "In the public tree (by consent)"
                              : p.audience === "verified"
                                ? tr("सत्यापित सदस्यों से साझा")
                                : tr("निजी प्रोफ़ाइल")}
                          </span>
                          {["self", "guardian"].includes(
                            p.relationship || "",
                          ) && (
                            <button
                              className="outline"
                              onClick={() => editPrivacy(p)}
                            > <Text value="गोपनीयता चुनें"/> </button>
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
                        {!personal && !onboarding && (
                          <button
                            className="primary"
                            onClick={() => setTab("home")}
                          > <Text value="मेरी प्रोफ़ाइल खोजें"/> <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                  <aside className="m-panel">
                    <h2>{t("आपके अनुरोधों की स्थिति", "आपके अपडेट")}</h2>
                    {state?.notifications.length ? (
                      state.notifications.map((n) => (
                        <p className="m-update" key={n.id}>
                          {tr(n.body)}
                        </p>
                      ))
                    ) : (
                      <p className="m-muted"> <Text value="सत्यापन और आपके योगदान की जानकारी यहाँ दिखाई देगी।"/> </p>
                    )}
                    <div className="m-note">
                      <LockKeyhole size={19} />
                      <p> <Text value="आपका लंबित सत्यापन अनुरोध केवल आप और प्रशासक देख सकते हैं।"/> </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {tab === "tree" && (
              <MemberTree accountId={actor.id} onOpen={(p) => open({ ...p, kind: "archive" })} />
            )}
            {tab === "search" && (
              <>
                <div className="m-title">
                  <span className="eyebrow"> <Text value="हमारी साझा वंशावली"/> </span>
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
                    aria-label={tr("वंशावली में खोजें")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={tr("नाम या गाँव")}
                    maxLength={100}
                  />
                </label>
                <div className="m-results">{results.map(card)}</div>
                {query.length >= 2 && !results.length && (
                  <p className="m-muted"> <Text value="कोई नाम नहीं मिला। हिंदी नाम या दूसरी वर्तनी से खोजें।"/> </p>
                )}
                {onboarding && (
                  <p className="m-note">
                    {hi
                      ? "अपनी प्रविष्टि चुनने या नई निजी प्रोफ़ाइल माँगने के लिए “वंशावली से जुड़ें” चरण पूरा करें।"
                      : "To choose your own entry or request a private new profile, complete the “Link to the family tree” step."}{" "}
                    <button className="outline" onClick={() => setTab("home")}>{hi ? "वंशावली से जुड़ें" : "Link to the family tree"}</button>
                  </p>
                )}
              </>
            )}
            {selected && (
              <section className="m-panel m-family">
                <button
                  className="m-close"
                  aria-label={tr("प्रोफ़ाइल बंद करें")}
                  onClick={() => {
                    setSelected(null);
                    setFamily(null);
                  }}
                >
                  <X size={18} />
                </button>
                <span className="eyebrow"> <Text value="परिवार की प्रोफ़ाइल"/> </span>
                <h2>{selected.name}</h2>
                <p>{selected.village}</p>
                {family && (
                  <>
                    <div className="m-tabs">
                      <button
                        className={view === "birth" ? "active" : ""}
                        onClick={() => setView("birth")}
                      > <Text value="जन्म का परिवार"/> </button>
                      <button
                        className={view === "married" ? "active" : ""}
                        onClick={() => setView("married")}
                      > <Text value="विवाह का परिवार"/> </button>
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
                          <p className="m-muted"> <Text value="इस खाते को कोई दर्ज रिश्ता उपलब्ध नहीं है। यहाँ नाम न दिखने का अर्थ यह नहीं कि रिश्तेदार नहीं है।"/> </p>
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
                            <small> <Text value="यह संपर्क सदस्य ने दिया है; इसका स्वतंत्र सत्यापन नहीं हुआ है।"/> </small>
                          </p>
                        </div>
                      )}
                  </>
                )}
                <details>
                  <summary>{hi ? "इस व्यक्ति की जानकारी सँभालने की अनुमति माँगें (अभिभावक / रिश्तेदार)" : "Ask to look after this person's record (guardian / relative)"}</summary>
                  <p className="m-muted">{hi ? "अपनी स्वयं की प्रविष्टि केवल “वंशावली से जुड़ें” चरण में चुनी जाती है।" : "Your own entry is chosen only in the “Link to the family tree” step."}</p>
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
                    <label> <Text value="आपका रिश्ता"/> <select name="relationship">
                        <option value="guardian"> <Text value="मैं माता-पिता / अभिभावक हूँ"/> </option>
                        <option value="relative"> <Text value="मैं इस रिश्तेदार की जानकारी सँभालता/सँभालती हूँ"/> </option>
                      </select>
                    </label>
                    <label> <Text value="प्रशासक इसकी जाँच कैसे कर सकते हैं?"/> <textarea
                        name="reason"
                        required
                        minLength={15}
                        maxLength={1000}
                      />
                    </label>
                    <button className="primary" disabled={busy}> <Text value="सत्यापन का अनुरोध भेजें"/> </button>
                  </form>
                </details>
                {actor.verified && family && (
                  <details>
                    <summary> <Text value="छूटा हुआ परिवार का सदस्य जोड़ें"/> </summary>
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
                      <label> <Text value="रिश्ता"/> <select name="relation">
                          <option value="daughter"> <Text value="बेटी"/> </option>
                          <option value="mother"> <Text value="माता"/> </option>
                          <option value="spouse"> <Text value="पति / पत्नी / बहू"/> </option>
                          <option value="son"> <Text value="बेटा"/> </option>
                          <option value="father"> <Text value="पिता"/> </option>
                        </select>
                      </label>
                      <label> <Text value="पूरा नाम (पहले से दर्ज व्यक्ति जोड़ रहे हों तो खाली रखें)"/> <input name="name" maxLength={120} />
                      </label>
                      <label> <Text value="लिंग"/> <select name="gender">
                          <option value="female"> <Text value="महिला"/> </option>
                          <option value="male"> <Text value="पुरुष"/> </option>
                          <option value="unknown"> <Text value="जानकारी दर्ज नहीं"/> </option>
                        </select>
                      </label>
                      <label> <Text value="गाँव"/> <input
                          name="village"
                          required
                          defaultValue={selected.village}
                        />
                      </label>
                      <label className="m-wide"> <Text value="स्रोत / परिवार का संदर्भ"/> <textarea
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
                      <button className="primary" disabled={busy}> <Text value="समीक्षा के लिए भेजें"/> </button>
                    </form>
                  </details>
                )}
              </section>
            )}
            {tab === "requests" && (
              <>
                <div className="m-title">
                  <span className="eyebrow"> <Text value="सत्यापित रिश्ते"/> </span>
                  <h1>{t("Requests & contributions", "अनुरोध और योगदान")}</h1>
                  <p> <Text value="परिवार के रिश्ते का सत्यापन प्रशासक करते हैं। यह अपने-आप स्वीकृत नहीं होता।"/> </p>
                </div>
                {state?.claims
                  .filter((c) => c.account_id === actor.id)
                  .map((c) => (
                    <article className="m-panel m-request" key={c.id}>
                      <div>
                        <h3>{c.person_name}</h3>
                        <span className="m-badge">{tr(c.status)}</span>
                      </div>
                      <p>{c.reason}</p>
                      {c.decision && (
                        <p className="m-note"> <Text value="समीक्षा:"/> {c.decision}</p>
                      )}
                    </article>
                  ))}
                {!state?.claims.some((c) => c.account_id === actor.id) && (
                  <div className="m-panel">
                    <p> <Text value="अभी कोई सत्यापन अनुरोध नहीं है।"/> </p>
                    <button
                      className="outline"
                      onClick={() => setTab("home")}
                    > <Text value="मेरी प्रोफ़ाइल खोजें"/> </button>
                  </div>
                )}
                {state?.proposals.map((p) => (
                  <article className="m-panel" key={p.id}>
                    <h3>
                      {p.payload.name} · {tr(p.payload.relation)}
                    </h3>
                    <span className="m-badge">{moderation(p)}</span>
                    {p.anchor_name && <p className="m-muted">{hi ? "जिससे जोड़ा जाना है:" : "Linked to:"} {p.anchor_name}</p>}
                    <p>{p.payload.source}</p>
                    {!p.payload.relative && <p> <Text value="समीक्षा की अंतिम तिथि:"/> {when(p.due)}</p>}
                    {p.person_code && p.author === actor.id && (
                      <p className="m-note">
                        {hi ? "स्थायी पारिवारिक कोड:" : "Permanent family code:"} <code>{p.person_code}</code>.{" "}
                        {hi
                          ? "यदि यह व्यक्ति वयस्क है, यह कोड उन्हें निजी रूप से दें। वे अपने खाते में इसी कोड से अपनी प्रविष्टि चुनकर सत्यापन माँग सकते हैं और चाहें तो सार्वजनिक वंशावली में दिखने की सहमति दे सकते हैं।"
                          : "If this person is an adult, give them this code privately. With it they can choose their own entry from their account, ask for verification and, if they wish, consent to appear in the public family tree."}
                      </p>
                    )}
                    {p.decision && <p>{p.decision}</p>}
                    {p.person_id &&
                      p.author === actor.id &&
                      ["accepted", "auto_accepted"].includes(p.status) && (
                        <details>
                          <summary> <Text value="जोड़े गए व्यक्ति की जानकारी सँभालने की अनुमति माँगें"/> </summary>
                          <form
                            onSubmit={(e) =>
                              run(
                                "claim",
                                { ...fields(e), id: p.person_id },
                                "जानकारी सँभालने की अनुमति का अनुरोध भेज दिया गया।",
                              )
                            }
                          >
                            <label> <Text value="रिश्ता"/> <select name="relationship">
                                <option value="guardian"> <Text value="बच्चे के माता-पिता / अभिभावक"/> </option>
                                <option value="relative"> <Text value="वयस्क रिश्तेदार की जानकारी सँभालने वाला सदस्य"/> </option>
                              </select>
                            </label>
                            <label> <Text value="इसकी जाँच कैसे होगी?"/> <textarea name="reason" required minLength={15} />
                            </label>
                            <button className="outline" disabled={busy}> <Text value="सत्यापन का अनुरोध भेजें"/> </button>
                          </form>
                        </details>
                      )}
                    {p.objections.map((o, i) => (
                      <p key={i}> <Text value="आपत्ति:"/> {o.reason}</p>
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
                        <label> <Text value="कारण"/> <textarea name="reason" required minLength={15} />
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
                  <span className="eyebrow"> <Text value="साझा करना आपका निर्णय"/> </span>
                  <h1>{t("गोपनीयता और खाता", "गोपनीयता और खाता")}</h1>
                  <p> <Text value="जानकारी केवल सत्यापित सदस्य समुदाय में साझा होती है। संपर्क सूची आम पाठकों को नहीं दिखाई जाती।"/> </p>
                </div>
                <div className="m-columns">
                  <section className="m-panel">
                    <h2> <Text value="प्रोफ़ाइल किसे दिखे"/> </h2>
                    {!state?.own.some((p) =>
                      ["self", "guardian"].includes(p.relationship || ""),
                    ) ? (
                      <p> <Text value="आपकी अपनी प्रोफ़ाइल या अभिभावक का रिश्ता सत्यापित होने के बाद ये विकल्प उपलब्ध होंगे। रिश्तेदार किसी और का संपर्क प्रकाशित नहीं कर सकते।"/> </p>
                    ) : (
                      <>
                        <label> <Text value="प्रोफ़ाइल चुनें"/> <select
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
                            <option value=""> <Text value="अपनी प्रोफ़ाइल चुनें"/> </option>
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
                                  publicConsent: d.publicConsent === "on",
                                  contactConsent: d.contactConsent === "on",
                                },
                                "गोपनीयता सुरक्षित की गई। आगे के अनुरोधों पर ये विकल्प लागू होंगे।",
                              );
                            }}
                          >
                            <label> <Text value="जीवन की स्थिति"/> <select
                                name="life"
                                value={privacy.life}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    life: e.target.value,
                                  })
                                }
                              >
                                <option value="adult"> <Text value="वयस्क"/> </option>
                                <option value="child"> <Text value="बच्चा · 18 वर्ष से कम"/> </option>
                                <option value="unknown"> <Text value="जानकारी दर्ज नहीं"/> </option>
                                <option value="deceased"> <Text value="दिवंगत"/> </option>
                              </select>
                            </label>
                            <label> <Text value="यह प्रोफ़ाइल कौन देख सकता है?"/> <select
                                name="audience"
                                value={privacy.audience}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    audience: e.target.value,
                                  })
                                }
                              >
                                <option value="private"> <Text value="केवल सत्यापित देखभालकर्ता और प्रशासक"/> </option>
                                <option value="verified"> <Text value="सत्यापित सदस्य"/> </option>
                                <option value="public">{hi ? "सार्वजनिक वंशावली भी (केवल वयस्क, अपनी सहमति से)" : "Also the public family tree (adults, own consent only)"}</option>
                              </select>
                            </label>
                            {privacy.audience === "public" && (
                              <label className="m-check">
                                <input type="checkbox" name="publicConsent" required />
                                {hi
                                  ? "मैं वयस्क हूँ और अपनी सहमति देता/देती हूँ कि मेरा नाम, गाँव और दर्ज रिश्ते बिना लॉगिन वाली सार्वजनिक वंशावली और लुहाच मित्र में दिखें। संपर्क विवरण कभी सार्वजनिक नहीं होते। यह सहमति कभी भी वापस ले सकते हैं।"
                                  : "I am an adult and consent to my name, village and recorded relationships appearing in the public family tree and Luhach Mitra without sign-in. Contact details are never public. I can withdraw this at any time."}
                              </label>
                            )}
                            <label className="m-check">
                              <input type="checkbox" name="profileConsent" /> <Text value="सत्यापित सदस्य चुनने पर मैं इस प्रोफ़ाइल को उनके साथ साझा करने की सहमति देता/देती हूँ।"/> </label>
                            <hr />
                            <h3> <Text value="संपर्क विवरण"/> </h3>
                            <p className="m-muted"> <Text value="वैकल्पिक। केवल शहर लिखें, घर का पूरा पता न दें।"/> </p>
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
                            <label> <Text value="संपर्क किसे दिखे"/> <select
                                name="contactAudience"
                                value={privacy.contact_audience}
                                onChange={(e) =>
                                  setPrivacy({
                                    ...privacy,
                                    contact_audience: e.target.value,
                                  })
                                }
                              >
                                <option value="private"> <Text value="निजी रखें"/> </option>
                                <option value="verified"> <Text value="सत्यापित सदस्य · केवल अपनी वयस्क प्रोफ़ाइल"/> </option>
                              </select>
                            </label>
                            <label className="m-check">
                              <input type="checkbox" name="contactConsent" /> <Text value="यह मेरा संपर्क विवरण है। साझा करने का विकल्प चुनने पर मैं इसकी सहमति देता/देती हूँ।"/> </label>
                            <p className="m-note"> <Text value="बच्चों की जानकारी निजी रहती है। प्रशासक सुरक्षा के लिए प्रोफ़ाइल छिपा सकते हैं, पर आपकी ओर से साझा करना शुरू नहीं कर सकते।"/> </p>
                            <button className="primary" disabled={busy}> <Text value="गोपनीयता के विकल्प सुरक्षित करें"/> <Check size={16} />
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </section>
                  <aside className="m-panel">
                    <h2> <Text value="खाते की सुरक्षा"/> </h2>
                    <p> <Text value="30 मिनट उपयोग न होने या 24 घंटे बाद लॉगिन समाप्त होता है। पासवर्ड बदलने पर सभी उपकरण लॉगआउट होंगे और नया पुनर्प्राप्ति कोड मिलेगा।"/> </p>
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
                      <label> <Text value="वर्तमान पासवर्ड"/> <input
                          name="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          required
                        />
                      </label>
                      <label> <Text value="नया पासवर्ड"/> <input
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          minLength={1}
                          maxLength={128}
                          required
                        />
                      </label>
                      <button className="outline" disabled={busy}> <Text value="पासवर्ड बदलें"/> </button>
                    </form>
                    <button
                      className="m-danger"
                      onClick={() =>
                        run("logoutAll", {}, "सभी उपकरण लॉगआउट हो गए।")
                      }
                    > <Text value="सभी उपकरणों से लॉगआउट करें"/> </button>
                    <div className="m-note">
                      <ShieldCheck size={20} />
                      <p>{hi ? "पासवर्ड भूलने पर प्रशासक से सहायता माँगें। सुरक्षा कोड की निजी प्रति सर्वर पर सुरक्षित रखी जाती है; उसे खुद सहेजना अनिवार्य नहीं है। पहचान की जाँच के बाद ही सहायता मिलेगी।" : "If you forget your password, ask the administrator. Recovery copies are stored securely on the server; members are not required to keep a code. Assistance follows an identity check."}</p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {tab === "admin" && actor.role === "admin" && (
              <>
                <div className="m-title">
                  <span className="eyebrow"> <Text value="समुदाय की देखभाल"/> </span>
                  <h1> <Text value="प्रशासक कक्ष"/> </h1>
                  <p> <Text value="व्यक्ति, परिवार से रिश्ता और जानकारी का स्रोत जाँचें। केवल लॉगिन होने से वंश का रिश्ता सिद्ध नहीं होता।"/> </p>
                </div>
                <div className="m-columns">
                  {state?.recoveryOwner && <section className="m-panel">
                    <h2>{hi ? "खाता सहायता — मुख्य प्रशासक" : "Account help — owner administrator"}</h2>
                    <p>{hi ? "सदस्यों को कोड सँभालने की ज़रूरत नहीं। उनकी पहचान जाँचें, फिर नया सहायता कोड जारी करें। पासवर्ड पढ़े नहीं जा सकते।" : "Members do not need to keep codes. Check their identity before issuing a replacement. Passwords cannot be read."}</p>
                    <button className="outline" onClick={async()=>{try { const r=await call("recoveryCopies",{});const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,exported:new Date().toISOString(),copies:r.copies},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="luhach-private-recovery-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); } catch(e){setError(hiError((e as Error).message));}}}>{hi ? "निजी सहायता कोड की बैकअप प्रति डाउनलोड करें" : "Download private recovery backup"}</button>
                    <details><summary>{hi ? "पहले से बने अपने कोड की प्रति सुरक्षित करें" : "Save a copy of your existing recovery code"}</summary><form onSubmit={e=>run("saveRecoveryCopy",fields(e),hi ? "निजी प्रति सुरक्षित हो गई।" : "Private copy saved.")}><label>{hi ? "आपका वर्तमान निजी कोड" : "Your current private code"}<input name="code" type="password" required autoComplete="off" maxLength={200}/></label><button className="primary" disabled={busy}>{hi ? "निजी प्रति सुरक्षित करें" : "Save private copy"}</button></form></details>
                    {(state.recoveryRequests || []).map(r=><form key={r.id} onSubmit={e=>run("issueRecovery",{...fields(e),id:r.id},hi ? "पहचान जाँच के बाद सहायता कोड जारी किया गया।" : "Recovery issued after identity review.")}><h3>{r.name} · {r.handle}</h3><p>{r.note}</p><label>{hi ? "आपने पहचान कैसे जाँची?" : "How did you check the identity?"}<textarea name="reason" required minLength={10} maxLength={1000}/></label><button className="primary" disabled={busy}>{hi ? "जाँच के बाद सहायता कोड जारी करें" : "Issue recovery after review"}</button></form>)}
                  </section>}
                  <section className="m-panel">
                    <h2> <Text value="सदस्य को निमंत्रण दें"/> </h2>
                    <p> <Text value="एक बार उपयोग वाला निमंत्रण बनाएँ और संबंधित व्यक्ति को स्वयं दें। यहाँ से अपने-आप संदेश नहीं भेजा जाता।"/> </p>
                    <form
                      onSubmit={async (e) => {
                        const f = e.currentTarget;
                        if (
                          await run("invite", fields(e), "निमंत्रण तैयार है।")
                        )
                          f.reset();
                      }}
                    >
                      <label> <Text value="जिसे निमंत्रण देना है"/> <input
                          name="label"
                          placeholder={tr("नाम / परिवार की शाखा")}
                          minLength={2}
                          maxLength={120}
                          required
                        />
                      </label>
                      <button className="primary" disabled={busy}> <Text value="निमंत्रण बनाएँ"/> <Plus size={16} />
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
                          > <Text value="रद्द करें"/> </button>
                        )}
                      </div>
                    ))}
                  </section>
                  <aside className="m-panel">
                    <h2> <Text value="सत्यापन के नियम"/> </h2>
                    <ol>
                      <li> <Text value="विश्वसनीय स्रोत से व्यक्ति और परिवार के रिश्ते की पुष्टि करें।"/> </li>
                      <li> <Text value="जाँच का विवरण लिखें। पहचान-पत्र अपलोड न करें।"/> </li>
                      <li> <Text value="अपनी प्रोफ़ाइल, अभिभावक और रिश्तेदार की अनुमति अलग रखें।"/> </li>
                      <li> <Text value="परस्पर विरोधी दावों का समाधान करें। जानकारी सँभालने वाले व्यक्ति को बिना निर्णय के न बदलें।"/> </li>
                    </ol>
                  </aside>
                </div>
                <h2 className="m-section-title"> <Text value="प्रोफ़ाइल सत्यापन"/> </h2>
                {state?.claims
                  .filter((c) => c.status === "pending")
                  .map((c) => (
                    <section className="m-panel" key={c.id}>
                      <div className="m-row">
                        <h3>
                          {c.account_name} → {c.person_name}
                        </h3>
                        <span className="m-badge">{tr(c.relationship)}</span>
                      </div>
                      <p>{c.reason}</p>
                      <dl className="m-claim-context">
                        <dt>{hi ? "चुनी गई प्रविष्टि" : "Chosen entry"}</dt>
                        <dd>
                          {c.person_name} · {c.person_village}
                          {c.person_generation ? ` · ${hi ? "पीढ़ी" : "generation"} ${c.person_generation}` : ""}
                          {c.person_kind === "community" ? (hi ? " · नई निजी प्रोफ़ाइल" : " · new private profile") : ""}
                        </dd>
                        <dt>{hi ? "दर्ज पिता / माता" : "Recorded parent"}</dt>
                        <dd>{c.person_parent || (hi ? "दर्ज नहीं" : "not recorded")}</dd>
                        {c.search_name && (
                          <>
                            <dt>{hi ? "सदस्य की खोज" : "Member's search"}</dt>
                            <dd>
                              {[c.search_name, c.search_village, c.search_parent].filter(Boolean).join(" · ")} —{" "}
                              {c.person_kind === "community"
                                ? hi ? `इसी गाँव में इसी नाम की ${c.similar || 0} प्रविष्टियाँ` : `${c.similar || 0} same-name entries in this village`
                                : hi ? `${c.candidates || 0} संभावित प्रविष्टियाँ दिखीं` : `${c.candidates || 0} candidates were shown`}
                            </dd>
                          </>
                        )}
                      </dl>
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
                        <label> <Text value="जाँच का आधार"/> <select name="method">
                            <option value="family_knowledge"> <Text value="परिवार की व्यक्तिगत जानकारी"/> </option>
                            <option value="contacted_member"> <Text value="सदस्य / अभिभावक से सीधी बातचीत"/> </option>
                            <option value="family_records"> <Text value="परिवार के अभिलेख / विश्वसनीय संदर्भ"/> </option>
                          </select>
                        </label>
                        <label> <Text value="निर्णय"/> <select name="approve">
                            <option value="yes"> <Text value="रिश्ता स्वीकृत करें"/> </option>
                            <option value="no"> <Text value="अनुरोध अस्वीकार करें"/> </option>
                          </select>
                        </label>
                        <label className="m-wide"> <Text value="आपने क्या जाँचा?"/> <textarea
                            name="reason"
                            minLength={15}
                            required
                            maxLength={1000}
                          />
                        </label>
                        <button
                          className="primary"
                          disabled={busy || c.account_id === actor.id}
                        > <Text value="निर्णय दर्ज करें"/> </button>
                      </form>
                    </section>
                  ))}
                {!state?.claims.some((c) => c.status === "pending") && (
                  <p className="m-muted"> <Text value="कोई प्रोफ़ाइल अनुरोध लंबित नहीं है।"/> </p>
                )}
                <h2 className="m-section-title"> <Text value="योगदान पर निर्णय"/> </h2>
                {state?.proposals.map((p) => (
                  <section className="m-panel" key={p.id}>
                    <h3>
                      {p.payload.name} · {tr(p.payload.relation)}
                    </h3>
                    <p>
                      {p.author_name} · {moderation(p)}
                      {p.anchor_name ? ` · ${hi ? "जिससे जोड़ा जाना है" : "linked to"}: ${p.anchor_name}` : ""}
                    </p>
                    <p>{p.payload.source}</p>
                    {p.payload.relative && (
                      <p className="m-muted">
                        {[
                          p.payload.sourceType && (hi ? "स्रोत: " : "Source type: ") + p.payload.sourceType.replaceAll("_", " "),
                          p.payload.life && (hi ? "जीवन-स्थिति: " : "Life stage: ") + tr(p.payload.life),
                          p.payload.existingId && (hi ? "पहले से दर्ज व्यक्ति से जोड़ा गया" : "links an existing entry"),
                          p.payload.villageUnknown && (hi ? "स्थान: ज्ञात नहीं (खाली रखा गया)" : "Place: not known (left blank)"),
                          p.payload.secondId && (hi ? "जन्म/विवाह की कड़ी चुनी गई" : "birth/marriage link chosen"),
                          p.payload.birthFamily && (hi ? "जन्म का परिवार: " : "Birth family: ") + p.payload.birthFamily,
                          p.payload.marriage && (hi ? "विवाह: " : "Marriage: ") + p.payload.marriage,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {p.objections.map((o, i) => (
                      <p key={i}> <Text value="आपत्ति:"/> {o.reason}</p>
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
                        <label> <Text value="निर्णय"/> <select name="decision">
                            {["accepted", "auto_accepted"].includes(
                              p.status,
                            ) ? (
                              <option value="revert"> <Text value="स्वीकृत बदलाव वापस लें"/> </option>
                            ) : (
                              <>
                                <option value="accept"> <Text value="समीक्षा के बाद स्वीकार करें"/> </option>
                                <option value="reject"> <Text value="अस्वीकार करें"/> </option>
                              </>
                            )}
                          </select>
                        </label>
                        <label> <Text value="कारण"/> <textarea name="reason" minLength={15} required />
                        </label>
                        <button
                          className="outline"
                          disabled={busy || p.author === actor.id}
                        > <Text value="निर्णय सुरक्षित करें"/> </button>
                      </form>
                    )}
                  </section>
                ))}
                <h2 className="m-section-title">{hi ? "अतिरिक्त समीक्षक नियुक्त करें (वैकल्पिक)" : "Appoint an additional reviewer (optional)"}</h2>
                <section className="m-panel">
                  <p>{hi ? "मूल मुख्य प्रशासक अपनी प्रविष्टि की पुष्टि “परिचय” पृष्ठ पर स्वयं कर सकते हैं; इसके लिए दूसरे समीक्षक की आवश्यकता नहीं है। सदस्यों के अनुरोध जाँचने में मदद के लिए आप किसी भरोसेमंद, सत्यापित सदस्य को समीक्षक बना सकते हैं। उसे सभी प्रोफ़ाइल और सत्यापन अनुरोधों पर प्रशासक अधिकार मिलेंगे, पर वह अपना अनुरोध स्वयं स्वीकृत नहीं कर सकेगा। नियुक्ति के लिए अपना पासवर्ड दें।" : "The original owner can confirm their own entry on the Home page; no second reviewer is needed for that. To help check members' requests, you may appoint a trusted, verified member as a reviewer. They get administrator rights over profiles and verification requests, but can never approve their own request. Enter your password to appoint."}</p>
                  <ol className="m-steps">
                    <li><Text value="परिवार का कोई वास्तविक, भरोसेमंद व्यक्ति सदस्य खाता बनाए और अपनी पहचान का अनुरोध भेजे।" en="A real, trusted family member creates a member account and submits their own identity request."/></li>
                    <li><Text value="आप उनकी पहचान स्वयं जाँचकर ऊपर 'प्रोफ़ाइल सत्यापन' में स्वीकृत करें।" en="You check their identity yourself and approve it under 'Profile verification' above."/></li>
                    <li><Text value="फिर यहाँ उन्हें समीक्षक नियुक्त करें। वे दोबारा लॉगिन करेंगे।" en="Then appoint them here as a reviewer. They will sign in again."/></li>
                  </ol>
                  <p className="m-muted"><Text value="समीक्षक का चयन आपका निर्णय है। प्रणाली कोई समीक्षक अपने-आप नियुक्त नहीं करती और कोई काल्पनिक खाता नहीं बनाती।" en="Choosing the reviewer is your decision. The system never appoints a reviewer automatically or creates a placeholder account."/></p>
                  {!state?.members.some((m) => m.role !== "admin" && m.verified) && (
                    <p className="m-muted" role="status"><Text value="अभी कोई सत्यापित सदस्य नहीं है। पहले ऊपर के चरण 1 और 2 पूरे करें।" en="No verified member is available yet. Complete steps 1 and 2 above first."/></p>
                  )}
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
                    <label> <Text value="सत्यापित सदस्य"/> <select name="id" required>
                        <option value=""> <Text value="सत्यापित सदस्य चुनें"/> </option>
                        {state?.members
                          .filter((m) => m.role !== "admin" && m.verified)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label> <Text value="आपका वर्तमान पासवर्ड"/> <input
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                      />
                    </label>
                    <label className="m-wide"> <Text value="नियुक्ति का कारण"/> <textarea name="reason" required minLength={15} />
                    </label>
                    <button className="outline" disabled={busy}> <Text value="प्रशासक नियुक्त करें"/> </button>
                  </form>
                </section>
                <h2 className="m-section-title"> <Text value="प्रवेश और गोपनीयता संबंधी कार्य"/> </h2>
                <div className="m-columns">
                  <section className="m-panel">
                    <h3> <Text value="सदस्य का सत्यापन रद्द करें"/> </h3>
                    <p> <Text value="सदस्य तुरंत लॉगआउट होगा और उसकी जानकारी सँभालने की अनुमति समाप्त होगी। समीक्षा का इतिहास सुरक्षित रहेगा।"/> </p>
                    <form
                      onSubmit={(e) =>
                        run(
                          "revokeVerification",
                          fields(e),
                          "सत्यापन रद्द हुआ और लॉगिन बंद हो गए।",
                        )
                      }
                    >
                      <label> <Text value="सदस्य"/> <select name="id" required>
                          <option value=""> <Text value="सत्यापित सदस्य चुनें"/> </option>
                          {state?.members
                            .filter((m) => m.role !== "admin" && m.verified)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} · @{m.handle}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label> <Text value="कारण"/> <textarea name="reason" required minLength={15} />
                      </label>
                      <button className="outline" disabled={busy}> <Text value="सत्यापन रद्द करें"/> </button>
                    </form>
                  </section>
                  <section className="m-panel">
                    <h3> <Text value="प्रोफ़ाइल निजी करें"/> </h3>
                    <p> <Text value="प्रोफ़ाइल और संपर्क निजी हो जाएँगे। इससे साझा करने की सहमति नहीं मिलती।"/> </p>
                    <form
                      onSubmit={(e) =>
                        run("restrict", fields(e), "प्रोफ़ाइल निजी कर दी गई।")
                      }
                    >
                      <label> <Text value="प्रोफ़ाइल क्रमांक"/> <input
                          name="id"
                          required
                          placeholder={tr("सत्यापित अनुरोध का प्रोफ़ाइल क्रमांक दें")}
                        />
                      </label>
                      <label> <Text value="कारण"/> <textarea name="reason" required minLength={15} />
                      </label>
                      <button className="outline" disabled={busy}> <Text value="प्रोफ़ाइल छिपाएँ"/> </button>
                    </form>
                    <details>
                      <summary> <Text value="गोपनीयता रोक का समाधान करें"/> </summary>
                      <p> <Text value="प्रशासक की रोक हट जाएगी। व्यक्ति स्वयं दोबारा साझा करने का विकल्प चुने तब तक प्रोफ़ाइल निजी रहेगी।"/> </p>
                      <form
                        onSubmit={(e) =>
                          run(
                            "releaseRestriction",
                            fields(e),
                            "रोक हटा दी गई; प्रोफ़ाइल अभी निजी है।",
                          )
                        }
                      >
                        <label> <Text value="प्रोफ़ाइल क्रमांक"/> <input name="id" required />
                        </label>
                        <label> <Text value="समाधान का कारण"/> <textarea name="reason" required minLength={15} />
                        </label>
                        <button className="outline" disabled={busy}> <Text value="रोक का समाधान करें"/> </button>
                      </form>
                    </details>
                    <details>
                      <summary> <Text value="जाँचे गए अनुरोधों के प्रोफ़ाइल क्रमांक"/> </summary>
                      {state?.claims.map((c) => (
                        <p key={c.id}>
                          {c.person_name}: <code>{c.person_id}</code>
                        </p>
                      ))}
                    </details>
                  </section>
                </div>
                <details className="m-panel">
                  <summary> <Text value="हाल के कार्यों का विवरण"/> </summary>
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
        <span> <Text value="लुहाच परिवार ·"/> {" "}
          {t(
            "हमारी जड़ें। हमारी ज़िम्मेदारी।",
            "हमारी जड़ें। हमारी ज़िम्मेदारी।",
          )}
        </span>
        <span> <Text value="सदस्य क्षेत्र"/> </span>
      </footer>
      {secret && (
        <div className="m-secret-backdrop">
          <section
            ref={secretRef}
            tabIndex={-1}
            className="m-panel m-secret"
            role="dialog"
            aria-modal="true"
            aria-label={tr(secret.label)}
          >
            <KeyRound size={30} />
            <h2>{tr(secret.label)}</h2>
            <p>{hi ? "संबंधित व्यक्ति को यह कोड निजी तौर पर दें। इसे सार्वजनिक परिवार संग्रह में न डालें। सहायता कोड की प्रति मुख्य प्रशासक के सुरक्षित सहायता पैनल में रखी जाती है।" : "Give this code privately to the intended member. Do not post it in the public archive. Recovery copies are kept in the owner's secure help panel."}</p>
            <textarea
              readOnly
              aria-label={tr("निजी कोड")}
              value={secret.value}
              onFocus={(e) => e.target.select()}
            />
            <button className="primary" onClick={() => setSecret(null)}>{hi ? "ठीक है" : "Done"} <Check size={16} />
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
