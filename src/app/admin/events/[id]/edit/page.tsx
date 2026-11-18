import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/events";
import CreateEventForm from "@/components/events/CreateEventForm";

export const metadata = {
  title: "Edit Event | Community Skills Hub",
  description:
    "Update event agenda, schedule, poster, and registration settings.",
};

export const dynamic = "force-dynamic";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
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

  // 3. Fetch event by ID
  const eventResult = await getEventById(id);
  if (!eventResult.data) {
    notFound();
  }

  const event = eventResult.data;

  // 4. Verify ownership or admin privileges
  const isOwner = event.organizer_id === user.id;
  const isAdmin = roles.includes("admin");

  if (!isOwner && !isAdmin) {
    redirect("/admin/dashboard?error=forbidden");
  }

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "Organizer";
  const userEmail = user.email || "";

  return (
    <CreateEventForm
      userName={displayName}
      userEmail={userEmail}
      roles={roles}
      initialEvent={event}
    />
  );
}
