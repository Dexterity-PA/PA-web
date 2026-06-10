import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LenisProvider from "@/components/ui/LenisProvider";
import Nav from "@/components/ui/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pa-web.vercel.app";
const description =
  "Quantitative models, companies, and tools for people locked out of the systems that could help them.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Praneeth Annapureddy",
    template: "%s · Praneeth Annapureddy",
  },
  description,
  openGraph: {
    title: "Praneeth Annapureddy",
    description,
    url: "/",
    siteName: "Praneeth Annapureddy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Praneeth Annapureddy",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#050607",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <LenisProvider>
          <div className="mesh" aria-hidden />
          <div className="grain" aria-hidden />
          <Nav />
          <main>{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
