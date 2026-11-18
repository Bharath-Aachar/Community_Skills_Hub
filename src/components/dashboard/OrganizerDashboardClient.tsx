"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { Event } from "@/types/event";
import DashboardNav from "./DashboardNav";
import DashboardHero from "./DashboardHero";
import EventMetrics, { EventMetricsData } from "./EventMetrics";
import QuickActions from "./QuickActions";
import RecentEvents from "./RecentEvents";
import PlaceholderModal, { ModalType } from "./PlaceholderModal";
import DashboardErrorState from "./DashboardErrorState";
import Footer from "@/components/Footer";

function CreationBanner() {
  const searchParams = useSearchParams();
  const created = searchParams.get("created");
  const status = searchParams.get("status");
  const title = searchParams.get("title");
  const [dismissed, setDismissed] = useState(false);

  if (!created || dismissed) return null;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-emerald-200 shadow-md shadow-emerald-950/5 flex items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#242136]">
            {status === "published"
              ? "Event Published Successfully!"
              : "Draft Saved to Studio"}
          </h4>
          <p className="text-xs text-[#64607D] mt-0.5">
            {title ? `"${decodeURIComponent(title)}"` : "Your event"}{" "}
            {status === "published"
              ? "is now live and visible in the public explore catalog."
              : "is saved privately. You can publish it anytime."}
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 rounded-full text-[#64607D] hover:bg-emerald-50 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface OrganizerDashboardClientProps {
  userName: string;
  userEmail: string;
  roles: string[];
  events: Event[];
  metrics: EventMetricsData;
  fetchError?: string | null;
}

export default function OrganizerDashboardClient({
  userName,
  userEmail,
  roles,
  events,
  metrics,
  fetchError,
}: OrganizerDashboardClientProps) {
  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | undefined>(undefined);

  // Active filter state
  const [activeFilter, setActiveFilter] = useState<
    "all" | "published" | "draft" | "completed"
  >("all");

  const handleOpenModal = (type: ModalType, eventTitle?: string) => {
    setSelectedEventTitle(eventTitle);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedEventTitle(undefined);
  };

  const handleFilterChange = (status: "all" | "published" | "draft" | "completed") => {
    setActiveFilter(status);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FE] text-[#242136] selection:bg-[#F4F0FF] selection:text-[#7543DF]">
      {/* 1. Visually Interesting Floating Navigation Bar */}
      <DashboardNav
        userName={userName}
        userEmail={userEmail}
        roles={roles}
        onOpenModal={handleOpenModal}
      />

      {/* Main Studio Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 pb-16">
        {/* Creation Success Banner (Dismissible) */}
        <Suspense fallback={null}>
          <CreationBanner />
        </Suspense>

        {/* 2. Welcome Hero with 2D Community Animation */}
        <DashboardHero userName={userName} />

        {/* Database Error Handling if query failed */}
        {fetchError ? (
          <DashboardErrorState message={fetchError} />
        ) : (
          <>
            {/* 3. Event Overview (Real database-backed metrics) */}
            <EventMetrics
              metrics={metrics}
              activeFilter={activeFilter}
              onFilterClick={handleFilterChange}
            />

            {/* 4. Quick Actions Bento Strip */}
            <QuickActions
              onOpenModal={handleOpenModal}
              onFilterChange={handleFilterChange}
            />

            {/* 5. Recent Events Grid with Search and Filter */}
            <RecentEvents
              events={events}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              onOpenModal={handleOpenModal}
            />
          </>
        )}
      </main>

      {/* Reusable Placeholder / Preview Modal */}
      <PlaceholderModal
        type={modalType}
        isOpen={modalType !== null}
        onClose={handleCloseModal}
        eventTitle={selectedEventTitle}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
