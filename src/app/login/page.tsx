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
import { AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | null>(
    searchParams.get("error")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let valid = true;
    setEmailError(undefined);
    setPasswordError(undefined);

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
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

    if (!validate() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setGeneralError(
            "Invalid email or password. Please check your credentials and try again."
          );
        } else if (
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setGeneralError(
            "Your email address has not been confirmed yet. Please verify your email inbox."
          );
        } else {
          setGeneralError(error.message);
        }
        return;
      }

      // Successful sign in -> redirect to participant portal
      router.push("/explore");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign in.";
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      badge="Participant Portal"
      title="Welcome Back"
      subtitle="Sign in to your account to continue discovering and tracking opportunities."
      footer={
        <div className="space-y-2">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#7543DF] hover:text-[#6332C9] hover:underline transition-colors"
            >
              Sign Up
            </Link>
          </p>
          <p className="text-xs text-[#64607D]">
            Are you a community host or workshop lead?{" "}
            <Link
              href="/admin/login"
              className="font-medium text-[#302063] hover:underline"
            >
              Organizer Sign In
            </Link>
          </p>
        </div>
      }
    >
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

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(undefined);
          }}
          error={passwordError}
          disabled={isSubmitting}
          required
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-[#64607D]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-purple-200 text-[#7543DF] focus:ring-[#7543DF]"
            />
            <span>Remember me</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-xs sm:text-sm font-semibold text-[#7543DF] hover:text-[#6332C9] hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] disabled:bg-purple-300 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FE]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="p-12 text-center text-[#64607D]">Loading...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
