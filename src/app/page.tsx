import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Section A: Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* Section B & C: Hero & Choose Your Role */}
        <HeroSection />

        {/* Section D: About the Platform */}
        <AboutSection />
      </main>

      {/* Section E: Footer */}
      <Footer />
    </div>
  );
}
