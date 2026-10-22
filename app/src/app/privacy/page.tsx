import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Notice", description: "How Seekers handles your personal data." };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <header className="bg-white border-b border-[#E5E7E6] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#083F43]">Seekers<span className="text-[#0B5D63]">.</span></Link>
        <Link href="/auth/sign-in" className="text-sm font-medium text-[#0B5D63]">Member sign in</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-16 prose prose-sm">
        <h1 className="font-bold text-3xl text-[#083F43] mb-2">Privacy Notice</h1>
        <p className="text-[#4F5B59] mb-8">Last updated: October 2026. This notice tells you what personal data Seekers collects, why, and how you can control it.</p>

        <Section title="What data we collect">
          <p>When you join: your email address, name, photo, designation, company, industry and location. These are required to create your profile.</p>
          <p>When you send an enquiry: your name and contact (phone or email). These are encrypted and shared only with the business you contacted.</p>
          <p>When you use referrals: referral codes, deal values and status updates, to run the referral engine.</p>
          <p>When you submit a verification document: the document file, stored in a private bucket accessible only to admins, and deleted after the review period the admin sets.</p>
        </Section>

        <Section title="Why we use it">
          <p>We process your data to provide the Seekers community platform — specifically: to authenticate you, show your profile to other members (if you switch visibility on), route referrals and enquiries, and send you notifications about your referrals.</p>
          <p>We do not sell your data, show it to advertisers, or use it for profiling.</p>
        </Section>

        <Section title="Your choices">
          <ul>
            <li><strong>Directory visibility:</strong> off by default. Switch it on in your profile settings. When off, no member can find you by name.</li>
            <li><strong>Notifications:</strong> you can turn off each category in Settings.</li>
            <li><strong>Delete your account:</strong> contact us and we will delete your profile and personal data within 30 days. Referral records required for a business's audit trail are anonymised, not deleted.</li>
          </ul>
        </Section>

        <Section title="Your rights (India DPDP Act 2023)">
          <p>You have the right to access your data, correct it, and withdraw consent. To exercise these rights, or to raise a grievance, contact our data protection contact at <a href="mailto:privacy@seekers.community" className="text-[#0B5D63]">privacy@seekers.community</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="Security">
          <p>Contact details are encrypted at rest. Access logs are kept for one year. We follow the DPDP Act's security obligations and will notify affected members and the Data Protection Board without delay in the event of a breach.</p>
        </Section>

        <Section title="Children">
          <p>Seekers is for adults 18 and over. We do not knowingly collect data from minors. Sign-up requires an 18+ declaration.</p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-bold text-lg text-[#15201E] mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-[#4F5B59] leading-relaxed">{children}</div>
    </section>
  );
}
