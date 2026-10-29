import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Navigation from "@/components/Navigation"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Research OS - Equity Research Operating System",
  description: "End-to-end equity research platform: Idea Generation → Deep Dive → Weigh Decisions → Track → Harvest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navigation>{children}</Navigation>
      </body>
    </html>
  )
}
