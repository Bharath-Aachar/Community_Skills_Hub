"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-purple-50 shadow-xs transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center space-x-8"
          >
            <Link
              href="/"
              className="text-[#242136] hover:text-[#7543DF] text-sm font-semibold transition-colors duration-150 py-1"
            >
              Home
            </Link>
            <Link
              href="/#about"
              className="text-[#64607D] hover:text-[#7543DF] text-sm font-semibold transition-colors duration-150 py-1"
            >
              About
            </Link>
          </nav>

          {/* Right: Auth Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-[#242136] hover:text-[#7543DF] px-3.5 py-2 text-sm font-semibold transition-colors duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF]"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7543DF]"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#242136] hover:text-[#7543DF] hover:bg-[#F4F0FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF] transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-50 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-semibold text-[#242136] hover:bg-[#F4F0FF] hover:text-[#7543DF] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-base font-semibold text-[#64607D] hover:bg-[#F4F0FF] hover:text-[#7543DF] transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-[#242136] hover:text-[#7543DF] rounded-lg border border-gray-200 hover:border-[#7543DF] transition-all"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-lg shadow-sm transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
