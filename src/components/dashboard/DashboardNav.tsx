"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  CalendarDays,
  Plus,
  Users,
  LogOut,
  Menu,
  X,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import { ModalType } from "./PlaceholderModal";

interface DashboardNavProps {
  userName: string;
  userEmail: string;
  roles: string[];
  onOpenModal: (type: ModalType) => void;
  activeSection?: string;
}

export default function DashboardNav({
  userName,
  userEmail,
  roles,
  onOpenModal,
}: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract initials for the avatar badge
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : userEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      {/* Floating Modern Pill Header */}
      <div className="bg-white/90 backdrop-blur-xl border border-purple-100/90 rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-purple-950/5 flex items-center justify-between transition-all">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#302063] text-white">
            <ShieldCheck className="w-3 h-3 text-purple-300" />
            <span>STUDIO</span>
          </span>
        </div>

        {/* Center: Editorial Pill Nav (Desktop) */}
        <nav
          aria-label="Organizer Studio Navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 bg-[#FAF8FE] p-1.5 rounded-full border border-purple-50"
        >
          <a
            href="#overview"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#7543DF] bg-white shadow-xs transition-all"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Overview</span>
          </a>

          <a
            href="#my-events"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#64607D] hover:text-[#7543DF] hover:bg-white/70 transition-all"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>My Events</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenModal("create")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#242136] hover:text-[#7543DF] hover:bg-white/70 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#7543DF]" />
            <span>Create Event</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenModal("participants")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#64607D] hover:text-[#242136] hover:bg-white/70 transition-all group"
          >
            <Users className="w-3.5 h-3.5 text-[#64607D] group-hover:text-[#7543DF]" />
            <span>Participants</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-[#7543DF]">
              Soon
            </span>
          </button>
        </nav>

        {/* Right: Organizer Profile & Signout Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Profile Capsule */}
          <div className="flex items-center gap-2.5 pl-3 pr-2 py-1 bg-[#FAF8FE] border border-purple-50 rounded-full">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#302063] to-[#7543DF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {initials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-[#242136] leading-none truncate max-w-[120px]">
                {userName || "Organizer"}
              </p>
              <p className="text-[10px] text-[#64607D] leading-none mt-0.5">
                {roles.includes("admin") ? "Admin" : "Verified Organizer"}
              </p>
            </div>
          </div>

          {/* Sign Out Action */}
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-purple-200 text-xs font-semibold text-[#64607D] hover:text-[#7543DF] hover:bg-[#F4F0FF] transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF]"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#302063] to-[#7543DF] text-white flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#242136] hover:text-[#7543DF] hover:bg-[#F4F0FF] transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white rounded-2xl border border-purple-100 p-4 shadow-xl shadow-purple-950/10 space-y-3 animate-fade-in">
          <div className="flex items-center gap-3 pb-3 border-b border-purple-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#302063] to-[#7543DF] text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-[#242136]">{userName || "Organizer"}</p>
              <p className="text-xs text-[#64607D]">{userEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-[#7543DF] bg-[#F4F0FF]"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Overview</span>
            </a>
            <a
              href="#my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-[#242136] hover:bg-[#F4F0FF]"
            >
              <CalendarDays className="w-4 h-4" />
              <span>My Events</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenModal("create");
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-[#242136] hover:bg-[#F4F0FF] text-left"
            >
              <Plus className="w-4 h-4 text-[#7543DF]" />
              <span>Create Event</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenModal("participants");
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-[#64607D] hover:bg-[#F4F0FF] text-left"
            >
              <Users className="w-4 h-4" />
              <span>Participants</span>
            </button>
          </div>

          <div className="pt-2 border-t border-purple-50 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-medium text-[#64607D] hover:text-[#7543DF]"
            >
              Back to Home
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
