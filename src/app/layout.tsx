import type { Metadata, Viewport } from "next";
import { Anton, Inter, Great_Vibes } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} | ${site.headline}`,
  description: `${site.name} is currently bulking. ${site.tagline}`,
  openGraph: {
    title: `${site.name} | ${site.headline}`,
    description: `${site.name} is currently bulking. ${site.tagline}`,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/og.jpg", width: 1200, height: 800, alt: `${site.name} — ${site.headline}` }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.headline}`,
    description: site.tagline,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#040303",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}
