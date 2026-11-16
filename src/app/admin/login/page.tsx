"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | null>(
    searchParams.get("error") === "unauthorized"
      ? "You must be signed in with an authorized organizer account to access the Organizer Dashboard."
      : null
  );
  const [isDenied, setIsDenied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setEmailError(undefined);
    setPasswordError(undefined);

    if (!email.trim()) {
      setEmailError("Please enter your organizer email.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setIsDenied(false);

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("invalid login credentials")
        ) {
          setGeneralError(
            "Invalid organizer credentials. Please check your email and password."
          );
        } else {
          setGeneralError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setGeneralError("Authentication failed. No user record returned.");
        return;
      }

      // Step 2: Retrieve verified user identity
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        await supabase.auth.signOut();
        setGeneralError("Unable to verify account credentials.");
        return;
      }

      // Step 3: Fetch profile from server to check assigned roles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("roles, full_name")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        // If profile doesn't exist yet or query fails, sign out
        await supabase.auth.signOut();
        setGeneralError(
          "Access Denied: Organizer profile not found or permissions unassigned."
        );
        setIsDenied(true);
        return;
      }

      // Step 4: Verify whether roles contain organizer or admin
      const roles: string[] = profile.roles || [];
      const hasOrganizerAccess =
        roles.includes("organizer") || roles.includes("admin");

      if (!hasOrganizerAccess) {
        // Step 5: If unauthorized, immediately sign out and show access-denied
        await supabase.auth.signOut();
        setGeneralError(
          "Access Denied: Your account currently has participant permissions only. Organizer credentials are required for this portal."
        );
        setIsDenied(true);
        return;
      }

      // Step 6: Authorized organizer -> redirect to organizer dashboard
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during organizer sign in.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      badge="Organizer & Host Portal"
      title="Organizer Sign In"
      subtitle="Access community management, workshop moderation, and attendee analytics."
      organizerBadge
      footer={
        <div className="space-y-2">
          <p>
            Looking to join workshops or hackathons?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#7543DF] hover:underline"
            >
              Participant Sign In
            </Link>
          </p>
          <p className="text-xs text-[#64607D]">
            Need organizer access? Contact your community administrator.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {generalError && (
          <div
            className={`flex flex-col gap-2 p-4 rounded-xl text-xs sm:text-sm border ${
              isDenied
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>

            {isDenied && (
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-xs text-amber-800">
                  Switch to Participant Portal?
                </span>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#7543DF] hover:underline"
                >
                  <span>Go to Participant Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        <AuthInput
          label="Organizer Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="organizer@community.org"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(undefined);
          }}
          error={emailError}
          disabled={isSubmitting}
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your organizer password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(undefined);
          }}
          error={passwordError}
          disabled={isSubmitting}
          required
        />

        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm font-semibold text-[#7543DF] hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-[#302063] hover:bg-[#25174f] disabled:bg-purple-300 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying organizer access...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate as Organizer</span>
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FE]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-12 text-center text-[#64607D]">Loading...</div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
