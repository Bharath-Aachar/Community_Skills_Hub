import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About | Community Skills Hub",
  description: "Learn more about the mission and features of Community Skills Hub.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
