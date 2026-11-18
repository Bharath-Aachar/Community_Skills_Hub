"use client";

import Link from "next/link";
import {
  Sparkles,
  Plus,
  ArrowDown,
  Calendar,
  Users,
  Radio,
  MapPin,
  Laptop,
  Flame,
} from "lucide-react";
interface DashboardHeroProps {
  userName: string;
}

export default function DashboardHero({
  userName,
}: DashboardHeroProps) {
  // Use first name or fallback to "Organizer"
  const firstName = userName ? userName.split(" ")[0] : "Organizer";

  return (
    <section
      id="overview"
      className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#302063] via-[#3C2278] to-[#5C33BF] text-white shadow-xl shadow-purple-950/15 border border-purple-800/40"
    >
      {/* Ambient background glow and decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#7543DF]/40 rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#9764F6]/30 rounded-full blur-[120px]" />

        {/* Subtle decorative editorial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Expressive Copy & CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Greeting Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Organizer Studio • Welcome back, {firstName}</span>
            </div>

            {/* Expressive Editorial Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08]">
              Let&apos;s bring people{" "}
              <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
                together.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base md:text-lg text-purple-100/90 max-w-xl font-normal leading-relaxed">
              Curate memorable workshops, mentor emerging skills, and track your
              community reach in real time. Your next gathering starts here.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/admin/events/create"
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold text-[#302063] bg-white hover:bg-purple-50 transition-all duration-200 active:scale-95 shadow-lg shadow-black/10 hover:shadow-xl"
              >
                <div className="w-6 h-6 rounded-full bg-[#7543DF] text-white flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Create an Event</span>
              </Link>

              <a
                href="#my-events"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all"
              >
                <span>View My Events</span>
                <ArrowDown className="w-4 h-4 text-purple-300" />
              </a>
            </div>
          </div>

          {/* Right Column: LoftyLab-Inspired 2D Animated Community Composition */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-4 lg:py-0">
            {/* Background Aura */}
            <div className="relative w-full max-w-sm sm:max-w-md aspect-square flex items-center justify-center">
              {/* Concentric subtle rings */}
              <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-pulse-glow" />
              <div className="absolute inset-8 rounded-full border border-purple-300/15" />
              <div className="absolute inset-16 rounded-full border border-purple-200/10" />

              {/* Central Floating 2D Event Pass Card */}
              <div className="relative z-20 w-64 sm:w-72 bg-white/95 text-[#242136] rounded-3xl p-5 shadow-2xl shadow-purple-950/40 border border-purple-100 backdrop-blur-xl animate-float">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4F0FF] text-[#7543DF]">
                    <Flame className="w-3 h-3 text-[#7543DF]" />
                    <span>Live Workshop</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span>Active RSVP</span>
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-[#242136] leading-snug mb-1">
                  Creative Community Sprint
                </h4>
                <p className="text-[11px] text-[#64607D] mb-3">
                  Interactive Skills & Mentorship
                </p>

                {/* Micro Details Grid */}
                <div className="bg-[#FAF8FE] rounded-xl p-2.5 space-y-1.5 border border-purple-50 text-[11px]">
                  <div className="flex items-center gap-2 text-[#242136]">
                    <Calendar className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span className="font-semibold">Saturday • 10:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64607D]">
                    <Laptop className="w-3.5 h-3.5 text-[#7543DF]" />
                    <span>Hybrid (Lab 301 & Google Meet)</span>
                  </div>
                </div>

                {/* Attendee Cluster & Waveform */}
                <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between">
                  <div className="flex items-center -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#302063]">
                      AK
                    </div>
                    <div className="w-6 h-6 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#302063]">
                      SR
                    </div>
                    <div className="w-6 h-6 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-[#302063]">
                      +18
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#7543DF]">
                    <Users className="w-3 h-3" />
                    <span>24 Joined</span>
                  </div>
                </div>
              </div>

              {/* Floating Satellite Chip 1 (Top-Right): Broadcast / Live */}
              <div className="absolute top-2 -right-2 sm:right-2 z-30 bg-[#302063]/90 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg border border-purple-400/30 backdrop-blur-md flex items-center gap-2 animate-float-delayed">
                <Radio className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                <span>Mentorship Studio</span>
              </div>

              {/* Floating Satellite Chip 2 (Bottom-Left): Community Venue */}
              <div className="absolute -bottom-2 -left-2 sm:left-2 z-30 bg-white text-[#242136] rounded-full px-3.5 py-1.5 text-xs font-bold shadow-xl border border-purple-100 flex items-center gap-2 animate-float">
                <MapPin className="w-3.5 h-3.5 text-[#7543DF]" />
                <span>Hub Stage • Tech &amp; Design</span>
              </div>

              {/* Decorative Rotating Accent Star */}
              <div className="absolute -top-4 left-6 z-10 text-purple-300/40 animate-spin-slow">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
