import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
  showText?: boolean;
}

export default function Logo({
  variant = "dark",
  className = "",
  showText = true,
}: LogoProps) {
  const isDarkVariant = variant === "dark";

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF] rounded-md ${className}`}
      aria-label="Community Skills Hub Home"
    >
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#302063] via-[#5C33BF] to-[#7543DF] shadow-md shadow-[#7543DF]/20 text-white">
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3-8 4.5 8 4.5 8-4.5L12 3Z" />
          <path d="M4 11.5v4L12 20l8-4.5v-4" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <span
          className={`text-lg sm:text-xl font-bold tracking-tight ${
            isDarkVariant ? "text-[#242136]" : "text-white"
          }`}
        >
          Community <span className="text-[#7543DF]">Skills</span> Hub
        </span>
      )}
    </Link>
  );
}
