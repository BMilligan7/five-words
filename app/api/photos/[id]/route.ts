import { database, bucket, owner, ownedPhoto, listPhotos, route, json, sameOrigin, jsonInput, RequestError } from "@/lib/store";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) { return route(async () => {
  const ownerId = await owner(); sameOrigin(request); const { id } = await context.params; await ownedPhoto(id, ownerId);
  const data = await jsonInput(request); if (!data || typeof data !== "object" || Array.isArray(data)) throw new RequestError("Choose a supported photo action."); const input = data as Record<string, unknown>; const db = database();
  if (input.action === "share") { const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""); await db.prepare("UPDATE photos SET share_token = COALESCE(share_token, ?) WHERE id = ? AND owner_id = ?").bind(token, id, ownerId).run(); }
  else if (input.action === "close") await db.prepare("UPDATE photos SET share_token = NULL WHERE id = ? AND owner_id = ?").bind(id, ownerId).run();
  else if (input.action === "rename" && typeof input.name === "string" && input.name.trim() && input.name.trim().length <= 80) await db.prepare("UPDATE photos SET name = ? WHERE id = ? AND owner_id = ?").bind(input.name.trim(), id, ownerId).run();
  else throw new RequestError("Choose a supported photo action.");
  return json({ photos: await listPhotos(ownerId) });
}); }
export async function DELETE(request: Request, context: Context) { return route(async () => {
  const ownerId = await owner(); sameOrigin(request); const { id } = await context.params; const photo = await ownedPhoto(id, ownerId);
  await database().prepare("UPDATE photos SET share_token = NULL WHERE id = ? AND owner_id = ?").bind(id, ownerId).run();
  await bucket().delete(photo.object_key); await database().prepare("DELETE FROM photos WHERE id = ? AND owner_id = ?").bind(id, ownerId).run();
  return json({ photos: await listPhotos(ownerId) });
}); }
