import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LenisProvider from "@/components/ui/LenisProvider";
import Nav from "@/components/ui/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Praneeth Annapureddy",
  description:
    "Quantitative models, companies, and tools for people locked out of the systems that could help them.",
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
