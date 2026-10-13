import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Seekers", template: "%s · Seekers" },
  description: "A closed community of trusted Indian business owners, freelancers and investors.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://seekers.community"),
  openGraph: { siteName: "Seekers", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0B5D63",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} h-full`}>
      <body className="min-h-full bg-[#F6F7F5] text-[#15201E] antialiased" style={{ fontFamily: "var(--font-hanken), system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
