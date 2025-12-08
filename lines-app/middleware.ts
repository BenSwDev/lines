import { auth } from "./src/core/auth/auth";
import { NextResponse } from "next/server";
import { isDemoMode, isDemoUserId, isDemoVenueId } from "./src/core/auth/demo";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userId = req.auth?.user?.id;

  // Detect demo mode from query params or path
  const isInDemoMode = isDemoMode(nextUrl.searchParams) || 
                       nextUrl.pathname.startsWith("/demo") ||
                       isDemoUserId(userId);

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/demo", "/demo-experience", "/auth/login", "/auth/register", "/api/auth"];

  const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname.startsWith(route));

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/venues", "/api/venues"];

  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));

  // CRITICAL: Block demo users from accessing protected routes
  if (isInDemoMode && isProtectedRoute) {
    // Demo users should only access demo routes
    return NextResponse.redirect(new URL("/demo", nextUrl.origin));
  }

  // CRITICAL: Block demo venues from being accessed by real users
  if (isProtectedRoute && nextUrl.pathname.startsWith("/venues/")) {
    const venueIdMatch = nextUrl.pathname.match(/\/venues\/([^\/]+)/);
    if (venueIdMatch) {
      const venueId = venueIdMatch[1];
      const isDemoVenue = isDemoVenueId(venueId);
      
      // Real users cannot access demo venues
      if (isDemoVenue && !isInDemoMode) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
      
      // Demo users can only access demo venues
      if (isInDemoMode && !isDemoVenue) {
        return NextResponse.redirect(new URL("/demo", nextUrl.origin));
      }
    }
  }

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && isProtectedRoute && !isInDemoMode) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (isLoggedIn && !isInDemoMode && (nextUrl.pathname === "/auth/login" || nextUrl.pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"]
};
