import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout errors and redirect anyway
  }
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout errors and redirect anyway
  }
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}
