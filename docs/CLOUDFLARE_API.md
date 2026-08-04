# Cloudflare API: guided starting point

The portfolio now has two layers:

1. Astro builds the pages, images, styles, and browser scripts into `dist/`.
2. The Cloudflare Worker handles requests whose paths begin with `/api/`.

The portfolio is deployed at `https://jamesrivera.dev`. The current Ask interface has not been connected to an LLM yet.

## The mental model

Think of the Worker as a receptionist in front of the homelab:

- The browser asks the receptionist a question.
- The receptionist checks that the request is valid and safe.
- Later, the receptionist will forward it through Cloudflare Access and Tunnel.
- The homelab LLM answers.
- The receptionist returns that answer to the browser.

The browser must never receive the homelab credentials.

## Files to know

- `wrangler.jsonc` tells Cloudflare what to build and where the static website lives.
- `worker/index.ts` contains the API routes.
- `worker-configuration.d.ts` is generated from `wrangler.jsonc`; do not edit it manually.
- `public/_headers` adds basic browser security headers to the deployed website.

## Run it locally

```powershell
npm run dev:cloudflare
```

This builds Astro and starts the Cloudflare development server. It does not require a Cloudflare login.

Open the local address printed by Wrangler, then test:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
```

Expected result:

```json
{
  "ok": true,
  "service": "james-rivera-portfolio-api",
  "llm": "not-configured"
}
```

Test the Ask placeholder:

```powershell
$body = @{ question = "What kind of work does James do?" } | ConvertTo-Json
Invoke-RestMethod http://localhost:8787/api/ask -Method Post -ContentType "application/json" -Body $body
```

It deliberately returns HTTP 503 and `LLM_NOT_CONFIGURED`. That means validation and routing work; the homelab connection is the next lesson.

Press `Ctrl+C` to stop the local server.

## Useful commands

```powershell
npm run dev
```

Frontend-only Astro development with fast reload.

```powershell
npm run cf:types
```

Regenerate Cloudflare binding types after changing `wrangler.jsonc`.

```powershell
npm run check:cloudflare
```

Build Astro, confirm generated types are current, and perform a deployment dry run.

```powershell
npm run deploy:cloudflare
```

Builds and deploys the current project to `jamesrivera.dev`. Run the validation command first because this updates the live website.

## What comes next

The next phase will add a private, non-secret `LLM_BASE_URL` setting and Cloudflare Access credentials stored as Worker secrets. The placeholder in `/api/ask` will then become a streamed request to the homelab. Rate limiting and analytics come after the connection works.
