import { auth } from "./src/core/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/demo", "/auth/login", "/auth/register", "/api/auth"];

  const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname.startsWith(route));

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/venues", "/api/venues"];

  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (isLoggedIn && (nextUrl.pathname === "/auth/login" || nextUrl.pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"]
};
