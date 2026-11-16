"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import PasswordInput from "@/components/auth/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter a password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = "Password must include at least one letter and one number.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!termsAccepted) {
      newErrors.terms = "You must agree to the terms and conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      // Notice: Only sending full_name in user metadata. NEVER sending roles from client.
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${origin}/auth/callback?next=/explore`,
        },
      });

      if (error) {
        setGeneralError(error.message);
        return;
      }

      // Check if email confirmation is required or user was created
      if (data.user) {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during signup.";
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
          badge="Participant Registration"
          title="Create Your Account"
          subtitle="Join Community Skills Hub to explore workshops, hackathons, and learning paths."
          footer={
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#7543DF] hover:text-[#6332C9] hover:underline transition-colors"
              >
                Log In
              </Link>
            </p>
          }
        >
          {/* Success Notification */}
          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-emerald-900">
                Verification Email Sent!
              </h2>
              <p className="text-sm text-emerald-700 leading-relaxed">
                We have sent a confirmation link to{" "}
                <span className="font-semibold">{email}</span>. Please click the
                link in your email to activate your account and start exploring.
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] rounded-xl shadow-xs transition-colors"
                >
                  Go to Log In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* General Supabase error banner */}
              {generalError && (
                <div
                  className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Full Name */}
              <AuthInput
                label="Full Name"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                error={errors.fullName}
                disabled={isSubmitting}
                required
              />

              {/* Email */}
              <AuthInput
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                error={errors.email}
                disabled={isSubmitting}
                required
              />

              {/* Password */}
              <PasswordInput
                label="Password"
                name="password"
                autoComplete="new-password"
                placeholder="At least 8 characters with letter & number"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                error={errors.password}
                disabled={isSubmitting}
                required
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                required
              />

              {/* Terms and Conditions Checkbox */}
              <div className="space-y-1 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (errors.terms) {
                        setErrors((prev) => ({ ...prev, terms: undefined }));
                      }
                    }}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-purple-200 text-[#7543DF] focus:ring-[#7543DF]"
                  />
                  <span className="text-xs sm:text-sm text-[#64607D]">
                    I agree to the Community Skills Hub terms of service and
                    privacy guidelines.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-600 font-medium pl-6">
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-semibold text-white bg-[#7543DF] hover:bg-[#6332C9] disabled:bg-purple-300 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Sign Up as Participant</span>
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
