"use client";

export default function ScrollToEnquiryButton() {
  return (
    <button
      className="flex-1 h-12 rounded-xl font-semibold text-sm text-white"
      style={{ background: "#0B5D63" }}
      onClick={() => document.getElementById("enquiry-form")?.scrollIntoView({ behavior: "smooth" })}
    >
      Send enquiry
    </button>
  );
}
