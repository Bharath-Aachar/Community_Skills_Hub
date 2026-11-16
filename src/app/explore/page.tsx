import type { Metadata } from "next";
import { Users } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Participant Portal | Community Skills Hub",
  description: "Discover community events, register for workshops, and track your learning journey.",
};

export default function ExplorePage() {
  return (
    <PlaceholderPage
      badge="Coming in Stage 2"
      title="Participant Experience"
      subtitle="Explore Events & Manage Learning"
      description="The Participant Hub is being prepared. Soon you'll be able to browse workshops, register in one click, bookmark upcoming hackathons, and track your learning milestones."
      icon={Users}
      targetRole="Participants"
      expectedFeatures={[
        "Interactive event catalog with category and date filtering",
        "One-click workshop registrations and ticket confirmations",
        "Save and bookmark external community opportunities",
        "Personal milestone tracker and calendar synchronization",
        "Future AI-powered Event Tracker",
      ]}
    />
  );
}
