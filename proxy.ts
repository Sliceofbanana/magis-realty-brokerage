import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isPortalRoute = req.nextUrl.pathname.startsWith("/portal");
  if (!isPortalRoute) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // JWT sessions can outlive an admin flipping status to DEACTIVATED/PENDING
  // mid-session — status is embedded in the token, so this still catches it
  // on the token's next natural refresh rather than trusting a stale ACTIVE.
  if (session.user.status !== "ACTIVE") {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/portal/:path*"],
};
