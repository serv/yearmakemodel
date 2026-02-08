This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) (recommended) or npm/yarn/pnpm

## Database Setup

This project uses PostgreSQL. You can start a local instance using Docker Compose:

```bash
docker compose up -d
```

This will start a PostgreSQL container on `localhost:5432`.

## Getting Started

First, ensure your environment variables are set up in a `.env` file. For local development with Docker:

```env
DATABASE_URL="postgres://postgres:password@localhost:5432/car_forum"
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

