"use client";
import { useEffect, useState } from "react";
export default function Install() {
  const [prompt, setPrompt] = useState<any>(null);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return prompt ? (
    <button
      onClick={async () => {
        await prompt.prompt();
        setPrompt(null);
      }}
    > ऐप जोड़ें </button>
  ) : null;
}
