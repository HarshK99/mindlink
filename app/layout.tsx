import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Mindlink - Thought Exploration",
  description: "Explore and organize your thoughts with hierarchical tree visualization. Create, connect, and navigate complex ideas with an intuitive mobile-first interface.",
  keywords: ["thought mapping", "mind mapping", "idea organization", "tree visualization", "knowledge management"],
  authors: [{ name: "Mindlink Team" }],
  creator: "Mindlink",
  publisher: "Mindlink",
  openGraph: {
    title: "Mindlink - Thought Exploration",
    description: "Explore and organize your thoughts with hierarchical tree visualization.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mindlink - Thought Exploration",
    description: "Explore and organize your thoughts with hierarchical tree visualization.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
