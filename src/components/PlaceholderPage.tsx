import Link from "next/link";
import { ArrowLeft, Clock, LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PlaceholderPageProps {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  targetRole?: string;
  expectedFeatures?: string[];
}

export default function PlaceholderPage({
  badge,
  title,
  subtitle,
  description,
  icon: Icon,
  targetRole,
  expectedFeatures = [],
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FE]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 sm:p-10 border border-purple-100 shadow-xl shadow-purple-950/5 text-center animate-fade-in">
          {/* Top Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F4F0FF] text-[#7543DF] border border-purple-100 mb-6">
            <Clock className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          {/* Main Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#302063] to-[#7543DF] text-white flex items-center justify-center shadow-md shadow-[#7543DF]/20 mb-6">
            <Icon className="w-8 h-8" />
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242136] tracking-tight">
            {title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#7543DF]">{subtitle}</p>

          <p className="mt-4 text-sm sm:text-base text-[#64607D] leading-relaxed">
            {description}
          </p>

          {/* Planned Features List */}
          {expectedFeatures.length > 0 && (
            <div className="mt-6 pt-6 border-t border-purple-50 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#242136] mb-3">
                {targetRole ? `Upcoming Features for ${targetRole}:` : "Upcoming Capabilities:"}
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#4E4A67]">
                {expectedFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7543DF] mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Back Action */}
          <div className="mt-8 pt-6 border-t border-purple-50">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-xl shadow-sm hover:shadow transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Welcome Page</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
