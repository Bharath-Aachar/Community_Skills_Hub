import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Organizer Portal | Community Skills Hub",
  description: "Create and manage events, track registrations, and organize community workshops.",
};

export default function AdminLoginPage() {
  return (
    <PlaceholderPage
      badge="Coming in Stage 2"
      title="Organizer Portal"
      subtitle="Event Creation & Participant Management"
      description="The Organizer Portal is currently under active development. Community leaders will soon have access to dedicated event creation, attendance tracking, and participant management tools."
      icon={ShieldCheck}
      targetRole="Organizers"
      expectedFeatures={[
        "Workshop and hackathon creation suite",
        "Real-time attendee registration dashboards",
        "Check-in QR scanning and workshop attendance logs",
        "Broadcast notifications and community announcements",
        "Event analytics, engagement insights, and exportable reports",
      ]}
    />
  );
}
