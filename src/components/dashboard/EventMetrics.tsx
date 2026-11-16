import {
  CalendarDays,
  Globe,
  FileEdit,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export interface EventMetricsData {
  total: number;
  published: number;
  draft: number;
  completed: number;
}

interface EventMetricsProps {
  metrics: EventMetricsData;
  onFilterClick?: (status: "all" | "published" | "draft" | "completed") => void;
  activeFilter?: string;
}

export default function EventMetrics({
  metrics,
  onFilterClick,
  activeFilter = "all",
}: EventMetricsProps) {
  const cards = [
    {
      id: "all" as const,
      label: "Total Events",
      count: metrics.total,
      sublabel: "All-time created by you",
      icon: <CalendarDays className="w-5 h-5 text-[#302063]" />,
      accentBg: "bg-[#F4F0FF]",
      borderHover: "hover:border-[#7543DF]/50",
      numberColor: "text-[#242136]",
      tag: "Organizer Scope",
      tagColor: "bg-purple-100 text-[#302063]",
    },
    {
      id: "published" as const,
      label: "Published & Live",
      count: metrics.published,
      sublabel: "Discoverable by community",
      icon: <Globe className="w-5 h-5 text-emerald-600" />,
      accentBg: "bg-emerald-50",
      borderHover: "hover:border-emerald-300",
      numberColor: "text-emerald-700",
      tag: "Public Catalog",
      tagColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "draft" as const,
      label: "Draft Events",
      count: metrics.draft,
      sublabel: "Unpublished workshops",
      icon: <FileEdit className="w-5 h-5 text-amber-600" />,
      accentBg: "bg-amber-50",
      borderHover: "hover:border-amber-300",
      numberColor: "text-amber-800",
      tag: "Work in Progress",
      tagColor: "bg-amber-100 text-amber-900",
    },
    {
      id: "completed" as const,
      label: "Completed",
      count: metrics.completed,
      sublabel: "Concluded gatherings",
      icon: <CheckCircle2 className="w-5 h-5 text-[#7543DF]" />,
      accentBg: "bg-[#FAF8FE]",
      borderHover: "hover:border-purple-300",
      numberColor: "text-[#302063]",
      tag: "Archived Sessions",
      tagColor: "bg-purple-100 text-[#7543DF]",
    },
  ];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#242136] tracking-tight">
            Event Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#64607D]">
            Live metrics calculated directly from your Supabase event records.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F0FF] text-[#7543DF] border border-purple-100 self-start sm:self-auto">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time DB Sync</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card) => {
          const isActive = activeFilter === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onFilterClick?.(card.id)}
              className={`group text-left p-5 sm:p-6 rounded-3xl bg-white border transition-all duration-200 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF] ${
                isActive
                  ? "border-[#7543DF] shadow-md shadow-[#7543DF]/10 ring-1 ring-[#7543DF]/20"
                  : `border-purple-100/90 hover:shadow-lg hover:shadow-purple-950/5 ${card.borderHover}`
              }`}
            >
              {/* Top Accent Icon & Tag */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.accentBg} transition-transform group-hover:scale-105 duration-200`}
                >
                  {card.icon}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${card.tagColor}`}
                >
                  {card.tag}
                </span>
              </div>

              {/* Metric Count with Expressive Typography */}
              <div className="space-y-1">
                <span
                  className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${card.numberColor}`}
                >
                  {card.count}
                </span>
                <h3 className="text-sm font-bold text-[#242136]">
                  {card.label}
                </h3>
                <p className="text-xs text-[#64607D]">
                  {card.sublabel}
                </p>
              </div>

              {/* Bottom active pill strip indicator */}
              {isActive && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-[#7543DF]" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
