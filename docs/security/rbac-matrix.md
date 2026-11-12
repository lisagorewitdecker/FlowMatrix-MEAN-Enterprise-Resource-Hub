# Security Architecture & RBAC Matrix

## Token Management Strategy
* **Access Tokens:** Short-lived JWTs (15-minute expiry) signed with HMAC-SHA256, held in Angular signals and memory.
* **Refresh Tokens:** Long-lived JWTs (7-day expiry) persisted in `httpOnly`, `sameSite=Lax`, `secure` cookies to protect against cross-site scripting (XSS) extraction.
* **Rotation:** Automated interceptor (`auth.interceptor.ts`) intercepts `401 Unauthorized` responses and exchanges the refresh cookie for a fresh access token before retrying failed requests.

## Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Permitted Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/*` | `POST` | Public | Signup, Login, Password Reset, Token Refresh |
| `/api/projects` | `GET` | All Authenticated | Fetch active project index |
| `/api/projects` | `POST` | Admin, Manager, Contributor | Create new project initiative |
| `/api/projects/:id/status` | `PATCH` | Admin, Manager, Contributor | Update project workflow phase |
| `/api/projects/:id` | `DELETE` | **Admin Only** | Hard delete project record |
| `/api/analytics` | `GET` | Admin, Manager, Contributor | Compute portfolio capital & velocity telemetry |
