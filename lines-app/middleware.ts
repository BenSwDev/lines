import { auth } from "./src/core/auth/auth";
import { NextResponse } from "next/server";
import { isDemoMode, isDemoUserId, isDemoVenueId } from "./src/core/auth/demo";
import { prisma } from "./src/core/integrations/prisma/client";

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userId = req.auth?.user?.id;

  // Detect demo mode from query params or path
  const isInDemoMode =
    isDemoMode(nextUrl.searchParams) ||
    nextUrl.pathname.startsWith("/demo") ||
    isDemoUserId(userId);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/demo",
    "/demo-experience",
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
    "/api/auth"
  ];

  const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname.startsWith(route));

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/venues", "/api/venues"];

  // Admin routes that require admin role
  const adminRoutes = ["/admin"];

  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => nextUrl.pathname.startsWith(route));

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
  if (!isLoggedIn && (isProtectedRoute || isAdminRoute) && !isInDemoMode) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access for admin routes
  if (isLoggedIn && isAdminRoute && !isInDemoMode) {
    // Fetch user from DB to ensure we have the latest role
    const userEmail = req.auth?.user?.email;
    if (!userEmail) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
    
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { role: true }
      });
      
      const userRole = dbUser?.role || (req.auth?.user as { role?: string })?.role;
      
      // Debug: log the role check
      console.log("[Middleware] Admin check:", {
        email: userEmail,
        dbRole: dbUser?.role,
        sessionRole: (req.auth?.user as { role?: string })?.role,
        finalRole: userRole,
        isAdmin: userRole === "admin"
      });
      
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
    } catch (error) {
      console.error("[Middleware] Error checking admin role:", error);
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (
    isLoggedIn &&
    !isInDemoMode &&
    (nextUrl.pathname === "/auth/login" || nextUrl.pathname === "/auth/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"]
};
