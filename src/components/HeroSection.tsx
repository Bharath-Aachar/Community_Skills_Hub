import RoleSelectionCards from "./RoleSelectionCards";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#302063] text-white pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28">
      {/* Background Layer: Atmospheric Community & Event Lighting with Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Deep ambient radial glow orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[500px] bg-[#7543DF]/35 blur-[120px] rounded-full animate-pulse-glow" />
        <div className="absolute top-1/3 -left-40 w-[480px] h-[480px] bg-[#5324AA]/40 blur-[130px] rounded-full" />
        <div className="absolute top-1/4 -right-40 w-[480px] h-[480px] bg-[#7543DF]/30 blur-[130px] rounded-full" />

        {/* Ambient Stage & Crowd Silhouette Silhouette Graphic */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-80 sm:h-96 md:h-[460px] opacity-25 object-cover mix-blend-screen"
          viewBox="0 0 1440 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="stageGlow" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#A881FC" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#7543DF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#302063" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamL" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7543DF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beamR" x1="100%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7543DF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Stage Lighting Beams */}
          <polygon points="120,0 280,0 720,340 560,340" fill="url(#beamL)" />
          <polygon points="1320,0 1160,0 720,340 880,340" fill="url(#beamR)" />
          <circle cx="720" cy="180" r="320" fill="url(#stageGlow)" />

          {/* Stylized Audience / Community Crowd Silhouette */}
          <path
            d="M0 400C40 375 70 380 110 365C135 355 160 370 190 355C225 340 250 360 280 345C310 330 340 350 375 338C405 328 435 342 470 330C510 315 540 335 580 325C620 315 650 330 690 320C730 310 760 325 800 315C840 305 870 325 910 318C950 310 980 330 1020 322C1060 315 1090 335 1130 325C1170 315 1200 330 1240 320C1280 310 1310 335 1350 328C1390 320 1415 340 1440 330V400H0Z"
            fill="#1E1242"
          />
          <path
            d="M0 400C50 385 85 390 130 380C165 372 195 385 235 375C275 365 305 380 345 370C385 360 415 375 455 365C495 355 525 370 565 360C605 350 635 365 675 358C715 350 745 365 785 358C825 350 855 368 895 360C935 352 965 370 1005 362C1045 355 1075 372 1115 365C1155 358 1185 372 1225 365C1265 358 1295 375 1335 368C1375 360 1405 375 1440 365V400H0Z"
            fill="#150C30"
          />
        </svg>

        {/* Gradient Overlay for Crisp Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#302063]/90 via-[#302063]/80 to-[#231548]/95" />
      </div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Introductory Tag / Line */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase text-purple-200 bg-white/10 backdrop-blur-md border border-white/15 shadow-inner mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>DISCOVER • LEARN • CONNECT</span>
        </div>

        {/* Main Headline */}
        <h1 className="animate-fade-in-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.12] text-center max-w-4xl drop-shadow-sm">
          Every Opportunity.{" "}
          <span className="bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
            One Place.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="animate-fade-in-delay-2 text-base sm:text-lg md:text-xl text-purple-100/90 max-w-2xl mx-auto text-center font-normal leading-relaxed mt-5 sm:mt-6">
          Discover workshops, explore events, connect with communities, and
          manage your learning journey — all in one place.
        </p>

        {/* Section C: Choose Your Role Interaction */}
        <div className="w-full animate-fade-in-delay-2">
          <div className="mt-6 text-center">
            <span className="text-xs uppercase tracking-widest font-semibold text-purple-200/80 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              Select Your Experience
            </span>
          </div>
          <RoleSelectionCards />
        </div>
      </div>
    </section>
  );
}
