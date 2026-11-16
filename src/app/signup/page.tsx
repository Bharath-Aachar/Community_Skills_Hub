import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Sign Up | Community Skills Hub",
  description: "Join Community Skills Hub as a participant or organizer.",
};

export default function SignUpPage() {
  return (
    <PlaceholderPage
      badge="Onboarding Coming Soon"
      title="Create Your Account"
      subtitle="Join Our Learning Community"
      description="Registration accounts will be integrated in the upcoming development stage alongside Supabase database configurations."
      icon={UserPlus}
      expectedFeatures={[
        "Quick onboarding customized by your selected role",
        "Skill interest and community preferences setup",
        "Instant access to community announcements and workshop schedules",
      ]}
    />
  );
}
