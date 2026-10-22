import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
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

  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: biz } = await (svc as any)
    .from("business_profiles")
    .select("id")
    .eq("owner_id", profile.id)
    .maybeSingle() as { data: { id: string } | null };

  return <AppShell profile={profile} hasBusiness={!!biz}>{children}</AppShell>;
}
