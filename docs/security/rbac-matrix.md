# Planned Security Policy & RBAC Matrix

This document describes intended security controls and endpoint permissions. They are not implemented or enforced in this checkout; do not rely on the token lifetimes, cookie protections, or role permissions below as current guarantees.

## Token Management Strategy
* **Access Tokens:** The planned policy is to use short-lived JWTs (15-minute expiry) signed with HMAC-SHA256 and held in Angular signals and memory.
* **Refresh Tokens:** The planned policy is to use long-lived JWTs (7-day expiry) persisted in `httpOnly`, `sameSite=Lax`, `secure` cookies.
* **Rotation:** The planned frontend interceptor will handle `401 Unauthorized` responses by exchanging the refresh cookie for a fresh access token before retrying failed requests.

## Role-Based Access Control (RBAC) Matrix

The table lists planned permissions, not permissions currently enforced by the application.

| Endpoint | Method | Permitted Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/*` | `POST` | Public | Signup, Login, Password Reset, Token Refresh |
| `/api/projects` | `GET` | All Authenticated | Fetch active project index |
| `/api/projects` | `POST` | Admin, Manager, Contributor | Create new project initiative |
| `/api/projects/:id/status` | `PATCH` | Admin, Manager, Contributor | Update project workflow phase |
| `/api/projects/:id` | `DELETE` | **Admin Only** | Hard delete project record |
| `/api/analytics` | `GET` | Admin, Manager, Contributor | Compute portfolio capital & velocity telemetry |
