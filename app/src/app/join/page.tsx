import type { Metadata } from "next";
import JoinForm from "./join-form";

export const metadata: Metadata = {
  title: "Join Seekers",
  description: "Join the Seekers community — a closed network of trusted Indian business owners, freelancers and investors.",
};

export default function JoinPage({ searchParams }: { searchParams: Promise<{ ref?: string; code?: string }> }) {
  return <JoinForm searchParamsPromise={searchParams} />;
}
