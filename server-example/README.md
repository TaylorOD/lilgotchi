# Optional server example

`route.mjs` is a framework neutral route core. It does not start a server or call a provider. Supply `authorize` and `provider` yourself. Provider secrets belong in server environment configuration only.

Before deployment, add HTTPS, your framework route, an authenticated session, CSRF protection, an exact allowed origin, a 2048 byte request body limit before JSON parsing and safe response headers. Return only the route status and optional body. Do not expose exception messages.

The sample permits one request per user every ten seconds. It reserves the full configured worst case cost before calling the provider and never refunds that reservation. Set the reservation from your provider pricing and enforce its input and output limits. The request count and spending caps apply to one process lifetime. They reset on restart. Replace the in memory counters with atomic durable shared counters before public or multiple instance deployment. Also configure a provider account spending cap. The example is not a production spending guarantee.

Use an adapter that honors AbortSignal and limits output to 60 tokens. Keep model selection on the server. A provider may still bill work after cancellation. No real provider integration has been run. Hosting, credentials, pricing checks and an authenticated integration test are still required.

This folder is deliberately outside the public static build. Never copy it or environment files into public hosting.
