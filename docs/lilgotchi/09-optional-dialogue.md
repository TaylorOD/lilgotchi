# lilgotchi optional dialogue

The original clone has optional AI personality dialogue. Restoring that feature is part of full upstream functionality, even though ordinary pet care must work without it.

## Original behavior

Inventory the pinned source's dialogue triggers, prompt context, personality mapping, busy state, settings and visible response presentation. Preserve their sequence and map Slice and Cyberpunk identities to appropriate personalities without changing care outcomes.

Record the original provider settings from the pinned source before implementation. Provider availability can change independently of the game, so the adapter must not tie the engine to one model name.

## Widget integration

Offer an optional host supplied dialogue callback. The iframe sends a validated request through the shell. The shell invokes the callback and returns plain text. Keep provider code and credentials outside the core game bundle.

The callback receives only the fields needed for the pet's dialogue context. It must not receive browser saves, host page content or other site data. Treat the response as text and enforce a length limit. Closing, changing families or restarting invalidates pending requests so an old reply cannot appear on another pet.

The default install makes no AI requests. A site can add its own server endpoint and provider configuration. Publish a separate example with request validation, timeouts, rate limits and a spending limit. Never embed a site owner's provider secret in the client.

## Settings and failure behavior

Keep the original dialogue enablement flow recognizable, with host configuration replacing the original raw API key field. This settings change is an explicit integration difference. Clearly label when dialogue is unavailable because no adapter is configured.

Network errors show a small retryable state and leave pet care playable. Do not replay requests on every animation frame. Dialogue responses never grant food, happiness or other state changes unless the original source explicitly does so and parity tests confirm it.

## Acceptance

Use a deterministic fake adapter to test every original trigger and visible state. Test delayed replies, timeouts, cancellation, malformed replies and family changes. Run a separately configured provider integration once credentials and hosting exist. Core gameplay must pass with the adapter absent.

Full feature parity remains incomplete until the adapter and original trigger coverage are implemented. Installing the core widget must never require paid dialogue.
