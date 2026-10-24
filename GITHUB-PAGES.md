# Flo Assessment hosting

This repository contains the assessment, its shared design system and API code.
GitHub Pages publishes **only** the static assessment frontend.

## One-time setup

1. In this repository's **Settings → Pages**, choose **GitHub Actions** as the source.
2. Run the **Publish Flo Assessment** workflow, or push to `main`.
3. Publish the latest version of the existing Replit app as an **Autoscale**
   app (not Static). The backend must remain running for scoring and Airtable.

The workflow points the frontend at `https://vending-lead-magnet.replit.app`.
This is a public API URL, not a credential. If the backend's published URL changes,
update `VITE_API_BASE_URL` in the workflow and rebuild.

## How submissions work

GitHub Pages → HTTPS POST to the Replit submission endpoint → Airtable →
existing PostgreSQL backup → results returned to the assessment.

The API allows the `https://christastephens.github.io` origin on the submission
endpoint. A custom frontend domain requires updating that allowlist and
republishing the backend. Airtable credentials stay in Replit's managed connector,
never in the static build or GitHub Actions.

If the backend is offline or saving fails, the assessment displays an error
instead of showing a successful result. A frontend-only deployment cannot write
securely to Airtable by itself.

## Local static build

```sh
pnpm install --frozen-lockfile
NODE_ENV=production PORT=5173 BASE_PATH=/The-Flo-Assessment/ \
  VITE_API_BASE_URL=https://vending-lead-magnet.replit.app \
  pnpm --filter @workspace/tymflo-client-assistant run build
node scripts/prepare-pages.mjs
```

Only `artifacts/tymflo-client-assistant/dist/public` should be uploaded to Pages.
Route entry documents support direct legal-page visits and reloads.
