"use client";
import {Text,useLanguage} from "./Language";
import {hiText,hiError} from "../lib/hindi.mjs";
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
  if (!r.ok) throw Error(j.error || "अनुरोध पूरा नहीं हो सका।");
  return j;
}
const date = (n: number) => new Date(n).toLocaleDateString("hi-IN");
function Form({
  children,
  onSubmit,
  label = "सुरक्षित करें",
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
        {<Text value={busy ? "कृपया प्रतीक्षा करें…" : label}/>}
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
const {tr}=useLanguage();

  const [items, setItems] = useState<Row[]>([]),
    [err, setErr] = useState("");
  return (
    <div className="hub-finder">
      <Form
        label="प्रोफ़ाइल खोजें"
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
            setErr(hiError((e as Error).message));
          }
        }}
      >
        <label>
          {<Text value={label}/>}
          <input
            name="q"
            required
            minLength={2}
            placeholder={tr("नाम या गाँव")}
          />
        </label>
      </Form>
      {err && <p role="alert">{hiError(err)}</p>}
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
  const {language,setLanguage,tr}=useLanguage();
  const hi=language==="hi";
  const [me, setMe] = useState<Row | null>(null),
    [state, setState] = useState<Row | null>(null),
    [archive, setArchive] = useState<Row[]>([]),
    [content, setContent] = useState<Row[]>([]),
    [tab, setTab] = useState("villages"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [unusedLanguageFlag] = useState(true);
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
  const t = (en: string, hn: string) => (hi ? hn : tr(en));
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
      .catch((e) => setError(hiError(e.message)))
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
        setError("30 मिनट तक उपयोग नहीं हुआ। कृपया फिर लॉगिन करें।");
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
      setNotice("सुरक्षित किया गया।");
    } catch (e) {
      setError(hiError((e as Error).message));
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
      setError(hiError((e as Error).message));
    }
  }
  const selected = archive.find((v) => v.name === village),
    thread = state?.conversations.find((c: Row) => c.id === conversation),
    admin = me?.actor.role === "admin";
  if (loading)
    return (
      <main className="hub-wrap">
        <p> <Text value="सदस्य समुदाय खुल रहा है…"/> </p>
      </main>
    );
  if (!me?.actor.verified)
    return (
      <main className="hub-wrap">
        <section className="hub-card">
          <h1> <Text value="विश्वास से जुड़ा हमारा समुदाय।"/> </h1>
          <p>
            {me
              ? "समुदाय के अभिलेख देखने या सदस्यों से संपर्क करने से पहले परिवार के रिश्ते का सत्यापन आवश्यक है।"
              : "संग्रह देखने और सत्यापित सदस्यों से जुड़ने के लिए लॉगिन करें।"}
          </p>
          <p role="alert">{tr(hiError(error))}</p>
          <a className="button primary" href="/members"> <Text value="लॉगिन करें और प्रोफ़ाइल सत्यापित कराएँ"/> </a>
          {me && (
            <>
              <p>
                <a
                  href="/api/hub?action=export"
                  download="luhach-my-records.json"
                > <Text value="मेरे खाते की जानकारी डाउनलोड करें"/> </a>
              </p>
              <details>
                <summary> <Text value="मेरा असत्यापित खाता बंद करें"/> </summary>
                <p> <Text value="लॉगिन की जानकारी हट जाएगी और लंबित अनुरोध वापस होंगे। पुराने योगदान और कार्यों का विवरण सुरक्षित रहेगा।"/> </p>
                <Form
                  label="मेरा खाता स्थायी रूप से बंद करें"
                  onSubmit={async (b) => {
                    try {
                      if (b.confirm !== "CLOSE")
                        throw Error("पुष्टि के लिए CLOSE लिखें।");
                      await api("/api/hub", { action: "close", ...b });
                      window.location.href = "/";
                    } catch (e) {
                      setError(hiError((e as Error).message));
                    }
                  }}
                >
                  <label> <Text value="वर्तमान पासवर्ड"/> <input
                      type="password"
                      name="password"
                      required
                      autoComplete="current-password"
                    />
                  </label>
                  <label> <Text value="CLOSE लिखें"/> <input name="confirm" required pattern="CLOSE" />
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
          <span className="eyebrow"> <Text value="लुहाच परिवार · सदस्य समुदाय"/> </span>
          <p className="hub-help"> <Text value="लॉगिन सदस्य"/> {me.actor.name}</p>
          <h1>
            {t("हमारी कहानियाँ। हमारे अपने लोग।", "अपनी कहानियाँ। अपना परिवार।")}
          </h1>
          <p>
            {t(
              "A living archive, built together and shared by choice.",
              "मिलकर सहेजी विरासत, अपनी सहमति से साझा करें।",
            )}
          </p>
        </div>
        <button onClick={() => setLanguage(hi?"en":"hi")}>{hi ? "English" : "हिन्दी"}</button>
      </header>
      <nav className="hub-tabs" aria-label={tr("समुदाय के विषय")}>
        {[
          ["villages", "गाँव", "गाँव"],
          ["stories", "कहानियाँ और तस्वीरें", "कहानियाँ और तस्वीरें"],
          ["connect", "सदस्य खोजें", "सदस्य खोजें"],
          ["inbox", "संदेश", "संदेश"],
          ["research", "लुहाच मित्र से पूछें", "विरासत से पूछें"],
          ["account", "मेरी जानकारी", "मेरा डेटा"],
          ...(admin ? [["moderate", "समीक्षा कक्ष", "समीक्षा"]] : []),
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
          {tr(hiError(error))}
        </p>
      )}
      {notice && (
        <p className="hub-notice" role="status">
          {tr(notice)}
        </p>
      )}
      {tab === "villages" && (
        <>
          <div className="hub-section-title">
            <h2>
              {t("46 villages. A shared history.", "46 गाँव। एक साझा इतिहास।")}
            </h2>
            <label> <Text value="गाँव खोजें"/> <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={tr("गाँव का नाम")}
              />
            </label>
          </div>
          {selected ? (
            <article className="hub-card">
              <button onClick={() => setVillage("")}> <Text value="← सभी गाँव"/> </button>
              <h2>{selected.name}</h2>
              <p className="hub-label"> <Text value="पुराने संग्रह से"/> </p>
              <div className="hub-prose">{selected.text}</div>
              <a href={selected.source} target="_blank" rel="noreferrer"> <Text value="मूल वेबसाइट का पृष्ठ ↗"/> </a>
              <p> <Text value="गाँव की जानकारी सुधारें, स्रोत जोड़ें या स्मृति साझा करें।"/> </p>
              <button onClick={() => setTab("stories")}> <Text value="इस गाँव के बारे में जानकारी जोड़ें"/> </button>
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
                    <strong> <Text value="गाँव की कहानी पढ़ें →"/> </strong>
                  </button>
                ))}
            </div>
          )}
        </>
      )}
      {tab === "stories" && (
        <>
          <h2>{t("समुदाय की स्मृतियाँ", "समुदाय का संग्रह")}</h2>
          <p> <Text value="हर स्मृति के साथ उसका स्रोत रखें। सदस्य योगदान पर सात दिन तक आपत्ति दी जा सकती है; प्रशासक के योगदान तुरंत स्वीकार होते हैं।" en="Keep a source with each memory. Member contributions have a seven-day objection window; administrator contributions are accepted immediately."/> </p>
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
                      "पुरानी वेबसाइट से गाँव का नाम-पट्ट",
                      "पुरानी वेबसाइट से समुदाय का मिलन समारोह",
                      "पुरानी वेबसाइट से मिलन समारोह की तस्वीर",
                    ][i]
                  }
                />
                <figcaption> <Text value="पुरानी वेबसाइट का संग्रह"/> </figcaption>
              </figure>
            ))}
          </div>
          <details className="hub-card">
            <summary> <Text value="गाँव की कहानी, जीवन परिचय या तस्वीर जोड़ें"/> </summary>
            <Form
              label="समुदाय की समीक्षा के लिए भेजें"
              onSubmit={async (b) => {
                await act("contribute", {
                  ...b,
                  consent: b.consent === "on",
                  media_id: media,
                });
              }}
            >
              <label> <Text value="योगदान का प्रकार"/> <select name="kind">
                  <option value="village"> <Text value="गाँव की जानकारी"/> </option>
                  <option value="biography"> <Text value="जीवन परिचय / स्मरण"/> </option>
                  <option value="photo"> <Text value="तस्वीर"/> </option>
                </select>
              </label>
              <label> <Text value="शीर्षक"/> <input name="title" required minLength={4} maxLength={160} />
              </label>
              <label> <Text value="गाँव"/> <select name="village" defaultValue={village}>
                  <option value=""> <Text value="पूरे समुदाय के लिए"/> </option>
                  {archive.map((v) => (
                    <option key={v.name}>{v.name}</option>
                  ))}
                </select>
              </label>
              <label> <Text value="संबंधित व्यक्ति (जीवन परिचय के लिए आवश्यक)"/> <select name="person_id">
                  <option value=""> <Text value="किसी एक व्यक्ति की प्रोफ़ाइल नहीं"/> </option>
                  {me.own.map((p: Row) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="hub-help"> <Text value="जीवित व्यक्ति के लिए अधिकृत देखभालकर्ता की सहमति चाहिए। बच्चों के जीवन परिचय यहाँ नहीं जोड़े जाते। लिखने से पहले परिवार क्षेत्र में अनुमति माँगें।"/> </p>
              <label> <Text value="कहानी या विवरण"/> <textarea
                  name="body"
                  required
                  minLength={20}
                  maxLength={12000}
                  rows={5}
                />
              </label>
              <label> <Text value="स्रोत, पृष्ठ, तिथि या प्रत्यक्ष जानकारी"/> <textarea
                  name="source"
                  required
                  minLength={10}
                  maxLength={1000}
                />
              </label>
              <label> <Text value="तस्वीर (JPEG, PNG या WebP; अधिकतम 8 MB)"/> <input
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
                        "तस्वीर तैयार है। कैमरे की अतिरिक्त जानकारी हटा दी गई है। अब अपना योगदान भेजें।",
                      );
                    } catch (e) {
                      setError(hiError((e as Error).message));
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
                  alt="आपकी अपलोड की गई तस्वीर"
                />
              )}
              <label className="hub-check">
                <input name="consent" type="checkbox" required /> <Text value="मुझे यह लेख / तस्वीर साझा करने की अनुमति है और पहचान में आने वाले जीवित व्यक्तियों की सहमति है।"/> </label>
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
                  {tr(c.status)} · {tr(c.kind)}
                </span>
                <h3>{c.title}</h3>
                <small>
                  {c.village} · {c.author_name} · {date(c.created)}
                </small>
                <p className="hub-prose">{c.body}</p>
                <p>
                  <strong> <Text value="स्रोत:"/> </strong> {c.source}
                </p>
                {c.status === "pending" && (
                  <p> <Text value="आपत्ति देने की अंतिम तिथि"/> {date(c.due)} <Text value="। स्वीकृति समीक्षा का निर्णय है; ऐतिहासिक सत्यता का प्रमाण नहीं।"/> </p>
                )}
                {c.decision && <p>{c.decision}</p>}
                {c.objections.map((o: Row, i: number) => (
                  <p key={i} className="hub-alert"> <Text value="आपत्ति:"/> {o.reason}
                  </p>
                ))}
                {["pending", "accepted"].includes(c.status) && (
                  <details>
                    <summary> <Text value="सुधार या आपत्ति दें"/> </summary>
                    <Form
                      label="समीक्षा के लिए रोकें"
                      onSubmit={(b) => act("objectContent", { ...b, id: c.id })}
                    >
                      <label> <Text value="कारण"/> <textarea required minLength={10} name="reason" />
                      </label>
                    </Form>
                  </details>
                )}
                {c.author === me.actor.id && c.status !== "withdrawn" && (
                  <Form
                    label="मेरा योगदान वापस लें"
                    onSubmit={(b) => act("withdrawContent", { ...b, id: c.id })}
                  >
                    <label> <Text value="वापस लेने का कारण"/> <input required minLength={10} name="reason" />
                    </label>
                  </Form>
                )}
              </article>
            ))}
          </div>
          {!content.length && (
            <p className="hub-empty"> <Text value="नया संग्रह आपके योगदान के लिए तैयार है।"/> </p>
          )}
        </>
      )}
      {tab === "connect" && (
        <>
          <h2>
            {t(
              "जहाँ भी जाएँ, अपने समुदाय से जुड़ें।",
              "जहाँ जाएँ, अपने समुदाय से जुड़ें।",
            )}
          </h2>
          <p> <Text value="शहर, राज्य या देश से खोजें। केवल सहमति देने वाले सत्यापित वयस्क दिखते हैं। फ़ोन और ईमेल खोज में नहीं दिखते।"/> </p>
          <details className="hub-card">
            <summary> <Text value="स्थान खोज में मेरी उपलब्धता"/> </summary>
            <p> <Text value="यह विकल्प बंद करने पर आपका नाम छिपेगा और बातचीत रुकेगी। घर का पूरा पता नहीं माँगा जाता।"/> </p>
            <Form
              label="उपलब्धता का विकल्प सुरक्षित करें"
              onSubmit={(b) =>
                act("directory", {
                  ...b,
                  enabled: b.enabled === "on",
                  consent: b.consent === "on",
                })
              }
            >
              <label> <Text value="मेरी सत्यापित प्रोफ़ाइल"/> <select
                  name="person_id"
                  defaultValue={state?.directory?.person_id || ""}
                >
                  <option value=""> <Text value="अपनी प्रोफ़ाइल चुनें"/> </option>
                  {state?.myClaims
                    .filter((c: Row) => c.relationship === "self")
                    .map((c: Row) => (
                      <option key={c.id} value={c.person_id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </label>
              <label> <Text value="शहर"/> <input
                  name="city"
                  defaultValue={state?.directory?.city || ""}
                  maxLength={80}
                />
              </label>
              <label> <Text value="राज्य / क्षेत्र"/> <input
                  name="state"
                  defaultValue={state?.directory?.state || ""}
                  maxLength={80}
                />
              </label>
              <label> <Text value="देश"/> <input
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
                /> <Text value="मुझे सत्यापित सदस्यों की खोज में दिखाएँ और संपर्क अनुरोध आने दें।"/> </label>
              <label className="hub-check">
                <input name="consent" type="checkbox" /> <Text value="मैं शहर की जानकारी साझा करने की सहमति देता/देती हूँ। मेरी प्रोफ़ाइल भी सत्यापित सदस्यों को दिखनी चाहिए।"/> </label>
            </Form>
            <a href="/members"> <Text value="परिवार की प्रोफ़ाइल की गोपनीयता चुनें →"/> </a>
          </details>
          <Form
            label="सदस्य खोजें"
            onSubmit={async (b) => {
              try {
                setPeople(
                  await api(
                    "/api/hub?action=directory&q=" + encodeURIComponent(b.q),
                  ),
                );
              } catch (e) {
                setError(hiError((e as Error).message));
              }
            }}
          >
            <label> <Text value="शहर, राज्य, देश या सदस्य का नाम"/> <input name="q" placeholder={tr("जयपुर, हरियाणा, भारत…")} />
            </label>
          </Form>
          <div className="hub-grid">
            {people.map((p) => (
              <article className="hub-card" key={p.id}>
                <h3>{p.name}</h3>
                <p>{[p.city, p.state, p.country].filter(Boolean).join(", ")}</p>
                <Form
                  label="संपर्क का अनुरोध करें"
                  onSubmit={(b) => act("connect", { ...b, target: p.id })}
                >
                  <label> <Text value="अपना परिचय दें"/> <textarea
                      name="note"
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </label>
                </Form>
                <button onClick={() => act("block", { target: p.id })}> <Text value="सदस्य को ब्लॉक करें"/> </button>
              </article>
            ))}
          </div>
        </>
      )}
      {tab === "inbox" && (
        <>
          <h2>{t("सहमति से बातचीत।", "सहमति से बातचीत।")}</h2>
          <p> <Text value="बातचीत शुरू करने के लिए संपर्क अनुरोध स्वीकार करें। संपर्क विवरण अपनी इच्छा से दें। संदेश इस सेवा में सुरक्षित रखे जाते हैं; उनमें एंड-टू-एंड एन्क्रिप्शन नहीं है। प्रशासक केवल वे संदेश देखते हैं जिनकी शिकायत आप करते हैं।"/> </p>
          <button onClick={() => refresh().catch((e) => setError(hiError(e.message)))}> <Text value="नए संदेश देखें"/> </button>
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
                    {tr(c.status)}
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
                        > <Text value="संपर्क स्वीकार करें"/> </button>
                        <button
                          onClick={() =>
                            act("connection", {
                              id: thread.id,
                              status: "declined",
                            })
                          }
                        > <Text value="अस्वीकार करें"/> </button>
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
                          ? "आप"
                          : thread.sender === m.sender
                            ? thread.sender_name
                            : thread.recipient_name}{" "}
                        · {new Date(m.created).toLocaleString("hi-IN")}
                      </small>
                      <p>{m.body}</p>
                      <details>
                        <summary> <Text value="इस संदेश की शिकायत करें"/> </summary>
                        <Form
                          label="शिकायत प्रशासकों को भेजें"
                          onSubmit={(b) =>
                            act("report", {
                              ...b,
                              id: thread.id,
                              message_id: m.id,
                            })
                          }
                        >
                          <label> <Text value="शिकायत का कारण"/> <textarea name="reason" required minLength={10} />
                          </label>
                        </Form>
                      </details>
                    </div>
                  ))}
                  {thread.status === "accepted" &&
                    !thread.blocked &&
                    thread.available && (
                      <Form
                        label="संदेश भेजें"
                        onSubmit={(b) =>
                          act("message", { ...b, id: thread.id })
                        }
                      >
                        <label> <Text value="आपका संदेश"/> <textarea name="body" required maxLength={3000} />
                        </label>
                      </Form>
                    )}
                  <div className="hub-actions">
                    <button
                      onClick={() =>
                        act("connection", { id: thread.id, status: "closed" })
                      }
                    > <Text value="बातचीत बंद करें"/> </button>
                    <button
                      onClick={() =>
                        act("block", {
                          target:
                            thread.sender === me.actor.id
                              ? thread.recipient
                              : thread.sender,
                        })
                      }
                    > <Text value="सदस्य को ब्लॉक करें"/> </button>
                  </div>
                </>
              ) : (
                <p> <Text value="बातचीत चुनें। अन्य सदस्यों के अनुरोध यहाँ दिखेंगे।"/> </p>
              )}
            </section>
          </div>
          <details className="hub-card">
            <summary> <Text value="ब्लॉक किए गए सदस्य"/> </summary>
            {state?.blocked.map((b: Row) => (
              <p key={b.target}>
                {b.name}{" "}
                <button
                  onClick={() =>
                    act("block", { target: b.target, enabled: false })
                  }
                > <Text value="ब्लॉक हटाएँ (नया अनुरोध आवश्यक होगा)"/> </button>
              </p>
            ))}
          </details>
        </>
      )}
      {tab === "research" && (
        <>
          <h2>
            {t(
              "संग्रह से पूछें। स्रोत के साथ समझें।",
              "विरासत से पूछें। स्रोत देखें।",
            )}
          </h2>
          <div className="hub-card">
            <h3> <Text value="दो व्यक्तियों के बीच रिश्ता खोजें"/> </h3>
            <p> <Text value="खोज दर्ज माता-पिता और पति-पत्नी के रिश्तों पर आधारित है। निजी या छूटे रिश्ते अनुमान से नहीं बनाए जाते। माताओं, बेटियों और विवाह के दोनों परिवारों को समान जगह मिलेगी।"/> </p>
            <div className="hub-two">
              <Finder
                label="पहला व्यक्ति"
                onPick={(p) => {
                  setFrom(p);
                  setPath(null);
                }}
              />
              <Finder
                label="दूसरा व्यक्ति"
                onPick={(p) => {
                  setTo(p);
                  setPath(null);
                }}
              />
            </div>
            <p>
              {from?.name || "पहला व्यक्ति चुनें"} →{" "}
              {to?.name || "दूसरा व्यक्ति चुनें"}
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
                  setError(hiError((e as Error).message));
                }
              }}
            > <Text value="दर्ज रिश्ते का मार्ग देखें"/> </button>
            {path &&
              (path.found ? (
                <ol className="hub-lineage">
                  <li>
                    <strong>{path.from.name}</strong>
                    <small>{path.from.village}</small>
                  </li>
                  {path.steps.map((s: Row, i: number) => (
                    <li key={i}>
                      <span>{tr(s.relation)} → </span>
                      <strong>{s.person.name}</strong>
                      <small>
                        {s.person.village} <Text value="· स्रोत:"/> {s.source}
                      </small>
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{path.message}</p>
              ))}
          </div>
          <div className="hub-card">
            <h3> <Text value="लुहाच मित्र / समुदाय से पूछें"/> </h3>
            <p> <Text value="Gemini पुराने संग्रह के लेखों का सार बता सकता है। इन अनुरोधों में निजी प्रोफ़ाइल, संपर्क या निजी संदेश नहीं भेजे जाते।"/> </p>
            <Finder
              label="परिवार के प्रश्न के लिए व्यक्ति चुनें"
              onPick={setResearchPerson}
            />
            {researchPerson && <p> <Text value="चयनित:"/> {researchPerson.name}</p>}
            <Form label="लुहाच मित्र से पूछें" onSubmit={research}>
              <label> <Text value="प्रश्न का प्रकार"/> <select name="mode">
                  <option value="history"> <Text value="गाँव का इतिहास (स्रोत खोज या वैकल्पिक AI)"/> </option>
                  <option value="family"> <Text value="इस व्यक्ति के माता-पिता, पति-पत्नी या बच्चे कौन हैं? (दर्ज अभिलेख)"/> </option>
                  <option value="directory"> <Text value="इस शहर, राज्य या देश में कौन है? (सहमति वाले सदस्य)"/> </option>
                </select>
              </label>
              <label> <Text value="गाँव चुनें"/> <select name="village">
                  <option value=""> <Text value="पूरा संग्रह खोजें"/> </option>
                  {archive.map((v) => (
                    <option key={v.name}>{v.name}</option>
                  ))}
                </select>
              </label>
              <label> <Text value="प्रश्न (स्थान खोज के लिए शहर / राज्य / देश लिखें)"/> <textarea
                  name="question"
                  required
                  minLength={4}
                  maxLength={600}
                  placeholder={tr("इस गाँव के बसने के बारे में क्या लिखा है?")}
                />
              </label>
              <label className="hub-check">
                <input name="ai" type="checkbox" /> <Text value="स्रोत का सार बताने के लिए AI इस्तेमाल करें।"/> </label>
              <label className="hub-check">
                <input name="consent" type="checkbox" /> <Text value="यह प्रश्न और संबंधित संग्रह के अंश Google Gemini को भेजने की सहमति है। मैं निजी जानकारी नहीं लिखूँगा/लिखूँगी।"/> </label>
            </Form>
            {answer && (
              <article>
                <p className="hub-label">
                  {answer.mode === "ai"
                    ? "AI-assisted answer"
                    : "स्रोत खोजें"}
                </p>
                <p className="hub-prose">{tr(answer.answer)}</p>
                {answer.notice && <p>{tr(answer.notice)}</p>}
                {answer.sources.map((s: Row) => (
                  <details key={s.id}>
                    <summary> <Text value="स्रोत ["/> {s.id}] · {s.village}
                    </summary>
                    <p className="hub-prose">{s.text}</p>
                    <a href={s.source} target="_blank" rel="noreferrer"> <Text value="गाँव का मूल पृष्ठ ↗"/> </a>
                    <p>{tr(s.status)}</p>
                  </details>
                ))}
              </article>
            )}
          </div>
        </>
      )}
      {tab === "account" && (
        <>
          <h2> <Text value="आपकी जानकारी, आपका निर्णय"/> </h2>
          <div className="hub-card">
            <h3> <Text value="अपने अभिलेख डाउनलोड करें"/> </h3>
            <p> <Text value="इसमें आपकी प्रोफ़ाइल, योगदान, अनुरोध और आपके भेजे संदेश होंगे। पासवर्ड, पुनर्प्राप्ति कोड या दूसरों के निजी संदेश नहीं होंगे।"/> </p>
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
                  setError(hiError((e as Error).message));
                }
              }}
            > <Text value="मेरी जानकारी डाउनलोड करें"/> </button>
          </div>
          <details className="hub-card">
            <summary> <Text value="परिवार की जानकारी सँभालने की अनुमति हस्तांतरित करें"/> </summary>
            <p> <Text value="दूसरा प्रशासक सहमति और रिश्ते की जाँच करेगा। बच्चे के वयस्क होने पर भी यह विकल्प उपयोगी है। गोपनीयता दोबारा निजी हो जाएगी।"/> </p>
            <Form
              label="स्वतंत्र जाँच के लिए अनुरोध करें"
              onSubmit={(b) => act("transfer", b)}
            >
              <label> <Text value="वर्तमान अनुमति"/> <select name="claim" required>
                  <option value=""> <Text value="चुनें"/> </option>
                  {state?.myClaims.map((c: Row) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {tr(c.relationship)}
                    </option>
                  ))}
                </select>
              </label>
              <label> <Text value="अनुमति लेने वाले सदस्य का खाता क्रमांक"/> <input name="target" required />
              </label>
              <label> <Text value="सहमति, रिश्ता और कारण"/> <textarea name="reason" required minLength={15} />
              </label>
            </Form>
            <p> <Text value="आपका खाता क्रमांक:"/> <code>{me.actor.id}</code> <Text value="(केवल अनुमति हस्तांतरण के लिए संबंधित व्यक्ति को दें)।"/> </p>
            {state?.transfers.map((r: Row) => (
              <p key={r.id}>
                {tr(r.status)}: {r.reason}
              </p>
            ))}
          </details>
          <details className="hub-card">
            <summary> <Text value="मेरा खाता बंद करें"/> </summary>
            <p> <Text value="आप लॉगआउट होंगे, लॉगिन की जानकारी हटेगी, प्रोफ़ाइल और स्थान खोज से नाम छिपेगा तथा लंबित योगदान वापस होंगे। स्वीकृत धरोहर योगदान, वंशावली, पुराने संदेश और कार्यों का इतिहास सुरक्षित रहेगा। नाम “पूर्व सदस्य” हो जाएगा। प्रशासक को पहले अपना पद सौंपना होगा।"/> </p>
            <Form
              label="मेरा खाता स्थायी रूप से बंद करें"
              onSubmit={async (b) => {
                if (b.confirm !== "CLOSE") {
                  setError("पुष्टि के लिए CLOSE लिखें।");
                  return;
                }
                try {
                  await api("/api/hub", { action: "close", ...b });
                  window.location.href = "/";
                } catch (e) {
                  setError(hiError((e as Error).message));
                }
              }}
            >
              <label> <Text value="वर्तमान पासवर्ड"/> <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <label> <Text value="CLOSE लिखें"/> <input name="confirm" required pattern="CLOSE" />
              </label>
            </Form>
          </details>
        </>
      )}
      {tab === "moderate" && admin && (
        <>
          <h2> <Text value="सामुदायिक समीक्षा"/> </h2>
          <p> <Text value="परिवार का सत्यापन और रिश्तों के निर्णय यहाँ करें:"/> {" "}
            <a href="/members"> <Text value="प्रशासक कक्ष →"/> </a> <Text value="। अपने योगदान की समीक्षा दूसरे प्रशासक से कराएँ।"/> </p>
          {content
            .filter((c) =>
              ["pending", "disputed", "accepted"].includes(c.status),
            )
            .map((c) => (
              <article className="hub-card" key={c.id}>
                <span className="hub-label">{tr(c.status)}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <p> <Text value="स्रोत:"/> {c.source}</p>
                {c.objections.map((o: Row, i: number) => (
                  <p key={i}> <Text value="आपत्ति:"/> {o.reason}</p>
                ))}
                <Form
                  label="समीक्षा का निर्णय दर्ज करें"
                  onSubmit={(b) => act("reviewContent", { ...b, id: c.id })}
                >
                  <label> <Text value="निर्णय"/> <select name="status">
                      <option value="accepted"> <Text value="स्वीकार करें"/> </option>
                      <option value="rejected"> <Text value="अस्वीकार करें"/> </option>
                      <option value="removed"> <Text value="संग्रह से हटाएँ"/> </option>
                    </select>
                  </label>
                  <label> <Text value="जाँच का आधार और विवरण"/> <textarea name="reason" required minLength={10} />
                  </label>
                </Form>
              </article>
            ))}
          <h3> <Text value="सदस्य सुरक्षा की शिकायतें"/> </h3>
          {state?.reports.map((r: Row) => (
            <article className="hub-card" key={r.id}>
              <p>
                {r.reason} · {tr(r.status)}
              </p>
              {r.reported_message && (
                <blockquote>{r.reported_message}</blockquote>
              )}
              <p>{r.decision}</p>
              {r.status === "open" && (
                <Form
                  label="शिकायत का समाधान करें"
                  onSubmit={(b) => act("resolveReport", { ...b, id: r.id })}
                >
                  <label> <Text value="कार्रवाई और विवरण"/> <textarea name="reason" required minLength={10} />
                  </label>
                </Form>
              )}
            </article>
          ))}
          <h3> <Text value="जानकारी सँभालने की अनुमति का हस्तांतरण"/> </h3>
          {state?.transfers
            .filter((r: Row) => r.status === "pending")
            .map((r: Row) => (
              <article className="hub-card" key={r.id}>
                <p>{r.reason}</p>
                <p> <Text value="किससे"/> {r.author} <Text value="to"/> {r.recipient}
                </p>
                <Form
                  label="हस्तांतरण का निर्णय दर्ज करें"
                  onSubmit={(b) =>
                    act("reviewTransfer", {
                      ...b,
                      id: r.id,
                      accept: b.accept === "yes",
                    })
                  }
                >
                  <label> <Text value="निर्णय"/> <select name="accept">
                      <option value="no"> <Text value="अस्वीकार करें"/> </option>
                      <option value="yes"> <Text value="सहमति जाँचकर स्वीकृत करें"/> </option>
                    </select>
                  </label>
                  <label> <Text value="नया रिश्ता"/> <select name="relationship">
                      <option value="self"> <Text value="स्वयं"/> </option>
                      <option value="guardian"> <Text value="बच्चे का अभिभावक"/> </option>
                      <option value="relative"> <Text value="जानकारी सँभालने वाला रिश्तेदार"/> </option>
                    </select>
                  </label>
                  <label> <Text value="सहमति का आधार"/> <textarea name="reason" required minLength={15} />
                  </label>
                </Form>
              </article>
            ))}
          <details className="hub-card">
            <summary> <Text value="प्रशासक के अधिकार हटाएँ"/> </summary>
            <p> <Text value="यह कार्य दूसरा प्रशासक करेगा। बाद में दोनों खाते लॉगआउट होंगे।"/> </p>
            <Form
              label="प्रशासक अधिकार हटाएँ"
              onSubmit={async (b) => {
                try {
                  await api("/api/hub", { action: "demote", ...b });
                  window.location.href = "/members";
                } catch (e) {
                  setError(hiError((e as Error).message));
                }
              }}
            >
              <label> <Text value="प्रशासक"/> <select name="target" required>
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
              <label> <Text value="कारण"/> <textarea name="reason" required minLength={15} />
              </label>
              <label> <Text value="आपका वर्तमान पासवर्ड"/> <input
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
