import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fredoka, Nunito } from "next/font/google";
import { PwaRegister } from "@/components/PwaInstall";
import { SplashScreen } from "@/components/SplashScreen";
import { SITE } from "@/lib/site";
import "./globals.css";

const display = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const sans = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap", weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: SITE.keywords,
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  publisher: SITE.author,
  category: "games",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: SITE.shortName, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    creator: SITE.author,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4d6d",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: "GameApplication",
  operatingSystem: "Any (web browser)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: SITE.author },
  image: `${SITE.url}/opengraph-image.png`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SplashScreen />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
