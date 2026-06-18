---
name: api-design
description: Design APIs with proper resource modeling, consistent patterns, and clear contracts. REST and GraphQL. Use when creating APIs, designing endpoints, reviewing API contracts, or establishing API conventions.
---

# API Design

## The Iron Law

An API is a promise. Breaking it breaks your users. Design for evolution, not for today's convenience.

---

## Resource Modeling

### REST

| Method | Path | Action |
|--------|------|--------|
| GET | /resources | List (paginated) |
| POST | /resources | Create |
| GET | /resources/:id | Read |
| PUT | /resources/:id | Replace |
| PATCH | /resources/:id | Partial update |
| DELETE | /resources/:id | Remove |

### Naming Rules
- Nouns, not verbs: `/orders` not `/createOrder`
- Plural: `/users` not `/user`
- Hierarchical: `/users/:id/orders`
- Kebab-case: `/order-items` not `/orderItems`

---

## Request Patterns

- Filtering: `GET /orders?status=pending&limit=10`
- Sorting: `GET /orders?sort=-created_at` (minus = descending)
- Pagination: `GET /orders?page=2&limit=20`
- Fields: `GET /orders?fields=id,status,total`
- Search: `GET /orders?q=query` (full-text)

---

## Response Structure

```json
{
  "data": { ... },
  "meta": { "page": 2, "limit": 20, "total": 150 },
  "links": {
    "self": "/orders?page=2",
    "prev": "/orders?page=1",
    "next": "/orders?page=3"
  }
}
```

---

## Errors

```json
{
  "error": {
    "code": "invalid_request",
    "message": "User-friendly description",
    "details": [{ "field": "email", "issue": "invalid_format" }],
    "request_id": "req_abc123"
  }
}
```

---

## Status Codes

| Code | Use For | Do NOT Use For |
|------|---------|----------------|
| 200 | OK, read/update success | Creates |
| 201 | Created | Updates |
| 204 | Empty success | When there is data |
| 400 | Client error | Auth errors |
| 401 | Not authenticated | Permission denied |
| 403 | Forbidden | Not authenticated |
| 404 | Resource not found | Auth failures |
| 409 | Conflict (duplicate) | Generic error |
| 422 | Validation failed | Syntax errors |
| 429 | Rate limited | |
| 500 | Server error | Client errors |

---

## Versioning

URL versioning: `/v1/resources`, `/v2/resources`

Rules: breaking changes -> new major version. Additive changes -> same version. Deprecate over 2+ versions before removal. Document sunset dates.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Verbs in URLs | `/createOrder` breaks REST model | Nouns only |
| 200 for errors | Clients cannot distinguish success/failure | Correct status codes |
| No pagination | Unbounded responses fail at scale | Paginate all lists |
| No request ID | Cannot trace errors across systems | Include request_id |
| Breaking changes without version | Breaks existing clients | Version and deprecate |

---

## Field Notes

- Status codes are a contract. 401 means "not authenticated" - never use it for "not allowed."
- Pagination is not optional. Unbounded lists become weapons at scale.
- Error details without a request ID are untraceable. Include the ID.
- Version in the URL is simple and explicit. Header versioning is elegant but invisible.
