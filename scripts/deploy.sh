#!/usr/bin/env bash
# Deploy the current commit to Vercel production.
#
# Uses the Vercel CLI directly (not git-driven) because the Vercel
# account isn't connected to the GitHub repo yet. Connecting GitHub
# requires a one-time browser step in the Vercel dashboard (Settings
# → Git → Connect GitHub account). Until that's done, this script is
# the manual-but-fast path: 1 line in a terminal, ~1 minute later the
# production URL is updated.
#
# Requirements:
#   - npm i -g vercel
#   - vercel login  (one-time; opens a browser)
#   - vercel link   (one-time; creates the project)
#
# Usage:
#   pnpm deploy        # alias added below
#   ./scripts/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# Sanity: refuse to run if the working tree is dirty, so we deploy a
# known commit and don't surprise the user with a half-built state.
if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "Working tree is dirty. Commit or stash first." >&2
  git status --short
  exit 1
fi

SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "→ Deploying ${SHA} to production..."

vercel deploy --yes --target production

echo
echo "✓ Done. URL: https://salekin-dev.vercel.app"
