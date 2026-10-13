import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, name, photo_url, roles, invite_code")
    .eq("user_id", user.id)
    .single();

  const profile = profileRow as { id: string; name: string; photo_url: string | null; roles: string[]; invite_code: string } | null;
  if (!profile) redirect("/onboarding");

  return <AppShell profile={profile}>{children}</AppShell>;
}
