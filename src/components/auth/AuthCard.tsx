import { ReactNode } from "react";
import Logo from "@/components/Logo";

interface AuthCardProps {
  badge?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  organizerBadge?: boolean;
}

export default function AuthCard({
  badge,
  title,
  subtitle,
  children,
  footer,
  organizerBadge = false,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xl shadow-purple-950/5 animate-fade-in text-left">
      {/* Top Header & Branding */}
      <div className="flex flex-col items-center text-center mb-6">
        <Logo />

        {badge && (
          <span
            className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
              organizerBadge
                ? "bg-[#302063] text-white border-purple-900"
                : "bg-[#F4F0FF] text-[#7543DF] border-purple-100"
            }`}
          >
            {badge}
          </span>
        )}

        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#242136] tracking-tight">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-[#64607D] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Main Form Area */}
      <div>{children}</div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="mt-6 pt-5 border-t border-purple-50 text-center text-sm text-[#64607D]">
          {footer}
        </div>
      )}
    </div>
  );
}
