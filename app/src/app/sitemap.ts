import { createServiceClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seekers.community";
  const svc = await createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;
  const { data: businesses } = await db
    .from("business_profiles")
    .select("slug, updated_at")
    .eq("approval_status", "approved")
    .not("slug", "is", null) as { data: Array<{ slug: string; updated_at: string }> | null };

  const { data: events } = await db
    .from("events")
    .select("slug, date_time")
    .eq("status", "upcoming") as { data: Array<{ slug: string; date_time: string }> | null };

  return [
    { url: `${base}/`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/about`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/wealth-seekers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...(businesses ?? []).map(b => ({
      url: `${base}/business/${b.slug}`,
      lastModified: new Date(b.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(events ?? []).map(e => ({
      url: `${base}/events/${e.slug}`,
      lastModified: new Date(e.date_time),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
