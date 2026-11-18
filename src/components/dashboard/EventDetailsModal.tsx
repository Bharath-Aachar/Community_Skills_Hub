"use client";

import Link from "next/link";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Globe,
  ExternalLink,
  Users,
  Ticket,
  Pencil,
  Sparkles,
  FileText,
} from "lucide-react";
import { Event, EventWithOrganizer, EventStatus } from "@/types/event";

interface EventDetailsModalProps {
  event: Event | EventWithOrganizer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  if (!isOpen || !event) return null;

  // Format date and time
  const formatDateTime = (startIso: string, endIso: string) => {
    try {
      const start = new Date(startIso);
      const end = new Date(endIso);

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      const dateStr = dateFormatter.format(start);
      const startTimeStr = timeFormatter.format(start);
      const endTimeStr = timeFormatter.format(end);

      return {
        dateStr,
        timeStr: `${startTimeStr} – ${endTimeStr}`,
      };
    } catch {
      return {
        dateStr: startIso.slice(0, 10),
        timeStr: `${startIso.slice(11, 16)} - ${endIso.slice(11, 16)}`,
      };
    }
  };

  const { dateStr, timeStr } = formatDateTime(event.start_at, event.end_at);

  const renderStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Published</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Draft</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Detect platform name for external URLs
  const getExternalPlatform = (url?: string | null) => {
    if (!url) return "External Platform";
    const lower = url.toLowerCase();
    if (lower.includes("unstop.com")) return "Unstop";
    if (lower.includes("lu.ma") || lower.includes("luma.com")) return "Luma";
    if (lower.includes("forms.gle") || lower.includes("docs.google.com/forms")) return "Google Forms";
    if (lower.includes("eventbrite.com")) return "Eventbrite";
    if (lower.includes("meetup.com")) return "Meetup";
    return "External Platform";
  };

  const organizerName =
    "organizer" in event && event.organizer?.full_name
      ? event.organizer.full_name
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#1E1242]/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-purple-100 shadow-2xl shadow-purple-950/25 my-8 overflow-hidden transform transition-all text-[#242136]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#64607D] hover:text-[#242136] hover:bg-white shadow-sm border border-purple-100/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF]"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster Section */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[2/1] bg-gradient-to-tr from-[#302063] via-[#4F2C99] to-[#7543DF] overflow-hidden">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Community Gathering
              </p>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#7543DF] border border-purple-100 shadow-xs">
              {event.category}
            </span>
            <div>{renderStatusBadge(event.status)}</div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[calc(85vh-200px)] overflow-y-auto">
          {/* Title & Organizer Info */}
          <div>
            <h2
              id="event-details-title"
              className="text-xl sm:text-2xl font-black text-[#242136] tracking-tight leading-tight"
            >
              {event.title}
            </h2>
            {organizerName && (
              <p className="text-xs text-[#64607D] mt-1">
                Hosted by <span className="font-semibold text-[#7543DF]">{organizerName}</span>
              </p>
            )}
          </div>

          {/* Schedule & Format Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Schedule */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8FE] border border-purple-100/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7543DF] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64607D]">
                  Date & Time
                </span>
                <p className="text-xs font-bold text-[#242136] mt-0.5 truncate">
                  {dateStr}
                </p>
                <p className="text-[11px] text-[#64607D] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#7543DF]" />
                  <span>{timeStr}</span>
                </p>
              </div>
            </div>

            {/* Venue & Format */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8FE] border border-purple-100/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7543DF] flex items-center justify-center shrink-0">
                {event.event_type === "online" && <Laptop className="w-4 h-4" />}
                {event.event_type === "offline" && <MapPin className="w-4 h-4" />}
                {event.event_type === "hybrid" && <Globe className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64607D]">
                  Format & Location
                </span>
                <p className="text-xs font-bold text-[#242136] capitalize mt-0.5">
                  {event.event_type} Gathering
                </p>
                {event.location && (
                  <p className="text-[11px] text-[#64607D] truncate mt-0.5">
                    {event.location}
                  </p>
                )}
                {event.online_meeting_url && (
                  <a
                    href={event.online_meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7543DF] hover:underline mt-0.5 truncate max-w-full"
                  >
                    <span>Meeting link</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#302063] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#7543DF]" />
                <span>About this Gathering</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#64607D] leading-relaxed whitespace-pre-wrap bg-[#FAF8FE]/50 p-4 rounded-2xl border border-purple-50">
                {event.description}
              </p>
            </div>
          )}

          {/* Dedicated Registration Section */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#FAF8FE] to-[#F4F0FF]/60 border border-purple-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#7543DF]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#302063]">
                  Registration & RSVPs
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#7543DF] border border-purple-200 uppercase">
                {event.registration_type}
              </span>
            </div>

            {event.registration_type === "external" ? (
              <div className="space-y-3">
                <p className="text-xs text-[#64607D]">
                  Attendees RSVP through a dedicated platform (
                  <span className="font-semibold text-[#242136]">
                    {getExternalPlatform(event.registration_url)}
                  </span>
                  ). Click below to access or verify the live registration portal.
                </p>

                {event.registration_url ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <span className="text-xs font-mono text-[#64607D] bg-white px-3 py-1.5 rounded-xl border border-purple-100 truncate max-w-sm">
                      {event.registration_url}
                    </span>
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all shadow-md shadow-[#7543DF]/20 active:scale-95"
                    >
                      <span>Register Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    No external registration URL provided yet.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#64607D]">
                    Participants register natively through the Community Skills Hub platform.
                  </p>
                  {event.capacity && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7543DF] bg-white px-2.5 py-1 rounded-full border border-purple-100 shrink-0">
                      <Users className="w-3 h-3" />
                      <span>{event.capacity} seats limit</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-purple-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7543DF]" />
                    <span className="text-xs font-bold text-[#242136]">
                      1-Click Community RSVP Preview
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#7543DF]/70 cursor-not-allowed opacity-90"
                  >
                    <span>Join Event</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#64607D] italic">
                  Note: Participant RSVP handling and attendee roster management will unlock in Stage 4.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF8FE] border-t border-purple-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#64607D]">
            Last updated {new Date(event.updated_at).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/admin/events/${event.id}/edit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all shadow-xs active:scale-95"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit Event</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#64607D] bg-white border border-purple-100 hover:bg-[#F4F0FF] hover:text-[#242136] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
