import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Seekers Community",
    short_name: "Seekers",
    description: "A closed community for Indian business owners, freelancers and investors.",
    start_url: "/home",
    display: "standalone",
    background_color: "#083F43",
    theme_color: "#0B5D63",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
