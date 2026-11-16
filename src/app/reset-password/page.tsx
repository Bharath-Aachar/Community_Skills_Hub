"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCard from "@/components/auth/AuthCard";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setHasSession(true);
        } else {
          // Listen for auth state change in case hash is being parsed
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, currentSession) => {
              if (
                event === "PASSWORD_RECOVERY" ||
                event === "SIGNED_IN" ||
                currentSession
              ) {
                setHasSession(true);
              }
            }
          );

          // Give a short grace period for recovery token processing
          setTimeout(() => {
            setHasSession((prev) => (prev === null ? false : prev));
          }, 1200);

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch {
        setHasSession(false);
      }
    }

    checkSession();
  }, []);

  const validate = (): boolean => {
    let valid = true;
    setPasswordError(undefined);
    setConfirmError(undefined);

    if (!password) {
      setPasswordError("Please enter a new password.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      valid = false;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setPasswordError(
        "Password must include at least one letter and one number."
      );
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your new password.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      setIsSuccess(true);
      // Cleanly sign out session after password change so user logs in with new credentials
      await supabase.auth.signOut();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while updating your password.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FE]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AuthCard
          badge="Security Update"
          title="Set New Password"
          subtitle="Choose a strong, secure password for your Community Skills Hub account."
          footer={
            <Link
              href="/login"
              className="font-semibold text-[#7543DF] hover:underline"
            >
              Back to Sign In
            </Link>
          }
        >
          {hasSession === null ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-[#64607D]">
              <Loader2 className="w-6 h-6 animate-spin text-[#7543DF]" />
              <p className="text-sm">Verifying security token...</p>
            </div>
          ) : hasSession === false ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-amber-900">
                Invalid or Expired Link
              </h2>
              <p className="text-sm text-amber-800 leading-relaxed">
                No active password recovery session was found. Password reset
                links are valid for a single use and expire after a short period.
              </p>
              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-xl shadow-xs transition-colors"
                >
                  Request a New Link
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-emerald-900">
                Password Updated!
              </h2>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Your password has been changed successfully. You can now sign in
                with your new credentials.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-xl shadow-xs transition-colors"
                >
                  Sign In with New Password
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {generalError && (
                <div
                  className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <PasswordInput
                label="New Password"
                name="password"
                autoComplete="new-password"
                placeholder="At least 8 characters with letter & number"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(undefined);
                }}
                error={passwordError}
                disabled={isSubmitting}
                required
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) setConfirmError(undefined);
                }}
                error={confirmError}
                disabled={isSubmitting}
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] disabled:bg-purple-300 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}
        </AuthCard>
      </main>

      <Footer />
    </div>
  );
}
