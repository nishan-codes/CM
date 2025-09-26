import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Assign an anonymous user id cookie for token tracking if none exists
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const existing = request.cookies.get("uid");
  if (!existing) {
    const uid = crypto.randomUUID();
    // Cookie valid for 1 year, HTTP-only
    response.cookies.set("uid", uid, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

