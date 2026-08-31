# API Contract

The frontend should depend on this contract, not on backend implementation details.

## Response Envelope

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Errors should use:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A readable error message."
  }
}
```

## Initial Endpoints

```txt
GET  /api/health
GET  /api/home-content
GET  /api/blogs
POST /api/contact
POST /api/schedule
POST /api/assessment
```

## Frontend Rule

Frontend components must use `src/lib/api/client.js` rather than calling PHP files directly.

