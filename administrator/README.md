# FastStore administrator

The administrator console is a Vite, React, and Tailwind application backed by the FastStore API.

## Local development

1. Copy `.env.example` to `.env`.
2. Set `VITE_BACKEND_ENDPOINT` to the API URL including `/api`.
3. Run `npm install` and `npm run dev`.

The API must allow the administrator frontend origin in `CORS_ORIGINS`. Administrator access and refresh tokens are kept in the separate HTTP-only admin cookies issued by `/api/admin/auth`.

## Validation

- `npm run lint`
- `npm run build`
