"use client";

import { X, Sparkles, CalendarPlus, Users, Pencil } from "lucide-react";

export type ModalType = "create" | "edit" | "participants" | null;

interface PlaceholderModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
}

export default function PlaceholderModal({
  type,
  isOpen,
  onClose,
  eventTitle,
}: PlaceholderModalProps) {
  if (!isOpen || !type) return null;

  const contentMap = {
    create: {
      title: "Event Creation Studio",
      subtitle: "Stage 3 • Task 3 Feature Preview",
      icon: <CalendarPlus className="w-6 h-6 text-[#7543DF]" />,
      badge: "Upcoming Milestone",
      badgeColor: "bg-[#F4F0FF] text-[#7543DF] border-purple-200",
      description:
        "The multi-step event creation wizard (with venue selection, ticketing, capacity controls, and cover art uploads) is scheduled for the upcoming release. All database models, validation rules, and backend operations are already active in the backend.",
      highlights: [
        "Rich workshop details & ISO date bounds",
        "Online, offline, or hybrid venue configurations",
        "Capacity bounds & external ticketing integrations",
      ],
    },
    edit: {
      title: "Event Editor",
      subtitle: eventTitle ? `Editing "${eventTitle}"` : "Event Management Studio",
      icon: <Pencil className="w-6 h-6 text-[#7543DF]" />,
      badge: "Stage 3 • Task 3",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      description:
        "Direct event editing, status changes (draft ⇄ published ⇄ completed), and schedule updates will be interactive in the next stage. The backend updateEvent operation is already implemented and verified.",
      highlights: [
        "Instant title & schedule amendments",
        "Publishing & unpublishing toggles",
        "Capacity & meeting link updates",
      ],
    },
    participants: {
      title: "Community & Attendee Roster",
      subtitle: "Stage 4 • Community Features",
      icon: <Users className="w-6 h-6 text-[#7543DF]" />,
      badge: "Phase 4 Feature",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description:
        "Participant management, RSVP approvals, attendee analytics, and post-session feedback collection are part of Phase 4 (Registration & Attendee Experience).",
      highlights: [
        "Live check-in & attendee lists",
        "Participant skill tracking & matching",
        "Direct workshop announcements",
      ],
    },
  };

  const item = contentMap[type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1242]/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-2xl shadow-purple-950/20 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#64607D] hover:text-[#242136] hover:bg-[#F4F0FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] border border-purple-100 flex items-center justify-center shrink-0">
            {item.icon}
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${item.badgeColor} mb-1.5`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{item.badge}</span>
            </span>
            <h3
              id="modal-title"
              className="text-xl sm:text-2xl font-black text-[#242136] tracking-tight"
            >
              {item.title}
            </h3>
            <p className="text-xs text-[#64607D] font-medium mt-0.5">
              {item.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#64607D] leading-relaxed mb-5">
          {item.description}
        </p>

        {/* Highlights */}
        <div className="bg-[#FAF8FE] rounded-2xl p-4 border border-purple-50 mb-6 space-y-2">
          <p className="text-xs font-bold text-[#302063] uppercase tracking-wider">
            Capabilities In Development
          </p>
          <ul className="space-y-1.5">
            {item.highlights.map((h, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-[#242136] font-medium"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#7543DF]" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all duration-200 active:scale-95 shadow-md shadow-[#7543DF]/20"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
