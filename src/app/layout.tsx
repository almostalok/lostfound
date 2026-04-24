import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SmoothScrolling } from "@/components/SmoothScrolling";
import { AuthNav } from "@/components/AuthNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lost&Found | Premium AI-Powered Lost & Found",
  description: "Advanced AI matching system for lost and found items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-[#0a0a0a] text-white`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#0a0a0a] text-white">
        <SmoothScrolling>
          <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
              <Link href="/" className="text-xl font-medium tracking-tighter text-white hover:text-white/80 transition-colors">
                Lost<span className="text-neutral-500">&Found</span>
              </Link>
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
                <Link href="/browse" className="text-neutral-400 hover:text-white transition-colors">Browse</Link>
                <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/report-lost" className="text-neutral-400 hover:text-white transition-colors">Report Lost</Link>
                <Link href="/report-found" className="text-neutral-400 hover:text-white transition-colors">Report Found</Link>
                <Link href="/messages" className="text-neutral-400 hover:text-white transition-colors">Messages</Link>
              </nav>
              <AuthNav />
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-7xl px-6 pt-32 pb-16">

            {children}
          </main>
        </SmoothScrolling>
      </body>
    </html>
  );
}
