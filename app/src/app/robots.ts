import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seekers.community";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/home", "/directory", "/members", "/referrals", "/community", "/me", "/admin", "/api/", "/onboarding/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
