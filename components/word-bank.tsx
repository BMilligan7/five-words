"use client";
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { CORE_WORDS, MORE_WORDS, matchingBankWords, normalizeWord, shuffledWords, toggleBankWord, type WordChoice } from "@/lib/word-bank";

const PAGE_SIZE = 25;

export default function WordBank({ choices, onChange, disabled }: {
  choices: WordChoice[];
  onChange: (choices: WordChoice[]) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [latestCustom, setLatestCustom] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<{ core: string[]; more: string[] } | null>(null);
  // Shuffle once on opening. Tapping, typing, and paging never move the words.
  useEffect(() => {
    // Wait for client hydration so the server and browser never disagree.
    const frame = requestAnimationFrame(() => {
      setOrder({ core: shuffledWords(CORE_WORDS), more: shuffledWords(MORE_WORDS) });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const selected = new Set(choices.map(choice => normalizeWord(choice.word)));
  const full = choices.length === 5;
  const filled = choices.filter(choice => choice.word.trim()).length;
  const suggestions = !order ? [] : showMore
    ? (query.trim() ? matchingBankWords(query, [...order.core, ...order.more]) : order.more)
    : order.core;
  const pageCount = Math.max(1, Math.ceil(suggestions.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleWords = suggestions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  function toggleMore() {
    setShowMore(value => !value);
    setQuery("");
    setPage(0);
  }

  function addOther() {
    if (full || disabled) return;
    const id = crypto.randomUUID();
    setLatestCustom(id);
    onChange([...choices, { id, word: "", custom: true }]);
  }

  return <fieldset className="word-picker" disabled={disabled}>
    <legend>Choose five descriptive words</legend>
    <div className="word-bank">
      <div className="word-bank-heading"><h2>{showMore ? "More words" : "Choose five words"}</h2><span aria-live="polite">{choices.length} / 5 chosen</span></div>
      {showMore && <label className="word-bank-search"><span className="sr-only">Find a descriptive word in the full word bank</span><Search size={17} aria-hidden="true"/><input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Search all words…" autoComplete="off"/></label>}
      <div className="word-bank-options" role="group" aria-label={showMore ? "More descriptive words" : "25 suggested descriptive words"} aria-busy={!order}>
        {visibleWords.map(word => {
          const chosen = selected.has(normalizeWord(word));
          return <button key={word} type="button" className="word-bank-option" aria-pressed={chosen} disabled={disabled || (!chosen && full)} onClick={() => onChange(toggleBankWord(choices, word))}>{word}</button>;
        })}
        {!order && <p className="word-bank-empty" role="status">Opening the word bank…</p>}
        {order && !suggestions.length && <p className="word-bank-empty">No matching words. Add your own below.</p>}
      </div>
      {showMore && <div className="word-bank-pagination">
        <button type="button" className="secondary" disabled={disabled || currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
        <span role="status">{suggestions.length ? `Page ${currentPage + 1} of ${pageCount}` : "No matches"}</span>
        <button type="button" className="secondary" disabled={disabled || currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</button>
      </div>}
      <div className="word-bank-actions">
        <button type="button" className="secondary" aria-expanded={showMore} disabled={disabled} onClick={toggleMore}>{showMore ? "Back to 25 words" : "More words"}</button>
        <button type="button" className="secondary add-other" disabled={disabled || full} onClick={addOther}><Plus size={16} aria-hidden="true"/>Add your own word</button>
      </div>
    </div>
    <div className="word-selection-heading"><h2>Your five words</h2><span>{choices.length} / 5</span></div>
    <div className="word-selection" aria-label="Your selected words">
      {!choices.length && <p className="word-bank-help">Tap a word above, or add your own.</p>}
      {choices.map((choice, index) => choice.custom ?
        <div className="custom-word" key={choice.id}>
          <label><span>Your word {index + 1}</span><input aria-label={`Your word ${index + 1}`} value={choice.word} required maxLength={40} autoComplete="off" autoCapitalize="none" autoFocus={choice.id === latestCustom} placeholder="Type one descriptive word" onChange={event => onChange(choices.map(value => value.id === choice.id ? { ...value, word: event.target.value } : value))}/></label>
          <button type="button" className="remove-word" aria-label={`Remove your word ${index + 1}`} onClick={() => onChange(choices.filter(value => value.id !== choice.id))}><X size={17} aria-hidden="true"/></button>
        </div> :
        <button type="button" className="selected-word" key={choice.id} aria-label={`Remove ${choice.word}`} onClick={() => onChange(choices.filter(value => value.id !== choice.id))}>{choice.word}<X size={15} aria-hidden="true"/></button>
      )}
    </div>
    <p className="word-bank-status" role="status" aria-live="polite">{full ? (filled === 5 ? "Five words chosen. Remove one if you want to swap it." : "Fill in your own words before sending.") : `${5 - choices.length} more ${5 - choices.length === 1 ? "word" : "words"} to choose. You can add more than one of your own.`}</p>
  </fieldset>;
}
