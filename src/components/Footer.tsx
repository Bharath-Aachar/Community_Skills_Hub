import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-purple-100/80 text-[#242136]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Branding & Description */}
          <div className="md:col-span-2 space-y-4">
            <Logo />
            <p className="text-sm sm:text-base text-[#64607D] leading-relaxed max-w-md">
              Community Skills Hub is a centralized platform for discovering,
              sharing, registering for, and tracking community events, workshops,
              hackathons, and skill-building opportunities.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#242136]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Roles & Portals */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#242136]">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/explore"
                  className="text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  Participant Experience
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  Organizer Experience
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 pt-8 border-t border-purple-50 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64607D] gap-4">
          <p>© {currentYear} Community Skills Hub. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="text-purple-400">Discover</span>
            <span className="text-purple-300">•</span>
            <span className="text-purple-400">Learn</span>
            <span className="text-purple-300">•</span>
            <span className="text-purple-400">Connect</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
