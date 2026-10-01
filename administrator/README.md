# FastStore administrator

The administrator console is a Vite, React, and Tailwind application backed by the FastStore API.

## Local development

1. Copy `.env.example` to `.env`.
2. Set `VITE_BACKEND_ENDPOINT` to the API URL including `/api`.
3. Run `npm install` and `npm run dev`.

The API must allow the administrator frontend origin in `CORS_ORIGINS`. Administrator access and refresh tokens are kept in the separate HTTP-only admin cookies issued by `/api/admin/auth`.

## Production session settings

For the current cross-site deployment, configure the Render API with:

- `ADMIN_CLIENT_URL=https://admin.fast-store.skirill.org`
- `CORS_ORIGINS` containing `https://admin.fast-store.skirill.org` and any shopper frontend origins
- `NODE_ENV=production` (Render is also detected through its `RENDER=true` environment setting)

Configure the administrator build with `VITE_BACKEND_ENDPOINT=https://fast-store-api.onrender.com/api`. Deploy the backend before redeploying the administrator frontend because the backend issues the secure partitioned cookies.

## Validation

- `npm run lint`
- `npm run build`
