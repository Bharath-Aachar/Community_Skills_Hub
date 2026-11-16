import { AlertTriangle, RefreshCw } from "lucide-react";

interface DashboardErrorStateProps {
  message?: string;
}

export default function DashboardErrorState({
  message = "Failed to load organizer events.",
}: DashboardErrorStateProps) {
  return (
    <div className="w-full bg-white rounded-3xl border border-red-100 p-8 sm:p-12 text-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-[#242136] mb-2">
        Unable to load events
      </h3>
      <p className="text-xs sm:text-sm text-[#64607D] max-w-md mx-auto mb-6">
        {message}
      </p>

      <a
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reload Dashboard</span>
      </a>
    </div>
  );
}
