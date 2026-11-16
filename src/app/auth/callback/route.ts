import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Validates that a redirect path is a safe internal relative path.
 * Prevents open-redirect attacks (e.g. //evil.com or https://evil.com).
 */
function getSafeRedirectUrl(next: string | null, origin: string): string {
  if (!next) {
    return `${origin}/explore`;
  }

  // Must be a relative path starting with '/', not '//' or '/\', and without protocols
  const isSafeRelative =
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\") &&
    !next.includes(":") &&
    !next.includes("\\");

  if (!isSafeRelative) {
    return `${origin}/explore`;
  }

  return `${origin}${next}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const destination = getSafeRedirectUrl(next, origin);

  // If Supabase returned an OAuth / Auth error query param
  if (error) {
    const message = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(
            "The verification link is invalid or has expired. Please request a new one."
          )}`
        );
      }

      // Successful exchange: forward user to their validated destination
      return NextResponse.redirect(destination);
    } catch {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(
          "Unable to verify your session. Please try signing in directly."
        )}`
      );
    }
  }

  // No authorization code provided
  return NextResponse.redirect(`${origin}/login`);
}
