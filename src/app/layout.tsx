import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Skills Hub | Discover • Learn • Connect",
  description:
    "A centralized platform for discovering, sharing, registering for, and tracking community events, workshops, hackathons, bootcamps, and skill-building opportunities.",
  keywords: [
    "Community",
    "Skills Hub",
    "Events",
    "Workshops",
    "Hackathons",
    "Bootcamps",
    "Learning",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans bg-white text-[#242136] selection:bg-[#7543DF] selection:text-white">
        {children}
      </body>
    </html>
  );
}
