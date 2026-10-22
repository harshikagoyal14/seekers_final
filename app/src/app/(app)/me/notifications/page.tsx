import { resolveActor } from "@/lib/server/auth";
import type { Metadata } from "next";
import NotificationsClient from "./notifications-client";

export const metadata: Metadata = { title: "Notification Preferences" };

export default async function NotificationsPage() {
  const actor = await resolveActor();
  return <NotificationsClient profileId={actor.id} />;
}
