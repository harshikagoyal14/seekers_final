import { resolveActor } from "@/lib/server/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Events & Initiatives" };

type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string | null;
  online_url: string | null;
  is_paid: boolean;
  price_paise: number | null;
  status: string;
  rsvp_count?: number;
  user_rsvpd?: boolean;
};

export default async function EventsPage() {
  const actor = await resolveActor();
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;

  const { data: events } = await db
    .from("events")
    .select("id, slug, title, description, date_time, location, online_url, is_paid, price_paise, status")
    .in("status", ["upcoming"])
    .order("date_time", { ascending: true }) as { data: EventRow[] | null };

  const { data: past } = await db
    .from("events")
    .select("id, slug, title, description, date_time, location, status")
    .eq("status", "past")
    .order("date_time", { ascending: false })
    .limit(5) as { data: EventRow[] | null };

  const { data: initiatives } = await db
    .from("initiatives")
    .select("id, org_name, title, description, donate_url, contact_info")
    .eq("active", true)
    .order("created_at", { ascending: false }) as {
      data: { id: string; org_name: string; title: string; description: string | null; donate_url: string | null; contact_info: string | null }[] | null
    };

  const upcomingIds = (events ?? []).map(e => e.id);
  const rsvpCounts: Record<string, number> = {};
  const userRsvps = new Set<string>();

  if (upcomingIds.length > 0) {
    const { data: rsvps } = await db
      .from("event_rsvps")
      .select("event_id, profile_id")
      .in("event_id", upcomingIds)
      .eq("status", "going") as { data: { event_id: string; profile_id: string }[] | null };
    for (const r of rsvps ?? []) {
      rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] ?? 0) + 1;
      if (r.profile_id === actor.id) userRsvps.add(r.event_id);
    }
  }

  const enriched = (events ?? []).map(e => ({
    ...e, rsvp_count: rsvpCounts[e.id] ?? 0, user_rsvpd: userRsvps.has(e.id),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-bold text-2xl text-[#15201E] mb-1">Events &amp; Initiatives</h1>
      <p className="text-sm text-[#4F5B59] mb-6">Meetups, sessions and causes the community supports.</p>

      {/* Upcoming */}
      <section className="mb-8">
        <h2 className="font-semibold text-sm text-[#4F5B59] uppercase tracking-wide mb-3">Upcoming</h2>
        {enriched.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E5E7E6] text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-sm text-[#4F5B59]">No upcoming events right now. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enriched.map(e => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {(past ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-sm text-[#4F5B59] uppercase tracking-wide mb-3">Past events</h2>
          <div className="space-y-3">
            {(past ?? []).map(e => (
              <EventCard key={e.id} event={e} past />
            ))}
          </div>
        </section>
      )}

      {/* Initiatives */}
      {(initiatives ?? []).length > 0 && (
        <section>
          <h2 className="font-semibold text-sm text-[#4F5B59] uppercase tracking-wide mb-1">Initiatives we support</h2>
          <p className="text-xs text-[#4F5B59] mb-4">Causes run by partner organisations. Donations go directly to them — never through Seekers.</p>
          <div className="space-y-3">
            {(initiatives ?? []).map(i => (
              <div key={i.id} className="bg-white rounded-2xl p-5 border border-[#E5E7E6]">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4F5B59] mb-1">{i.org_name}</p>
                <p className="font-semibold text-sm text-[#15201E]">{i.title}</p>
                {i.description && <p className="text-xs text-[#4F5B59] mt-1.5 leading-relaxed">{i.description}</p>}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {i.donate_url && (
                    <a
                      href={i.donate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-4 rounded-xl text-xs font-semibold text-white flex items-center"
                      style={{ background: "#0B5D63" }}
                    >
                      Donate on their site ↗
                    </a>
                  )}
                  {i.contact_info && (
                    <a
                      href={`mailto:${i.contact_info}`}
                      className="h-8 px-4 rounded-xl text-xs font-semibold border border-[#0B5D63] text-[#0B5D63] flex items-center"
                    >
                      Volunteer / Contact
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({ event, past = false }: { event: EventRow; past?: boolean }) {
  const date = new Date(event.date_time);
  const dateStr = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className={`bg-white rounded-2xl p-4 border border-[#E5E7E6] ${past ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-[#15201E]">{event.title}</p>
          <p className="text-xs text-[#4F5B59] mt-0.5">{dateStr} · {timeStr}</p>
          {event.location && <p className="text-xs text-[#4F5B59]">{event.location}</p>}
          {event.online_url && !event.location && <p className="text-xs text-[#4F5B59]">Online</p>}
          {event.description && (
            <p className="text-xs text-[#4F5B59] mt-1.5 line-clamp-2">{event.description}</p>
          )}
          {!past && typeof event.rsvp_count === "number" && (
            <p className="text-xs text-[#4F5B59] mt-1.5">
              {event.rsvp_count} {event.rsvp_count === 1 ? "person" : "people"} going
            </p>
          )}
        </div>
        {!past && (
          <div className="shrink-0 text-right space-y-2">
            <p className="text-xs font-semibold text-[#0B5D63]">
              {event.is_paid && event.price_paise
                ? "₹" + (event.price_paise / 100).toLocaleString("en-IN")
                : "Free"}
            </p>
            <form action="/api/events/rsvp" method="POST">
              <input type="hidden" name="event_id" value={event.id} />
              <button
                type="submit"
                className="h-8 px-3 rounded-xl text-xs font-medium transition-colors"
                style={event.user_rsvpd
                  ? { background: "#E8F2F2", color: "#0B5D63" }
                  : { background: "#0B5D63", color: "#fff" }}
              >
                {event.user_rsvpd ? "Going ✓" : "RSVP"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
