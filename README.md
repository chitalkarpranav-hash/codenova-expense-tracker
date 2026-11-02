# Ledgerly Expense Tracker

A responsive full-stack expense tracker built with React, Vite, Tailwind CSS, Express, and MongoDB. Track income and expenses, see totals calculated from persisted transactions, and remove entries from the dashboard.

## Requirements

- Node.js 18.18 or newer
- npm 9 or newer
- MongoDB running locally, or a MongoDB connection string

## Get started

1. Make sure MongoDB is running. In development without a `.env` file, the server uses `mongodb://127.0.0.1:27017/expense-tracker`.
2. To use a different MongoDB instance, copy `.env.example` to `.env` and set `MONGODB_URI`.
3. From the repository root, install dependencies and start both apps:

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to the Express server at `http://localhost:5000`.

## Production

```bash
npm run build
npm start
```

Set `NODE_ENV=production` and configure `PORT` and `MONGODB_URI`. Production requires an explicit database URI; the Express server serves the built frontend from `client/dist` as well as the API.

## Deploy to Render

The root `render.yaml` defines a Render Blueprint web service that builds the frontend and serves it from Express. Push this repository to GitHub, then in Render choose **New → Blueprint** and select the repository and branch. During setup, set `MONGODB_URI` to a MongoDB Atlas connection string; the value is intentionally not stored in this repository. Add the Render service's hostname to the Atlas network access list as appropriate. Render provides `PORT` automatically, and `/api/health` is configured as the service health check.

## API

All responses use JSON except successful transaction deletion, which returns `204 No Content`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/transactions` | List transactions, newest date first |
| `POST` | `/api/transactions` | Create a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `GET` | `/api/transactions/summary` | Return income, expense, and balance totals |
| `GET` | `/api/health` | Check API availability |

Create a transaction with:

```json
{
  "title": "Weekly groceries",
  "amount": 68.5,
  "type": "expense",
  "category": "Food & Dining",
  "date": "2026-11-02T12:00:00.000Z"
}
```

The amount must be a finite number greater than zero. Title and category are required; type must be `income` or `expense`; date must be parseable as a valid date. Invalid requests return `400` with a `message` and field-specific `errors`. Unknown transaction IDs return `404`.

## Configuration

`.env.example` lists the supported server settings:

- `PORT` — API port (default `5000`)
- `MONGODB_URI` — MongoDB connection string
- `CLIENT_URL` — reserved for deployments that serve the frontend separately
- `NODE_ENV` — set to `production` to serve the built client
