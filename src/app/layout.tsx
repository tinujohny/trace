import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./critical.css";
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
  title: "Trace",
  description: "Evaluation layer for AI answers — claim-level trust signals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-trace-bg text-trace-text`}
      >
        {children}
      </body>
    </html>
  );
}
