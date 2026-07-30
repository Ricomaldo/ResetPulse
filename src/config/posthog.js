// src/config/posthog.js
// Clé publique PostHog (phc_...). null = analytics reste no-op.
// PAS de dotenv/@env ici (interdit — crash worklets SDK 55).
export const POSTHOG_API_KEY = 'phc_BJa3kmuZF3ECCcA7wZWZZHqQZBEQeiqyNg8QgYqa6Htf'; // projet ResetPulse (compte Eric, 30/07/2026)
export const POSTHOG_HOST = 'https://eu.i.posthog.com'; // instance EU (RGPD)
