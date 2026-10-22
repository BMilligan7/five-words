# Five Words

A photo-feedback app for collecting first impressions. Upload a photo, share its individual feedback link, and invite people to choose exactly five descriptive words. The owner reviews word counts and individual responses; respondents see only their own response.

This portfolio snapshot was developed with AI coding assistance. It contains application source and synthetic test fixtures, with fresh history and no original photos, feedback records, credentials, or deployment configuration. It does not connect to an existing hosted instance.

## Features

- Separate private photo collections without accounts.
- Photo upload, removal, and revocable feedback links.
- A shuffled descriptor picker, additional choices, and custom words.
- Exactly five selections per response, editable on a return visit.
- Response aggregation and collection recovery links.

## Run locally

Requires Node.js 22.13 or later. The app uses React, TypeScript, Vinext/Vite, and Cloudflare local D1/R2 emulation. No AI provider key or Cloudflare account is required for local use.

```sh
npm ci
npm run build
npm run db:local
npm run start -- --port 5174
```

Open `http://127.0.0.1:5174`. Each checkout starts with an empty local database and storage. Runtime files stay in ignored local directories. For development, use `npm run dev -- --port 5174` after building and initializing the local database.

## Verify

```sh
npm run typecheck
npm run lint
npm run build
# With the local app running on port 5174:
npm run test:integration -- http://127.0.0.1:5174
```

The integration checks create a synthetic image and disposable local feedback records, then remove them. They reject non-localhost targets. They cover upload, collection isolation and recovery, five-word validation, private responses, response edits, and link revocation.

## Data and limits

Collection recovery links grant management access. Individual feedback links grant access to one photo and can be revoked. Browser cookies reduce repeat responses; response counts do not identify distinct people. Clearing browser data without saving a collection link loses that browser's access.

Original hosting integration and legacy account-data migration are omitted from this standalone version. Production hosting requires your own storage, deployment configuration, and operational review.

Third-party license notices are retained in `vendor/`. No additional license grant for original application code is implied by publication.
