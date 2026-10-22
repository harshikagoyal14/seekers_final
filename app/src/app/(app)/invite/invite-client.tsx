"use client";
import { useState } from "react";

export default function InviteClient({ inviteCode, name }: { inviteCode: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join?code=${inviteCode}`
    : `https://seekers.community/join?code=${inviteCode}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const whatsappMsg = encodeURIComponent(
    `Hi! I'm inviting you to join Seekers — a closed community of Indian business owners, freelancers and investors. Use my link to apply: ${inviteUrl}`
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-[#15201E] mb-1">Invite a member</h1>
      <p className="text-sm text-[#4F5B59] mb-8">
        Seekers grows through trust. Only invite people you'd vouch for professionally.
      </p>

      {/* Invite link card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6] mb-4">
        <p className="text-xs font-medium text-[#4F5B59] uppercase tracking-wide mb-2">Your invite link</p>
        <div className="flex items-center gap-2 bg-[#F6F7F5] rounded-xl px-4 py-3 mb-4">
          <p className="flex-1 text-sm font-mono text-[#15201E] truncate">/join?code={inviteCode}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: copied ? "#17663A" : "#0B5D63" }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={`https://wa.me/?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "#25D366" }}
          >
            Share on WhatsApp
          </a>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7E6]">
        <p className="font-semibold text-sm text-[#15201E] mb-4">How it works</p>
        <ol className="space-y-3">
          {[
            { n: "1", text: "Share your link with someone you trust professionally." },
            { n: "2", text: "They sign up and complete their profile." },
            { n: "3", text: "You're credited as the person who brought them in." },
            { n: "4", text: "If they refer a business deal that closes, both of you can earn credits." },
          ].map(item => (
            <li key={item.n} className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: "#0B5D63" }}
              >
                {item.n}
              </span>
              <p className="text-sm text-[#15201E]">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-xs text-[#4F5B59] text-center mt-6">
        Your code: <strong className="font-mono">{inviteCode}</strong> · You, {name}
      </p>
    </div>
  );
}
