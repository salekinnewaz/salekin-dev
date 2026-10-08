#!/usr/bin/env bash
# Provision a Turso database, push the Prisma schema, and seed it.
# Requires: `turso auth login` already completed by the user.
#
# Usage:  pnpm turso:bootstrap
#
# Side effects:
#   - Creates a Turso DB named "salekin-dev" in the closest region
#   - Creates a non-expiring auth token for it
#   - Writes .env.local with TURSO_DATABASE_URL + TURSO_AUTH_TOKEN + DATABASE_URL
#   - Pushes the Prisma schema and seeds it
#
# Prints the resulting TURSO_DATABASE_URL + TURSO_AUTH_TOKEN to stdout so
# they can be copy-pasted into the Vercel dashboard env vars.

set -euo pipefail
cd "$(dirname "$0")/.."

DB_NAME="salekin-dev"

if ! command -v turso >/dev/null 2>&1; then
  echo "✗ turso CLI not found. Install: brew install tursodatabase/tap/turso" >&2
  exit 1
fi

if ! turso auth whoami >/dev/null 2>&1; then
  echo "✗ Not logged in to Turso. Run: turso auth login" >&2
  exit 1
fi

echo "→ Ensuring Turso database '$DB_NAME' exists..."
if ! turso db show "$DB_NAME" >/dev/null 2>&1; then
  REGION=$(turso db locations --json 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['code'])" 2>/dev/null \
    || echo "lhr")
  echo "  Region: $REGION"
  turso db create "$DB_NAME" --location "$REGION" --enable-extensions
else
  echo "  (already exists)"
fi

URL=$(turso db show "$DB_NAME" --url)
echo "  URL: $URL"

echo "→ Creating non-expiring token..."
TOKEN=$(turso db tokens create "$DB_NAME" --expiration none 2>&1 | tail -1)
if [[ -z "$TOKEN" || "$TOKEN" == *"error"* ]]; then
  echo "✗ Token creation failed: $TOKEN" >&2
  exit 1
fi

echo "→ Pushing schema to Turso..."
TURSO_DATABASE_URL="$URL" TURSO_AUTH_TOKEN="$TOKEN" pnpm db:push:turso

echo "→ Seeding..."
TURSO_DATABASE_URL="$URL" TURSO_AUTH_TOKEN="$TOKEN" pnpm db:seed:turso

echo
echo "✓ Done. Copy these into Vercel → Settings → Environment Variables (Production):"
echo
echo "  TURSO_DATABASE_URL=$URL"
echo "  TURSO_AUTH_TOKEN=$TOKEN"
echo "  DATABASE_URL=file:./dev.db"
echo "  SITE_URL=https://salekin.dev"
echo
echo "After setting them, redeploy with:  pnpm deploy"
