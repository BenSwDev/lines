# Admin Module

**Status:** Implemented  
**Module:** `src/modules/admin`  
**Routes:** `/admin`

---

## Overview

Complete admin management system with user management, venue management, and impersonation capabilities.

---

## Features

### Admin Dashboard
- Statistics overview (total users, admins, venues)
- User management interface
- Venue management interface

### User Management
- View all users
- Change user roles (user/admin)
- Delete users
- Impersonate users

### Venue Management
- View all venues
- View venue details
- Delete venues

### Impersonation
- Admins can impersonate any user
- Banner shows when impersonating
- Easy return to admin mode

---

## Access Control

- Only users with `role: "admin"` can access `/admin`
- Middleware protects admin routes
- Impersonation only available to admins

---

## API

### Admin Actions
- `getAllUsers()` - Get all users
- `getUserById(userId)` - Get user details
- `updateUserRole({ userId, role })` - Change user role
- `deleteUser(userId)` - Delete user
- `getAllVenues()` - Get all venues
- `getVenueById(venueId)` - Get venue details
- `deleteVenue(venueId)` - Delete venue
- `getUserStats()` - Get admin statistics

### Impersonation Actions
- `startImpersonation({ userId })` - Start impersonating a user
- `stopImpersonation()` - Stop impersonation and return to admin

---

## Security

- All admin actions require admin role
- Admins cannot change their own role
- Admins cannot delete themselves
- Impersonation state stored in JWT token
- Session properly updated on impersonation start/stop

