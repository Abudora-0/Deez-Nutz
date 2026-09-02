import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { AppStateProvider } from "@/components/providers/AppState";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { ScrollProgress } from "@/components/chrome/ScrollProgress";
import { Toaster } from "@/components/chrome/Toaster";
import { KonamiEasterEgg } from "@/components/chrome/KonamiEasterEgg";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SITE_URL } from "@/lib/site";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});
const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Deez Nutz - meme and gif arcade",
    template: "%s - Deez Nutz",
  },
  description:
    "Search, caption, and download the internet's memes, gif templates, and fresh reaction images. No login, no watermarks, no tracking.",
  keywords: ["memes", "gifs", "meme templates", "meme generator", "download memes", "reaction images", "deez nutz"],
  authors: [{ name: "Abudora-0" }],
  openGraph: {
    title: "Deez Nutz - meme and gif arcade",
    description:
      "Search, caption, and download the internet's memes, gifs, and templates. No login.",
    url: SITE,
    siteName: "Deez Nutz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deez Nutz - meme and gif arcade",
    description: "Search, caption, and download the internet's finest nonsense. No login.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#12100f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="scanlines flex min-h-full flex-col">
        <AppStateProvider>
          <ScrollProgress />
          <KonamiEasterEgg />
          <CommandPalette />
          <Toaster />
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-clip px-4 py-8">{children}</main>
          {modal}
          <SiteFooter />
        </AppStateProvider>
      </body>
    </html>
  );
}
