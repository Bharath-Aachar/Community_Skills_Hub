import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizerEvents } from "@/lib/events";
import OrganizerDashboardClient from "@/components/dashboard/OrganizerDashboardClient";
import { Event } from "@/types/event";

export const metadata = {
  title: "Organizer Dashboard | Community Skills Hub",
  description: "Curate workshops, manage events, and grow your community.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Verify authenticated user identity server-side
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login?error=unauthorized");
  }

  // 2. Fetch server-side profile to enforce roles
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

  // 3. Fetch organizer's actual events from the database
  const eventsResult = await getOrganizerEvents();

  const events: Event[] = eventsResult.data || [];
  const fetchError: string | null = eventsResult.error?.message || null;

  // 4. Calculate real database-backed metrics (no fake statistics)
  const metrics = {
    total: events.length,
    published: events.filter((e) => e.status === "published").length,
    draft: events.filter((e) => e.status === "draft").length,
    completed: events.filter((e) => e.status === "completed").length,
  };

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Organizer";
  const userEmail = user.email || "";

  return (
    <OrganizerDashboardClient
      userName={displayName}
      userEmail={userEmail}
      roles={roles}
      events={events}
      metrics={metrics}
      fetchError={fetchError}
    />
  );
}
