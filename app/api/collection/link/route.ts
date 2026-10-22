import { collectionToken } from "@/lib/collection";
import { route, json, RequestError } from "@/lib/store";
export async function GET() { return route(async () => { const token = await collectionToken(); if (!token) throw new RequestError("Reload the page to open your private collection.", 401); return json({ path: `/restore#${token}` }); }); }
