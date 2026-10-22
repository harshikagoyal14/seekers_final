import { redirect } from "next/navigation";

export default async function JoinWithCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const isOwner = code.toUpperCase().startsWith("CO-");
  const qs = isOwner ? `ref=${code}` : `code=${code}`;
  redirect(`/join?${qs}`);
}
