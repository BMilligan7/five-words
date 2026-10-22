"use client";
import { useEffect, useState } from "react";
import { Check, Camera } from "lucide-react";
import Brand from "./brand";
import WordBank from "./word-bank";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { choicesFromWords, type WordChoice } from "@/lib/word-bank";
import { validateWords } from "@/lib/validation";

export default function FeedbackForm({ token }: { token: string }) {
  // A new photo starts a fresh form before it renders.
  return <FeedbackResponse key={token} token={token}/>;
}

function FeedbackResponse({ token }: { token: string }) {
  const [image, setImage] = useState("");
  const [choices, setChoices] = useState<WordChoice[]>([]);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  const [error, setError] = useState(""), [imageError, setImageError] = useState(false);
  const words = choices.map(choice => choice.word);
  const ready = choices.length === 5 && words.every(word => word.trim());

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/feedback/${token}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      const data = await response.json() as { imageUrl: string; ownResponse: string[] | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "This link is unavailable.");
      setImage(data.imageUrl);
      if (data.ownResponse) { setChoices(choicesFromWords(data.ownResponse)); setSaved(true); }
    }).catch(error => { if (error.name !== "AbortError") setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    let normalized: string[];
    try { normalized = validateWords({ words }); } catch (error) { setError((error as Error).message); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/feedback/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ words: normalized }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Your words could not be saved. Try again.");
      setChoices(values => values.map((value, index) => ({ ...value, word: normalized[index] })));
      setSaved(true);
    } catch (error) { setError(error instanceof Error ? error.message : "Your words could not be saved. Try again."); }
    finally { setBusy(false); }
  }

  return <main className="feedback-page">
    <header className="app-header"><Brand/><span className="header-note">First impressions</span></header>
    {loading ? <div className="feedback-status" role="status">Opening the photo…</div> : !image ?
      <div className="feedback-status"><Camera size={32}/><h1>This link is unavailable.</h1><p>{error}</p><p>Ask the sender for a new link.</p></div> : saved ?
      <div className="feedback-status"><span className="success-mark"><Check size={30}/></span><h1>Your five words are saved.</h1><p>Thanks for sharing your first impression.</p><div className="saved-words">{words.map(word => <span key={word}>{word}</span>)}</div><button className="secondary" onClick={() => setSaved(false)}>Edit my words</button><small>Edits replace your previous response in this browser.</small></div> :
      <div className="feedback-layout">
        <div className="feedback-photo">{imageError ? <p className="error" role="alert">The photo could not load. Reload this page or ask for a new link.</p> : <Dialog>
          <DialogTrigger asChild><button type="button" className="feedback-photo-button" aria-label="View larger photo"><img src={image} alt="Photo to describe" onError={() => setImageError(true)}/><span>Enlarge photo</span></button></DialogTrigger>
          <DialogContent className="feedback-image-dialog" aria-describedby={undefined}><DialogTitle className="sr-only">Photo to describe</DialogTitle><img src={image} alt="Photo to describe, enlarged"/></DialogContent>
        </Dialog>}</div>
        <form className="feedback-form" onSubmit={submit}>
          <div className="feedback-intro"><p className="eyebrow">GO WITH YOUR FIRST IMPRESSION</p><h1>What five words come to mind?</h1><p>Describe how the person comes across in this photo. There’s no right answer.</p></div>
          <WordBank choices={choices} onChange={setChoices} disabled={busy}/>
          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="primary full-width" disabled={busy || imageError || !ready}>{busy ? "Saving…" : "Send my five words"}</button>
          <p className="feedback-privacy">Your words go only to the photo’s owner. No name or email needed. A cookie lets you edit your response without adding another.</p>
        </form>
      </div>}
  </main>;
}
