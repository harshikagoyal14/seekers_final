import type { ReferralLabel } from "@/lib/types";

const CHIP_STYLES: Record<ReferralLabel, { bg: string; text: string; dot: string; icon: string }> = {
  "Pending":         { bg: "#FDF1DC", text: "#8A4B00", dot: "#8A4B00", icon: "○" },
  "In progress":     { bg: "#E5EDF8", text: "#1D4F91", dot: "#1D4F91", icon: "◑" },
  "Closed · won":    { bg: "#E3F2E8", text: "#17663A", dot: "#17663A", icon: "✓" },
  "Closed · no deal":{ bg: "#ECEFED", text: "#4F5B59", dot: "#4F5B59", icon: "✕" },
  "Needs attention": { bg: "#FBE9E6", text: "#A52A1C", dot: "#A52A1C", icon: "⚠" },
};

export function StatusChip({ label, sub }: { label: ReferralLabel; sub?: string }) {
  const s = CHIP_STYLES[label];
  return (
    <div>
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: s.bg, color: s.text }}
      >
        <span style={{ color: s.dot }}>{s.icon}</span>
        {label}
      </span>
      {sub && <p className="text-xs mt-0.5" style={{ color: "#4F5B59" }}>{sub}</p>}
    </div>
  );
}
