import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://projectdecode.example"),
  title: {
    default: "Project Decode — decoding the world, one story at a time",
    template: "%s · Project Decode",
  },
  description:
    "Project Decode turns the world's news into something you can actually follow. Touch the globe, pick a place, and see what's happening there right now.",
  openGraph: {
    title: "Project Decode",
    description:
      "Touch the globe. Pick a place. Understand what's happening there.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
