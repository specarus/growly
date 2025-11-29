# Growly

Growly is a Next.js 16 + React 19 application connected to Neon via Prisma (using `@prisma/adapter-neon`) and styled with Tailwind CSS v4.

## Getting started

1. Copy the example environment variables into `.env.local` and provide the required Neon credentials plus any auth secrets.
2. Run `npm install` to download dependencies.
3. Generate the Prisma client once with `npm run generate`.
4. Use `npm run dev` to work in development, `npm run build` for production builds, and `npm start` to serve the built output.

## Structure overview

- `app/` holds the Next.js routes and React UI, with `app/dashboard` focusing on the habits dashboard.
- `prisma/schema.prisma` defines the data model for Neon.
- Configuration files include `tailwind.config.ts`, `eslint.config.mjs`, and `next.config.ts`.

## Notes

- Keep the Prisma schema and the Neon migrations aligned whenever you change models.
- The repo is marked `private`, so it is intended for internal deployment or preview builds.
