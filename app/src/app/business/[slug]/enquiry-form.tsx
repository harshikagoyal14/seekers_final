"use client";
import { useState } from "react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EnquiryForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [name,    setName]    = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: businessId, name, contact, message, website }),
    });

    if (res.status === 429) {
      setError("Too many enquiries. Please wait before sending another.");
    } else if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not send enquiry. Please try again.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div id="enquiry-form" className="bg-white rounded-2xl p-6 border border-[#E5E7E6] text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-semibold text-[#15201E] mb-1">Enquiry sent</h3>
        <p className="text-sm text-[#4F5B59]">
          {businessName} will contact you directly. Your details were shared only with them.
        </p>
      </div>
    );
  }

  return (
    <div id="enquiry-form" className="bg-white rounded-2xl p-6 border border-[#E5E7E6]">
      <h3 className="font-semibold text-base text-[#15201E] mb-1">Send an enquiry</h3>
      <p className="text-xs text-[#4F5B59] mb-4">
        Goes to {businessName}'s inbox. Your details are shared only with this business.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Your name"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Kavya Rao"
        />
        <Input
          label="Phone or email"
          required
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder="So they can reply"
        />
        <Textarea
          label="What do you need?"
          required
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Fabric, quantity, and when you need it"
          rows={3}
        />

        {/* Honeypot */}
        <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" />

        <p className="text-xs text-[#4F5B59]">
          Your details will be shared with this business so they can reply. No account needed.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Send enquiry
        </Button>
      </form>

      <p className="text-xs text-[#4F5B59] mt-3 text-center">
        Seekers members can also refer you for tracked credit.
      </p>
    </div>
  );
}
