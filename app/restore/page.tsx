"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Brand from "@/components/brand";
export default function RestorePage() {
  const [error, setError] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    async function restore() {
      const token = window.location.hash.slice(1);
      window.history.replaceState(null, "", "/restore");
      if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("This collection link is incomplete. Open the full private link you saved.");
      const response = await fetch("/api/collection/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Your collection could not open. Try your saved link again.");
      window.location.replace("/");
    }
    void restore().catch(error => setError(error instanceof Error ? error.message : "Your collection could not open."));
  }, []);
  return <main className="feedback-page"><header className="app-header"><Brand/></header><div className="feedback-status">{error ? <><h1>Your collection couldn’t open.</h1><p role="alert">{error}</p><Link className="secondary" href="/">Open Five Words</Link></> : <p role="status">Opening your private collection…</p>}</div></main>;
}
