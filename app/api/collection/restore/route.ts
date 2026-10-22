import { collectionCookie, validCollectionToken } from "@/lib/collection";
import { route, json, jsonInput, sameOrigin, RequestError } from "@/lib/store";
export async function POST(request: Request) { return route(async () => {
  sameOrigin(request); const input = await jsonInput(request); const token = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>).token : null;
  if (!validCollectionToken(token)) throw new RequestError("This collection link is incomplete. Open the full private link you saved.");
  return json({ restored: true }, 200, { "Set-Cookie": collectionCookie(token, request) });
}); }
