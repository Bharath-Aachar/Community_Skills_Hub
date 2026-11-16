import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user session and refreshes expired auth tokens.
 * Following current official Supabase SSR guidance:
 * - Uses getAll and setAll cookie accessors.
 * - Mutates both request.cookies and response.cookies.
 * - Calls `supabase.auth.getClaims()` to securely verify authentication claims.
 * - Avoids unnecessary redirects at this foundational stage.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If environment variables are not yet configured in .env.local,
  // pass the request through safely to avoid build or boot interruptions.
  if (!supabaseUrl || !supabasePublishableKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Calling getClaims() refreshes the auth token if expired
  // and cryptographically verifies claims against the Supabase JWKS.
  // Never rely on `getSession()` alone for authorization.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
