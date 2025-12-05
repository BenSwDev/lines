# Feature Specification: Authentication & Authorization

**Status:** Implemented  
**Module:** `src/modules/auth` + `src/core/auth`  
**Version:** v1.1.0

---

## Overview

Full authentication and authorization system with:

- User registration and login
- Role-based access control (RBAC)
- Protected routes
- Session management

Based on NextAuth.js v5 (Auth.js) with Prisma adapter.

---

## User Model

| Field         | Type      | Description                  |
| ------------- | --------- | ---------------------------- |
| id            | String    | Unique identifier            |
| email         | String    | Email (unique)               |
| password      | String    | Bcrypt hashed password       |
| name          | String?   | Display name                 |
| role          | String    | "user" or "admin"            |
| emailVerified | DateTime? | Email verification timestamp |
| image         | String?   | Profile image URL            |

---

## Roles

### User (default)

- Can manage their own venues
- Full CRUD on owned venues
- Cannot access admin features

### Admin

- All user permissions
- Can access admin dashboard (future)
- Can manage all users (future)

---

## Authentication Flow

### Registration

1. User fills form (name, email, password)
2. Backend validates + checks for existing email
3. Password hashed with bcrypt (10 rounds)
4. User created with role="user"
5. Redirect to login

### Login

1. User enters email + password
2. NextAuth validates credentials
3. JWT session created
4. Redirect to home

### Protected Routes

- Middleware checks session on every request
- Non-authenticated users redirect to `/auth/login`
- Authenticated users can't access `/auth/*` pages

---

## API

All venue operations now require authenticated user:

- `createVenue` - creates with current `userId`
- `listVenues` - shows only user's venues (future filter)
- `deleteVenue` - requires ownership (future check)

---

## Security

- ✅ Passwords hashed with bcrypt
- ✅ JWT sessions (not database sessions for performance)
- ✅ CSRF protection via NextAuth
- ✅ Secure cookies (httpOnly, sameSite)
- 🔜 Email verification
- 🔜 Password reset flow
- 🔜 OAuth providers (Google, GitHub)

---

**Last Updated:** 2025-12-05

