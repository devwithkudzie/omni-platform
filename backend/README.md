# OmniContact Backend API

This backend contains the clean PHP API/CMS runtime for the migration workspace.

The legacy CMS still exists in `backend/cms` for reference, but the new frontend should use
the clean `/api/v1` endpoints instead of the old session-based `/cms/api/admin/*` endpoints.

```txt
POST   /api/v1/auth/login
GET    /api/v1/auth/me
GET    /api/v1/public/posts
GET    /api/v1/public/posts/{slug}
GET    /api/v1/admin/posts
POST   /api/v1/admin/posts
PUT    /api/v1/admin/posts/{id}
DELETE /api/v1/admin/posts/{id}
POST   /api/v1/admin/posts/{id}/approval
POST   /api/v1/admin/media
```

CMS authentication is token-based. Login returns a JWT and protected CMS requests must send:

```txt
Authorization: Bearer <token>
```

## Local Run

```bash
php -S 127.0.0.1:8080 public/index.php
```

## Docker Run

From `omni-platform`:

```bash
docker compose up --build
```

The PHP backend will be available at:

```txt
http://127.0.0.1:8080
```

The local MySQL database will be available on host port `3307`.

## Structure

```txt
cms/                  Migrated PHP CMS and public API endpoints
public/index.php      Front controller for clean JSON API endpoints
routes/api.php        API route definitions
src/Auth              Token auth helpers
src/Controllers       Auth, post, and media controllers
src/Database          PDO connection factory
src/Http              Request, response, and CORS helpers
config/app.php        Runtime configuration
```
