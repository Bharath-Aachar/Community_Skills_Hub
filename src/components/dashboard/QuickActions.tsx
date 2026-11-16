import { Plus, ListFilter, FileEdit, Users, ArrowUpRight } from "lucide-react";
import { ModalType } from "./PlaceholderModal";

interface QuickActionsProps {
  onOpenModal: (type: ModalType) => void;
  onFilterChange: (status: "all" | "published" | "draft" | "completed") => void;
}

export default function QuickActions({
  onOpenModal,
  onFilterChange,
}: QuickActionsProps) {
  const actions = [
    {
      title: "Create an Event",
      description: "Launch a new workshop or community meetup",
      icon: <Plus className="w-5 h-5 text-white" />,
      iconBg: "bg-[#7543DF]",
      badge: "Stage 3",
      badgeColor: "bg-purple-100 text-[#7543DF]",
      action: () => onOpenModal("create"),
      isPrimary: true,
    },
    {
      title: "View All Events",
      description: "Inspect the complete roster of your scheduled gatherings",
      icon: <ListFilter className="w-5 h-5 text-[#302063]" />,
      iconBg: "bg-[#F4F0FF]",
      badge: "Live View",
      badgeColor: "bg-purple-50 text-[#302063]",
      action: () => {
        onFilterChange("all");
        const el = document.getElementById("my-events");
        el?.scrollIntoView({ behavior: "smooth" });
      },
      isPrimary: false,
    },
    {
      title: "Manage Drafts",
      description: "Review and refine unpublished events in progress",
      icon: <FileEdit className="w-5 h-5 text-amber-700" />,
      iconBg: "bg-amber-100",
      badge: "Drafts",
      badgeColor: "bg-amber-50 text-amber-800",
      action: () => {
        onFilterChange("draft");
        const el = document.getElementById("my-events");
        el?.scrollIntoView({ behavior: "smooth" });
      },
      isPrimary: false,
    },
    {
      title: "Participant Roster",
      description: "Manage registrations, attendee check-ins, and RSVPs",
      icon: <Users className="w-5 h-5 text-[#64607D]" />,
      iconBg: "bg-gray-100",
      badge: "Phase 4",
      badgeColor: "bg-gray-100 text-gray-600",
      action: () => onOpenModal("participants"),
      isPrimary: false,
      isPlaceholder: true,
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-[#242136] tracking-tight">
          Quick Actions
        </h2>
        <span className="text-xs text-[#64607D]">
          Organizer Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={item.action}
            className={`group text-left p-5 rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF] ${
              item.isPrimary
                ? "bg-gradient-to-br from-white to-[#F4F0FF]/50 border-purple-200 hover:border-[#7543DF] hover:shadow-lg hover:shadow-purple-950/5"
                : "bg-white border-purple-100 hover:border-purple-300 hover:shadow-md"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.iconBg} shadow-xs group-hover:scale-105 transition-transform duration-200`}
                >
                  {item.icon}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#64607D] group-hover:text-[#7543DF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#242136] group-hover:text-[#7543DF] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#64607D] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
