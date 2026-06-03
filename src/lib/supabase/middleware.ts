import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Fast path: verify the JWT locally (no network). Only hit the auth server
  // to refresh when the token is close to expiring. This avoids a Supabase
  // round-trip on every single navigation.
  try {
    const { data } = await supabase.auth.getClaims();
    const exp = (data?.claims as { exp?: number } | undefined)?.exp;
    if (exp == null) {
      // no/unverifiable session -> let getUser settle it (no network if no token)
      await supabase.auth.getUser();
    } else {
      const secondsLeft = exp - Math.floor(Date.now() / 1000);
      if (secondsLeft < 300) await supabase.auth.getUser(); // refresh window
    }
  } catch {
    await supabase.auth.getUser();
  }

  return response;
}
