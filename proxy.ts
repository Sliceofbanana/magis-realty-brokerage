import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { maintenanceDecision } from "@/lib/maintenance";
import { getSystemSettings } from "@/lib/system-settings";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isPortalRoute = pathname.startsWith("/portal");
  const session = req.auth;

  if (isPortalRoute) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // JWT sessions can outlive an admin flipping status to DEACTIVATED/PENDING
    // mid-session — status is embedded in the token, so this still catches it
    // on the token's next natural refresh rather than trusting a stale ACTIVE.
    if (session.user.status !== "ACTIVE") {
      const loginUrl = new URL("/login", req.nextUrl);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Maintenance mode — set by a System Admin on /portal/system. System Admins
  // are never blocked. The settings read is cached and fails open.
  const settings = await getSystemSettings();
  const decision = maintenanceDecision(pathname, settings, session?.user?.isSystemAdmin === true);
  if (decision.kind === "rewrite") {
    return NextResponse.rewrite(new URL(decision.to, req.nextUrl), { status: decision.status });
  }

  return NextResponse.next();
});

export const config = {
  // Everything except API routes, Next internals and static files (anything with a file extension).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
