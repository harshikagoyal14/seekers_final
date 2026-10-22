import { resolveActor } from "@/lib/server/auth";
import type { Metadata } from "next";
import PrivacyClient from "./privacy-client";

export const metadata: Metadata = { title: "Privacy & Visibility" };

export default async function PrivacyPage() {
  const actor = await resolveActor();
  return (
    <PrivacyClient
      directoryVisible={actor.directory_visible}
      leaderboardOptIn={actor.leaderboard_opt_in}
      spotlightOptIn={actor.spotlight_opt_in}
    />
  );
}
