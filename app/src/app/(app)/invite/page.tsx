import { resolveActor } from "@/lib/server/auth";
import type { Metadata } from "next";
import InviteClient from "./invite-client";

export const metadata: Metadata = { title: "Invite a Member" };

export default async function InvitePage() {
  const actor = await resolveActor();
  return <InviteClient inviteCode={actor.invite_code} name={actor.name} />;
}
