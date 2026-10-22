import { NextResponse, type NextRequest } from "next/server";
import { COLLECTION_COOKIE, newCollectionToken, validCollectionToken } from "@/lib/collection";
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!validCollectionToken(request.cookies.get(COLLECTION_COOKIE)?.value)) {
    response.cookies.set(COLLECTION_COOKIE, newCollectionToken(), {
      httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 31536000,
    });
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
export const config = { matcher: ["/"] };
