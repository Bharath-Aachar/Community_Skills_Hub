"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setEmailError(undefined);

    if (!email.trim()) {
      setEmailError("Please enter your registered email address.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        }
      );

      if (error) {
        setGeneralError(error.message);
        return;
      }

      // Neutral confirmation message displayed regardless to prevent account enumeration
      setIsSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
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
          badge="Account Recovery"
          title="Reset Your Password"
          subtitle="Enter your account email to receive a secure password reset link."
          footer={
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-[#7543DF] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          }
        >
          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-emerald-900">
                Check Your Inbox
              </h2>
              <p className="text-sm text-emerald-700 leading-relaxed">
                If an account exists for <span className="font-semibold">{email}</span>,
                you will receive password reset instructions shortly. Please check
                your spam or junk folder if you don&apos;t see it within a few minutes.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-xl shadow-xs transition-colors"
                >
                  Return to Log In
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

              <AuthInput
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(undefined);
                }}
                error={emailError}
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
                    <span>Sending instructions...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
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
