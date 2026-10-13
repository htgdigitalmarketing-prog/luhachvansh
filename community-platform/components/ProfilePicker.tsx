"use client";
import {Text,useLanguage} from "./Language";
import {hiText,hiError} from "../lib/hindi.mjs";
import { useState } from "react";
export default function ProfilePicker({
  name,
  label,
  labelEn,
}: {
  name: string;
  label: string;
  labelEn?: string;
}) {
const {tr}=useLanguage();

  const [q, setQ] = useState(""),
    [items, setItems] = useState<any[]>([]),
    [chosen, setChosen] = useState<any>(null),
    [error, setError] = useState("");
  return (
    <div className="m-wide">
      <label>
        {<Text value={label} en={labelEn}/>}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tr("नाम या गाँव")}
        />
      </label>
      <input type="hidden" name={name} value={chosen?.id || ""} />
      <button
        type="button"
        onClick={async () => {
          try {
            const r = await fetch(
                "/api/members?action=search&q=" + encodeURIComponent(q),
                { cache: "no-store" },
              ),
              j = await r.json();
            if (!r.ok) throw Error(j.error);
            setItems(j.people);
            setError("");
          } catch (e) {
            setError(hiError((e as Error).message));
          }
        }}
      > <Text value="पहले से दर्ज व्यक्ति खोजें"/> </button>
      {error && <p role="alert">{hiError(error)}</p>}
      {chosen && (
        <p className="selected-link">
          {chosen.name} · {chosen.village}
          <button type="button" onClick={() => setChosen(null)}> <Text value="चयन हटाएँ"/> </button>
        </p>
      )}
      <div className="hub-results">
        {items.map((p) => (
          <button
            type="button"
            key={p.id}
            onClick={() => {
              setChosen(p);
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
