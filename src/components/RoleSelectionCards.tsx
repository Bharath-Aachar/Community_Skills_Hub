"use client";

import Link from "next/link";
import { Users, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RoleSelectionCards() {
  return (
    <div className="w-full max-w-4xl mx-auto mt-10 sm:mt-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* Card 1 — Participant */}
        <Link
          href="/explore"
          className="group relative flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-8 border border-purple-100/90 shadow-xl shadow-purple-950/10 hover:shadow-2xl hover:shadow-[#7543DF]/20 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7543DF]/40 text-left cursor-pointer"
          aria-label="Continue as Participant - Explore opportunities, register for events, and track your journey."
        >
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#7543DF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

          <div>
            {/* Header: Icon & Role Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-[#F4F0FF] text-[#7543DF] flex items-center justify-center group-hover:bg-[#7543DF] group-hover:text-white group-hover:rotate-3 transition-all duration-300 shadow-xs">
                <Users className="w-6 h-6 transition-colors duration-300" />
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F0FF] text-[#7543DF] border border-purple-100">
                Learner Portal
              </span>
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-[#242136] group-hover:text-[#7543DF] transition-colors duration-200">
              I&apos;m a Participant
            </h2>
            <p className="mt-2 text-[#64607D] text-sm sm:text-base leading-relaxed">
              Explore opportunities, register for events, and track your journey.
            </p>

            {/* Key benefits list */}
            <ul className="mt-5 space-y-2 text-xs sm:text-sm text-[#4E4A67]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7543DF] shrink-0" />
                <span>Discover workshops, bootcamps & hackathons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7543DF] shrink-0" />
                <span>Save events and receive reminder updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7543DF] shrink-0" />
                <span>Track skills and participation history</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-7 pt-4 border-t border-purple-50">
            <span className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#7543DF] group-hover:bg-[#6332C9] rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200">
              <span>Continue as Participant</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </Link>

        {/* Card 2 — Admin / Organizer */}
        <Link
          href="/admin/login"
          className="group relative flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-8 border border-purple-100/90 shadow-xl shadow-purple-950/10 hover:shadow-2xl hover:shadow-[#7543DF]/20 hover:-translate-y-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7543DF]/40 text-left cursor-pointer"
          aria-label="Continue as Organizer - Create events, manage participants, and organize community workshops."
        >
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#302063] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

          <div>
            {/* Header: Icon & Role Badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-2xl bg-[#F4F0FF] text-[#302063] flex items-center justify-center group-hover:bg-[#302063] group-hover:text-white group-hover:rotate-3 transition-all duration-300 shadow-xs">
                <ShieldCheck className="w-6 h-6 transition-colors duration-300" />
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F0FF] text-[#302063] border border-purple-100">
                Organizer Portal
              </span>
            </div>

            {/* Title & Description */}
            <h2 className="text-2xl font-bold text-[#242136] group-hover:text-[#302063] transition-colors duration-200">
              I&apos;m an Organizer
            </h2>
            <p className="mt-2 text-[#64607D] text-sm sm:text-base leading-relaxed">
              Create events, manage participants, and organize community workshops.
            </p>

            {/* Key benefits list */}
            <ul className="mt-5 space-y-2 text-xs sm:text-sm text-[#4E4A67]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#302063] shrink-0" />
                <span>Publish and edit community workshops</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#302063] shrink-0" />
                <span>Manage registrations and attendance lists</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#302063] shrink-0" />
                <span>Broadcast updates and measure event reach</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-7 pt-4 border-t border-purple-50">
            <span className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm sm:text-base font-semibold text-[#302063] bg-[#F4F0FF] group-hover:bg-[#302063] group-hover:text-white rounded-xl border border-purple-200/80 group-hover:border-transparent shadow-xs group-hover:shadow-md transition-all duration-200">
              <span>Continue as Organizer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
