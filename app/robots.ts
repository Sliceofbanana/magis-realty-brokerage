import type { MetadataRoute } from "next";

// Metadata routes (robots.ts/sitemap.ts) aren't rendered from an incoming
// request the way a page is, so — unlike lib/url.ts's getBaseUrl() — this
// can't read the request's Host header. NEXTAUTH_URL is already required to
// be the real production origin for auth callbacks to work, so it doubles
// as the canonical URL here.
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/portal",
        "/portal/",
        "/login",
        "/register",
        "/register/success",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
