import { resolveActor } from "@/lib/server/auth";
import type { Metadata } from "next";
import EditProfileClient from "./edit-profile-client";

export const metadata: Metadata = { title: "Edit Profile" };

export default async function EditProfilePage() {
  const actor = await resolveActor();
  return <EditProfileClient profile={actor} />;
}
