import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, LogOut, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Organizer Dashboard | Community Skills Hub",
  description: "Manage workshops, participants, and community events.",
};

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FE]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Top Organizer Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-xl shadow-purple-950/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#302063] text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Organizer</span>
              </span>
              {roles.map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F0FF] text-[#7543DF] border border-purple-100 capitalize"
                >
                  {role}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242136]">
              Welcome back, {profile?.full_name || user.email}
            </h1>
            <p className="text-sm text-[#64607D]">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </div>

          <div>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-semibold text-[#242136] hover:bg-[#F4F0FF] hover:text-[#7543DF] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Dashboard Capabilities Placeholder Card */}
        <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#242136] mb-3">
            Organizer Management Suite
          </h2>
          <p className="text-sm text-[#64607D] leading-relaxed mb-6">
            Authentication and organizer permissions have been securely
            verified via Supabase. Event creation, attendee moderation, and
            workshop analytics modules will be activated in the upcoming
            development stage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F0FF]/60 border border-purple-100">
              <div className="flex items-center gap-2 text-[#7543DF] font-semibold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Event Creation</span>
              </div>
              <p className="text-xs text-[#64607D]">
                Host workshops, hackathons, and community bootcamps.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F0FF]/60 border border-purple-100">
              <div className="flex items-center gap-2 text-[#7543DF] font-semibold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Registration Desk</span>
              </div>
              <p className="text-xs text-[#64607D]">
                Review attendee lists and track workshop check-ins.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F0FF]/60 border border-purple-100">
              <div className="flex items-center gap-2 text-[#7543DF] font-semibold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Community Reports</span>
              </div>
              <p className="text-xs text-[#64607D]">
                Measure engagement, ratings, and skill outcomes.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
