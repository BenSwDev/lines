# Security Audit - Demo vs Authenticated Routes

## 🔴 CRITICAL SECURITY ISSUE IDENTIFIED

**Date**: 2024  
**Severity**: CRITICAL  
**Status**: PENDING FIX

---

## Problem Summary

There is a **critical security vulnerability** where demo/test mode and authenticated routes are not properly separated. This causes:

1. **Demo users can access protected routes** - `/venues/[venueId]/*` routes are accessible without proper authentication
2. **Session confusion** - Demo mode and real authentication are mixed
3. **Data leakage risk** - Demo users might see real user data
4. **Authentication bypass** - Test/demo mode bypasses security checks

---

## Current Implementation Issues

### 1. Middleware Configuration

**File**: `lines-app/middleware.ts`

**Problem**:
- `/venues` is in `protectedRoutes` but demo can still access it
- No check for demo mode vs real authentication
- No separation between demo/test users and real users

**Current Code**:
```typescript
const protectedRoutes = ["/dashboard", "/venues", "/api/venues"];
const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));

// If not logged in and trying to access protected route, redirect to login
if (!isLoggedIn && isProtectedRoute) {
  // Redirects to login
}
```

**Issue**: Demo mode might have `isLoggedIn = true` with test user, allowing access to protected routes.

### 2. Venue Map Page

**File**: `lines-app/src/app/venues/[venueId]/map/page.tsx`

**Problem**:
- Uses `getCurrentUser()` which might return demo user
- No check if user is demo/test user
- No separation between demo and real data

### 3. Demo System Integration

**File**: `lines-app/src/modules/demo-system/index.ts`

**Problem**:
- Demo users might be treated as real authenticated users
- No clear separation between demo and production data
- Demo users can access real venue data

### 4. Actions/Services

**Problem**:
- Server actions don't check if user is demo/test
- No validation that user owns the venue
- Demo users can modify real data

---

## Security Requirements

### 1. Strict Separation

- **Demo routes**: `/demo`, `/demo-experience` - Completely isolated
- **Protected routes**: `/venues/*`, `/dashboard/*` - Require real authentication
- **No mixing**: Demo users should NEVER access protected routes

### 2. Authentication Checks

- All protected routes must verify:
  - User is authenticated (not demo)
  - User owns the resource (venue ownership)
  - Session is valid (not expired)

### 3. Demo Mode Isolation

- Demo mode should:
  - Use mock data only
  - Not access database
  - Not create/modify real data
  - Clear indication it's demo mode

### 4. Session Management

- Real users: JWT session with user ID
- Demo users: No session, or special demo session flag
- Clear distinction in middleware

---

## Fix Plan

### Phase 1: Middleware Enhancement

1. Add demo mode detection
2. Block demo users from protected routes
3. Add demo session flag
4. Separate demo and real authentication

### Phase 2: Route Protection

1. Add ownership checks to all venue routes
2. Verify user owns venue before access
3. Add demo mode checks in page components
4. Block demo users from server actions

### Phase 3: Demo System Isolation

1. Ensure demo uses only mock data
2. No database access in demo mode
3. Clear visual indicators for demo mode
4. Prevent demo from accessing real APIs

### Phase 4: Testing & Validation

1. Test demo cannot access protected routes
2. Test real users cannot see demo data
3. Test ownership validation
4. Test session management

---

## Implementation Steps

### Step 1: Update Middleware

```typescript
// Add demo mode detection
const isDemoMode = nextUrl.pathname.startsWith("/demo") || 
                   nextUrl.searchParams.has("demo");

// Block demo users from protected routes
if (isDemoMode && isProtectedRoute) {
  return NextResponse.redirect(new URL("/demo", nextUrl.origin));
}

// Add demo session flag
if (isDemoMode) {
  // Set demo flag in headers/cookies
  // Don't treat as authenticated
}
```

### Step 2: Add Ownership Checks

```typescript
// In venue routes
const user = await requireAuth();
const venue = await getVenue(venueId);

if (venue.userId !== user.id) {
  redirect("/dashboard"); // Or 403
}
```

### Step 3: Demo Mode Isolation

```typescript
// In demo components
const isDemo = useDemoMode(); // Hook to detect demo

if (isDemo) {
  // Use mock data only
  // Don't call real APIs
  // Show demo indicator
}
```

---

## Files to Modify

1. `middleware.ts` - Add demo mode detection and blocking
2. `src/app/venues/[venueId]/map/page.tsx` - Add ownership check
3. `src/app/venues/[venueId]/*/page.tsx` - Add ownership checks to all venue routes
4. `src/core/auth/session.ts` - Add demo mode detection
5. `src/modules/venue-map/actions/*.ts` - Add ownership validation
6. `src/modules/demo-system/*` - Ensure complete isolation

---

## Testing Checklist

- [ ] Demo user cannot access `/venues/*`
- [ ] Demo user cannot access `/dashboard`
- [ ] Real user cannot see demo data
- [ ] Real user can only access own venues
- [ ] Demo mode uses only mock data
- [ ] No database writes in demo mode
- [ ] Session properly distinguishes demo vs real
- [ ] All protected routes require authentication
- [ ] Ownership validation works correctly

---

**Priority**: CRITICAL - Fix immediately before Phase 5  
**Estimated Time**: 2-4 hours  
**Risk**: HIGH - Data leakage, unauthorized access

