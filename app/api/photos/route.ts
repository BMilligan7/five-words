import { database, bucket, owner, listPhotos, route, json, sameOrigin, limitedBody, RequestError } from "@/lib/store";
import { imageContentType, MAX_PHOTO_BYTES } from "@/lib/validation";
import { collectionCookie, collectionOwner, collectionToken, newCollectionToken } from "@/lib/collection";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return route(async () => {
  const existingToken = await collectionToken(); const token = existingToken ?? newCollectionToken(); const ownerId = await collectionOwner(token);
  return json({ photos: await listPhotos(ownerId) }, 200, existingToken ? {} : { "Set-Cookie": collectionCookie(token, request) });
}); }
export async function POST(request: Request) { return route(async () => {
  const ownerId = await owner(); sameOrigin(request);
  const bytes = await limitedBody(request, MAX_PHOTO_BYTES + 65536);
  let form: FormData; try { form = await new Response(bytes.buffer as ArrayBuffer, { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData(); } catch { throw new RequestError("Choose a JPG, PNG, or WebP photo."); }
  const file = form.get("file"); if (!(file instanceof File) || !file.size || file.size > MAX_PHOTO_BYTES) throw new RequestError("Choose a JPG, PNG, or WebP photo up to 8 MB.");
  const image = new Uint8Array(await file.arrayBuffer()); const contentType = imageContentType(image); if (!contentType) throw new RequestError("Choose a valid JPG, PNG, or WebP image.");
  const name = String(form.get("name") ?? file.name.replace(/\.[^.]+$/, "")).trim(); if (!name || name.length > 80) throw new RequestError("Give this photo a name under 80 characters.");
  const db = database(); const count = await db.prepare("SELECT COUNT(*) AS total FROM photos WHERE owner_id = ?").bind(ownerId).first<{ total: number }>(); if ((count?.total ?? 0) >= 30) throw new RequestError("You can keep up to 30 photos. Remove one before adding another.");
  const id = crypto.randomUUID(); const objectKey = `photos/${id}`; await bucket().put(objectKey, image, { httpMetadata: { contentType } });
  try { const result = await db.prepare("INSERT INTO photos (id, owner_id, name, file_name, content_type, size, object_key, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM photos WHERE owner_id = ?) < 30").bind(id, ownerId, name, file.name.slice(0, 160), contentType, file.size, objectKey, new Date().toISOString(), ownerId).run(); if (!result.meta.changes) throw new RequestError("You can keep up to 30 photos. Remove one before adding another."); } catch (error) { await bucket().delete(objectKey); throw error; }
  return json({ photos: await listPhotos(ownerId), uploadedId: id }, 201);
}); }
