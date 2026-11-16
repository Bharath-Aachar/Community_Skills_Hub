"use client";

import { useState } from "react";
import { Event } from "@/types/event";
import DashboardNav from "./DashboardNav";
import DashboardHero from "./DashboardHero";
import EventMetrics, { EventMetricsData } from "./EventMetrics";
import QuickActions from "./QuickActions";
import RecentEvents from "./RecentEvents";
import PlaceholderModal, { ModalType } from "./PlaceholderModal";
import DashboardErrorState from "./DashboardErrorState";
import Footer from "@/components/Footer";

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
        {/* 2. Welcome Hero with 2D Community Animation */}
        <DashboardHero
          userName={userName}
          onOpenModal={handleOpenModal}
        />

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
