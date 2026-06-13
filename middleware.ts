import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/admin", "/dashboard"]
const authRoutes = ["/auth/login", "/auth/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Lire le cookie au lieu du header authorization
  const token = request.cookies.get("auth_token")?.value
  const isAuthenticated = !!token

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*", "/dashboard/:path*"]
}