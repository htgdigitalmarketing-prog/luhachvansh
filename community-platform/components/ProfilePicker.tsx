"use client";
import { useState } from "react";
export default function ProfilePicker({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  const [q, setQ] = useState(""),
    [items, setItems] = useState<any[]>([]),
    [chosen, setChosen] = useState<any>(null),
    [error, setError] = useState("");
  return (
    <div className="m-wide">
      <label>
        {label}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name or village"
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
            setError((e as Error).message);
          }
        }}
      >
        Search existing people
      </button>
      {error && <p role="alert">{error}</p>}
      {chosen && (
        <p className="selected-link">
          {chosen.name} · {chosen.village}
          <button type="button" onClick={() => setChosen(null)}>
            Clear selection
          </button>
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
