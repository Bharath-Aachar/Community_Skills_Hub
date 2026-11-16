import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import PlaceholderPage from "@/components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Log In | Community Skills Hub",
  description: "Access your Community Skills Hub account.",
};

export default function LoginPage() {
  return (
    <PlaceholderPage
      badge="Authentication Setup Pending"
      title="Member Sign In"
      subtitle="Secure Platform Access"
      description="Authentication is not configured in this initial initialization stage. Secure participant and organizer sign-in will be introduced in the next stage."
      icon={LogIn}
      expectedFeatures={[
        "Single sign-on and magic link authentication",
        "Participant and Organizer unified profile access",
        "Encrypted credential and session management",
      ]}
    />
  );
}
