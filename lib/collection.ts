import { headers } from "next/headers";
export const COLLECTION_COOKIE = "five-words-collection-v1";
export function validCollectionToken(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{64}$/.test(value); }
export async function collectionToken() {
  const value = (await headers()).get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(COLLECTION_COOKIE + "="))?.slice(COLLECTION_COOKIE.length + 1);
  return validCollectionToken(value) ? value : null;
}
export function newCollectionToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0")).join(""); }
export async function collectionOwner(token: string) { return "anon:" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))), byte => byte.toString(16).padStart(2, "0")).join(""); }
export function collectionCookie(token: string, request: Request) { return `${COLLECTION_COOKIE}=${token}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`; }
