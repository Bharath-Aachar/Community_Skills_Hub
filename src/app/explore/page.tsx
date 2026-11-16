import type { Metadata } from "next";
import { Users, LogOut } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Participant Portal | Community Skills Hub",
  description:
    "Discover community events, register for workshops, and track your learning journey.",
};

export default async function ExplorePage() {
  let userEmail: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email || null;
  } catch {
    // If not authenticated or env vars missing, continue showing placeholder
  }

  return (
    <PlaceholderPage
      badge={userEmail ? "Signed In as Participant" : "Participant Portal"}
      title="Participant Experience"
      subtitle={
        userEmail
          ? `Welcome, ${userEmail}`
          : "Explore Events & Manage Learning"
      }
      description={
        userEmail
          ? "You are authenticated as a participant. Event discovery, catalog filtering, and registration modules will be fully enabled in Stage 3."
          : "The Participant Hub is being prepared. Soon you'll be able to browse workshops, register in one click, bookmark upcoming hackathons, and track your learning milestones."
      }
      icon={Users}
      targetRole="Participants"
      expectedFeatures={[
        "Interactive event catalog with category and date filtering",
        "One-click workshop registrations and ticket confirmations",
        "Save and bookmark external community opportunities",
        "Personal milestone tracker and calendar synchronization",
        "Future AI-powered Event Tracker",
      ]}
      secondaryAction={
        userEmail ? (
          <form action="/auth/signout" method="POST" className="w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#242136] bg-white hover:bg-[#F4F0FF] hover:text-[#7543DF] border border-purple-200 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        ) : undefined
      }
    />
  );
}
