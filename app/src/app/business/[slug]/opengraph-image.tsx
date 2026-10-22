import { ImageResponse } from "next/og";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: b } = await (svc as any)
    .from("business_profiles")
    .select("name, bio, type, categories(name), logo_path")
    .eq("slug", slug)
    .eq("approval_status", "approved")
    .single() as {
      data: {
        name: string; bio: string | null; type: string;
        categories: { name: string } | null; logo_path: string | null;
      } | null
    };

  const name = b?.name ?? "Seekers Business";
  const category = b?.categories?.name ?? b?.type ?? "";
  const bio = b?.bio ? b.bio.slice(0, 120) + (b.bio.length > 120 ? "…" : "") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "#083F43",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Seekers.</span>
          {category && (
            <span style={{ color: "#4BB8BF", fontSize: 14, background: "rgba(75,184,191,0.15)", padding: "4px 12px", borderRadius: 99 }}>
              {category}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {b?.logo_path && (
            <img src={b.logo_path} width={80} height={80} style={{ borderRadius: 16, objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }} />
          )}
          <div style={{ color: "#fff", fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>{name}</div>
          {bio && (
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 22, lineHeight: 1.5, maxWidth: 800 }}>{bio}</div>
          )}
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>seekers.community · Business Directory</div>
      </div>
    ),
    { ...size }
  );
}
