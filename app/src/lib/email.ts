import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";

/** Fetch the auth email for a profiles.id */
export async function getEmailForProfile(profileId: string): Promise<string | null> {
  const svc = await createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = svc as any;
  const { data: p } = await db
    .from("profiles")
    .select("user_id")
    .eq("id", profileId)
    .single() as { data: { user_id: string } | null };
  if (!p) return null;
  const { data: { user } } = await svc.auth.admin.getUserById(p.user_id);
  return user?.email ?? null;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Seekers <noreply@seekers.community>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seekers.community";

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return; // silent no-op in dev without key
  await resend.emails.send({ from: FROM, to, subject, html });
}

function wrap(body: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#15201E">
      <div style="background:#083F43;padding:20px 24px">
        <span style="color:#fff;font-size:20px;font-weight:700">Seekers.</span>
      </div>
      <div style="padding:24px">${body}</div>
      <div style="padding:12px 24px;font-size:12px;color:#4F5B59;border-top:1px solid #E5E7E6">
        <a href="${SITE}" style="color:#0B5D63">Seekers Community</a>
      </div>
    </div>`;
}

export const emails = {
  enquiryReceived(to: string, bizName: string, senderName: string) {
    return sendEmail(
      to,
      `New enquiry for ${bizName}`,
      wrap(`<p>Hi,</p><p><strong>${senderName}</strong> sent an enquiry to <strong>${bizName}</strong>.</p>
      <p><a href="${SITE}/my-business/enquiries" style="color:#0B5D63">View enquiry →</a></p>`)
    );
  },

  referralReceived(to: string, bizName: string, referrerName: string) {
    return sendEmail(
      to,
      `New referral for ${bizName}`,
      wrap(`<p>Hi,</p><p><strong>${referrerName}</strong> referred someone to <strong>${bizName}</strong>.</p>
      <p><a href="${SITE}/my-business/referrals" style="color:#0B5D63">View referral →</a></p>`)
    );
  },

  referralStatusChanged(to: string, bizName: string, newStatus: string) {
    return sendEmail(
      to,
      `Referral update: ${bizName}`,
      wrap(`<p>Hi,</p><p>Your referral to <strong>${bizName}</strong> has been updated to <strong>${newStatus}</strong>.</p>
      <p><a href="${SITE}/referrals" style="color:#0B5D63">View referrals →</a></p>`)
    );
  },

  knowledgePostApproved(to: string, title: string) {
    return sendEmail(
      to,
      `Your post "${title}" is live`,
      wrap(`<p>Hi,</p><p>Your knowledge post <strong>${title}</strong> has been approved and is now live.</p>
      <p><a href="${SITE}/community/knowledge" style="color:#0B5D63">View it →</a></p>`)
    );
  },

  businessApproved(to: string, bizName: string) {
    return sendEmail(
      to,
      `Your business listing is live: ${bizName}`,
      wrap(`<p>Hi,</p><p>Your business <strong>${bizName}</strong> has been approved and is now listed in the Seekers directory.</p>
      <p><a href="${SITE}/directory" style="color:#0B5D63">View directory →</a></p>`)
    );
  },
};
