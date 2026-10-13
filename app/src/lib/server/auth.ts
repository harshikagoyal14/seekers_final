import "server-only";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

export async function resolveActor(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/auth/sign-in");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !profile) redirect("/auth/sign-in");
  return profile as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await resolveActor();
  if (!profile.roles?.includes("admin")) {
    throw new Error("Forbidden");
  }
  return profile;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
