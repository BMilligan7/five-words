import { env } from "cloudflare:workers";
import { collectionOwner, collectionToken } from "./collection";
import type { Photo } from "./photos";
export class RequestError extends Error { constructor(message: string, public status = 400) { super(message); } }
export type PhotoRow = { id: string; owner_id: string; name: string; file_name: string; content_type: string; size: number; object_key: string; share_token: string | null; created_at: string };
type ResponseRow = { id: string; photo_id: string; words: string; updated_at: string };
export function database() { if (!env.DB) throw new Error("Photo database unavailable."); return env.DB; }
export function bucket() { if (!env.BUCKET) throw new Error("Photo storage unavailable."); return env.BUCKET; }
export async function owner() { const token = await collectionToken(); if (!token) throw new RequestError("Reload this page to open your private collection. Your browser needs to allow cookies.", 401); return collectionOwner(token); }
export function sameOrigin(request: Request) { const origin = request.headers.get("origin"); if (origin && origin !== new URL(request.url).origin) throw new RequestError("Please submit from this app.", 403); }
export async function limitedBody(request: Request, maximum: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > maximum) throw new RequestError("This upload or response is too large.", 413);
  const reader = request.body?.getReader(); if (!reader) return new Uint8Array();
  const parts: Uint8Array[] = []; let size = 0;
  try { while (true) { const result = await reader.read(); if (result.done) break; size += result.value.byteLength; if (size > maximum) { await reader.cancel(); throw new RequestError("This upload or response is too large.", 413); } parts.push(result.value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; } return bytes;
}
export async function jsonInput(request: Request): Promise<unknown> { const text = new TextDecoder().decode(await limitedBody(request, 4096)); try { return JSON.parse(text); } catch { throw new RequestError("Please check your response and try again."); } }
export async function route(action: () => Promise<Response>): Promise<Response> {
  try { return await action(); } catch (error) {
    if (error instanceof RequestError) return json({ error: error.message }, error.status);
    console.error("Photo request failed:", error instanceof Error ? error.message : "Unknown error");
    return json({ error: "Couldn’t finish that. Your input has been kept; please try again." }, 503);
  }
}
export function json(data: unknown, status = 200, headers: Record<string, string> = {}) { return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", ...headers } }); }
export async function ownedPhoto(id: string, ownerId: string) { const photo = await database().prepare("SELECT * FROM photos WHERE id = ? AND owner_id = ?").bind(id, ownerId).first<PhotoRow>(); if (!photo) throw new RequestError("This photo was not found.", 404); return photo; }
export async function sharedPhoto(token: string) { if (!/^[a-f0-9]{64}$/.test(token)) throw new RequestError("This feedback link is closed or unavailable.", 404); const photo = await database().prepare("SELECT * FROM photos WHERE share_token = ?").bind(token).first<PhotoRow>(); if (!photo) throw new RequestError("This feedback link is closed or unavailable.", 404); return photo; }
export async function listPhotos(ownerId: string): Promise<Photo[]> {
  const db = database(); const [{ results: photos }, { results: responses }] = await db.batch<PhotoRow | ResponseRow>([
    db.prepare("SELECT * FROM photos WHERE owner_id = ? ORDER BY created_at DESC, id").bind(ownerId),
    db.prepare("SELECT r.id, r.photo_id, r.words, r.updated_at FROM photo_responses r JOIN photos p ON p.id = r.photo_id WHERE p.owner_id = ? ORDER BY r.updated_at DESC").bind(ownerId),
  ]);
  return (photos as PhotoRow[]).map(photo => ({ id: photo.id, name: photo.name, fileName: photo.file_name, shareToken: photo.share_token, createdAt: photo.created_at,
    responses: (responses as ResponseRow[]).filter(response => response.photo_id === photo.id).map(response => ({ id: response.id, words: JSON.parse(response.words), updatedAt: response.updated_at })),
  }));
}
export async function imageResponse(photo: PhotoRow) { const object = await bucket().get(photo.object_key); if (!object) throw new RequestError("This photo could not be found. Ask the sender for a new link.", 404); return new Response(object.body, { headers: { "Content-Type": photo.content_type, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } }); }
