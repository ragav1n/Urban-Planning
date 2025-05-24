import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not signed in and trying to access dashboard
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = new URL("/auth/sign-in", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and trying to access auth pages
    if (session && req.nextUrl.pathname.startsWith("/auth")) {
      const redirectUrl = new URL("/dashboard", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    // If there's an error with auth, redirect to sign-in
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = new URL("/auth/sign-in", req.url)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
