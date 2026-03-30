# ShieldWave

AI-native insurance brokerage for home services contractors, starting with pressure washing companies. Takes a contractor from landing page → 8-question intake → real-time carrier quotes → payment → bound policy → COI delivered, all in under 10 minutes.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express (ESM)
- **Database:** PostgreSQL via Supabase
- **Payments:** Stripe (SetupIntents for payment method collection)
- **Primary Carrier:** Coterie Insurance API (GL/BOP instant quote + bind)
- **Multi-Carrier Fallback:** Bold Penguin API
- **Workers Comp:** Pie Insurance API
- **Email:** Resend (COI delivery, renewal reminders)
- **Storage:** AWS S3 (COI PDFs)

## Project Structure

```
packages/
  frontend/          React + Vite + Tailwind
    src/
      pages/         Landing, GetQuote, Quotes, Checkout, Success
      lib/           API client
      components/    Shared components
  backend/           Express API server
    src/
      routes/        API route handlers
      services/      Business logic (field mapper, carrier router, Coterie client, Stripe, COI, email)
      db/            Supabase client + SQL migrations
      middleware/     Error handling, validation
      config/        Environment config
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys

# Run database migration
# Execute packages/backend/src/db/migrations/001_initial_schema.sql in your Supabase SQL editor

# Start development servers (frontend + backend)
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3001`.

## API Routes

| Method | Path                  | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | /api/health           | Health check                         |
| POST   | /api/quotes           | Submit intake → get carrier quotes   |
| POST   | /api/bind             | Bind selected quote → create policy  |
| POST   | /api/coi              | Add certificate holder               |
| POST   | /api/payment/setup    | Create Stripe SetupIntent            |
| POST   | /api/webhooks/stripe  | Stripe webhook handler               |

## Carrier Routing ("Laddering")

The system always finds a path to coverage:

1. **Tier 1 — Coterie:** Instant API quotes for GL and BOP (parallel). Response in <90 seconds.
2. **Tier 2 — Bold Penguin:** Multi-carrier rater fallback (biBERK, Nationwide, Travelers, Liberty Mutual).
3. **Tier 3 — Manual/Wholesale:** If both decline, queue for specialty review with 24–48 hour turnaround.

## Key Design Decisions

- **Niche intake, generic output:** Frontend asks pressure-washing-specific questions. Backend translates to ACORD-standard carrier fields.
- **Never hold premium dollars:** Payment flows from customer card → carrier via Stripe token or carrier gateway.
- **Producer code attribution:** Every carrier API call includes the agency's producer code for commission tracking.
- **COI is the retention loop:** Certificate holder management keeps contractors coming back.

## Environment Variables

See `.env.example` for the full list of required configuration.
