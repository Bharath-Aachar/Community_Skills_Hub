"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Event, EventStatus } from "@/types/event";
import {
  Calendar,
  Clock,
  MapPin,
  Laptop,
  Globe,
  Pencil,
  Search,
  Plus,
  Sparkles,
  Ticket,
  Users,
  ExternalLink,
  Eye,
} from "lucide-react";
import { ModalType } from "./PlaceholderModal";
import EventDetailsModal from "./EventDetailsModal";

interface RecentEventsProps {
  events: Event[];
  onOpenModal?: (type: ModalType, eventTitle?: string) => void;
  activeFilter?: string;
  onFilterChange?: (status: "all" | "published" | "draft" | "completed") => void;
}

export default function RecentEvents({
  events,
  activeFilter = "all",
  onFilterChange,
}: RecentEventsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<Event | null>(null);

  // Filter events based on active tab and search query
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Status filter
      if (activeFilter !== "all" && e.status !== activeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesCategory = e.category.toLowerCase().includes(q);
        const matchesDesc = (e.description || "").toLowerCase().includes(q);
        return matchesTitle || matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [events, activeFilter, searchQuery]);

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

      return `${dateStr} • ${startTimeStr} – ${endTimeStr}`;
    } catch {
      return `${startIso.slice(0, 10)} to ${endIso.slice(0, 10)}`;
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: EventStatus) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Published</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Draft</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8FE] text-[#302063] border border-purple-100">
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Event Type Icon & Label Helper
  const renderEventType = (type: string, location: string | null) => {
    switch (type) {
      case "online":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64607D]">
            <Laptop className="w-3.5 h-3.5 text-[#7543DF]" />
            <span>Online Session</span>
          </span>
        );
      case "offline":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64607D]">
            <MapPin className="w-3.5 h-3.5 text-[#7543DF]" />
            <span className="truncate max-w-[200px]">{location || "In-Person Venue"}</span>
          </span>
        );
      case "hybrid":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64607D]">
            <Globe className="w-3.5 h-3.5 text-[#7543DF]" />
            <span>Hybrid Event</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="my-events" className="space-y-6 pt-2">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#242136] tracking-tight">
              My Events
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F0FF] text-[#7543DF] border border-purple-100">
              {filteredEvents.length} of {events.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64607D]">
            Scheduled workshops, live sessions, and draft proposals.
          </p>
        </div>

        {/* Controls: Search and Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64607D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs rounded-full bg-white border border-purple-100 text-[#242136] placeholder-[#64607D]/60 focus:outline-none focus:ring-2 focus:ring-[#7543DF] focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* New Event Button */}
          <Link
            href="/admin/events/create"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "published", "draft", "completed"] as const).map((status) => {
          const count =
            status === "all"
              ? events.length
              : events.filter((e) => e.status === status).length;
          const isActive = activeFilter === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => onFilterChange?.(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#302063] text-white shadow-xs"
                  : "bg-white text-[#64607D] border border-purple-100 hover:border-purple-300 hover:text-[#242136]"
              }`}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-3xl border border-purple-100/90 p-5 shadow-sm hover:shadow-xl hover:shadow-purple-950/5 hover:border-[#7543DF]/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* 1. Event Poster Banner */}
                <div
                  onClick={() => setSelectedEventForDetails(event)}
                  className="relative aspect-video w-full rounded-2xl overflow-hidden mb-4 bg-purple-50 border border-purple-100/60 cursor-pointer group/poster"
                >
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover/poster:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F4F0FF] via-[#FAF8FE] to-purple-100/40 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-xs text-[#7543DF] flex items-center justify-center mb-1.5">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#64607D]">
                        No poster uploaded
                      </span>
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#7543DF] border border-purple-100 shadow-xs">
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {renderStatusBadge(event.status)}
                  </div>
                </div>

                {/* Event Title */}
                <h3
                  onClick={() => setSelectedEventForDetails(event)}
                  className="text-base sm:text-lg font-bold text-[#242136] group-hover:text-[#7543DF] transition-colors leading-snug mb-2 line-clamp-2 cursor-pointer"
                >
                  {event.title}
                </h3>

                {/* Short Description */}
                {event.description && (
                  <p className="text-xs text-[#64607D] line-clamp-2 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Meta Attributes */}
                <div className="space-y-2 py-3 border-t border-purple-50">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-xs text-[#242136]">
                    <Clock className="w-3.5 h-3.5 text-[#7543DF] shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      {formatDateTime(event.start_at, event.end_at)}
                    </span>
                  </div>

                  {/* Event Type & Location */}
                  <div className="flex items-center gap-2">
                    {renderEventType(event.event_type, event.location)}
                  </div>

                  {/* Capacity & Registration Pills */}
                  <div className="flex items-center gap-4 text-[11px] text-[#64607D] pt-1">
                    {event.capacity && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#7543DF]" />
                        <span>{event.capacity} seats</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-[#7543DF]" />
                      <span className="capitalize">{event.registration_type} RSVP</span>
                    </span>
                  </div>
                </div>

                {/* Dedicated Registration Action Strip */}
                <div className="pt-3 pb-1">
                  {event.registration_type === "external" && event.registration_url ? (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all shadow-xs active:scale-[0.98]"
                    >
                      <span>Register Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : event.registration_type === "external" ? (
                    <div className="w-full py-2 px-3 rounded-xl text-xs text-center font-medium bg-[#FAF8FE] text-[#64607D] border border-purple-100">
                      External Link Pending
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#F4F0FF] text-[#7543DF] border border-purple-100">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#7543DF]" />
                        <span>Community RSVP</span>
                      </span>
                      <span className="text-[11px] font-medium text-[#64607D]">
                        {event.capacity ? `${event.capacity} seats max` : "Open registration"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: View Details & Direct Edit Action */}
              <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEventForDetails(event)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#64607D] hover:text-[#7543DF] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7543DF] bg-[#F4F0FF] hover:bg-[#7543DF] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7543DF]"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Event</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 text-center shadow-xs">
          {events.length === 0 ? (
            /* True Empty State: Organizer has 0 events */
            <div className="max-w-md mx-auto space-y-4">
              {/* 2D Empty State Illustration */}
              <div className="relative w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-[#F4F0FF] animate-pulse-glow" />
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#302063] to-[#7543DF] flex items-center justify-center text-white shadow-lg shadow-[#7543DF]/25">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="absolute -top-1 -right-1 text-[#7543DF]">
                  <Sparkles className="w-5 h-5 animate-bounce" />
                </div>
              </div>

              <h3 className="text-xl font-black text-[#242136] tracking-tight">
                No events on your calendar yet
              </h3>
              <p className="text-xs sm:text-sm text-[#64607D] leading-relaxed">
                Bring your craft to life! Host a hands-on workshop, design
                sprint, or community meetup and start connecting with eager
                learners.
              </p>

              <div className="pt-2">
                <Link
                  href="/admin/events/create"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#7543DF] hover:bg-[#6332C9] transition-all shadow-md shadow-[#7543DF]/20 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Your First Event</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Filtered Empty State */
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F0FF] text-[#7543DF] mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242136]">
                No matching events found
              </h3>
              <p className="text-xs text-[#64607D]">
                No events found matching your filter or search criteria.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    onFilterChange?.("all");
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#7543DF] bg-[#F4F0FF] hover:bg-purple-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEventForDetails}
        isOpen={selectedEventForDetails !== null}
        onClose={() => setSelectedEventForDetails(null)}
      />
    </section>
  );
}
