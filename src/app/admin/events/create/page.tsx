import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata = {
  title: "Create Event | Community Skills Hub",
  description: "Create and publish a new community workshop or meetup.",
};

export const dynamic = "force-dynamic";

export default async function CreateEventPage() {
  const supabase = await createClient();

  // 1. Verify authenticated user identity server-side
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login?error=unauthorized");
  }

  // 2. Fetch server-side profile to enforce organizer/admin roles
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, roles")
    .eq("id", user.id)
    .single();

  const roles: string[] = profile?.roles || [];
  const isAuthorized = roles.includes("organizer") || roles.includes("admin");

  if (!isAuthorized) {
    redirect("/admin/login?error=unauthorized");
  }

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Organizer";
  const userEmail = user.email || "";

  return (
    <CreateEventForm
      userName={displayName}
      userEmail={userEmail}
      roles={roles}
    />
  );
}
