import { database, sharedPhoto, route, json, sameOrigin, jsonInput, RequestError } from "@/lib/store";
import { validateWords } from "@/lib/validation";
type Context = { params: Promise<{ token: string }> };
const COOKIE = "five-words-respondent-v1";
function respondent(request: Request) { const value = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1); return value && /^[a-f0-9-]{36}$/.test(value) ? value : null; }
async function digest(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, "0")).join(""); }
export async function GET(request: Request, context: Context) { return route(async () => {
  const { token } = await context.params; const photo = await sharedPhoto(token); const id = respondent(request) ?? crypto.randomUUID();
  const own = await database().prepare("SELECT words FROM photo_responses WHERE photo_id = ? AND respondent_hash = ?").bind(photo.id, await digest(photo.id + ":" + id)).first<{ words: string }>();
  return json({ imageUrl: `/api/feedback/${token}/image`, ownResponse: own ? JSON.parse(own.words) : null }, 200, { "Set-Cookie": `${COOKIE}=${id}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`, "Referrer-Policy": "no-referrer" });
}); }
export async function POST(request: Request, context: Context) { return route(async () => {
  sameOrigin(request); const { token } = await context.params; const photo = await sharedPhoto(token); const id = respondent(request); if (!id) throw new RequestError("Please reload this page to enable feedback. Your browser must allow cookies.");
  let words: string[]; try { words = validateWords(await jsonInput(request)); } catch (error) { if (error instanceof RequestError) throw error; throw new RequestError(error instanceof Error ? error.message : "Check your five words."); }
  const now = new Date().toISOString();
  const saved = await database().prepare("INSERT INTO photo_responses (id, photo_id, respondent_hash, words, created_at, updated_at) SELECT ?, id, ?, ?, ?, ? FROM photos WHERE id = ? AND share_token = ? ON CONFLICT(photo_id, respondent_hash) DO UPDATE SET words = excluded.words, updated_at = excluded.updated_at").bind(crypto.randomUUID(), await digest(photo.id + ":" + id), JSON.stringify(words), now, now, photo.id, token).run();
  if (!saved.meta.changes) throw new RequestError("This feedback link has just been closed.", 409); return json({ saved: true });
}); }
