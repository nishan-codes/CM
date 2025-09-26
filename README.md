This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Tokens and Paddle

- Anonymous users receive a `uid` cookie via `middleware.ts` used to track token balances.
- Token storage uses Supabase table `token_balances` with columns: `uid text primary key`, `balance integer not null default 0`.
- API routes:
  - `GET /api/tokens/balance` — returns `{ uid, balance }`.
  - `POST /api/tokens/checkout` — returns Paddle checkout payload. Requires env.
  - `POST /api/tokens/webhook` — credits tokens on successful payment events. Configure your Paddle webhook to point here.
- Searches consume tokens before calling external APIs. Cost is `terms.length * resultsPerTerm` tokens.

### Environment Variables

Create `.env.local` with:

```
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Paddle v2
PADDLE_ENVIRONMENT=sandbox
PADDLE_VENDOR_ID=your_vendor_id
PADDLE_CLIENT_TOKEN=client_token_from_backend_or_console
NEXT_PUBLIC_PADDLE_PRICE_ID=price_abc123

# Map price ids to token amounts for webhook crediting
PADDLE_PRICE_TOKEN_MAP=price_abc123=100,price_def456=500
```

### Supabase Schema

Run this SQL in Supabase:

```sql
create table if not exists token_balances (
  uid text primary key,
  balance integer not null default 0
);
```

