// src/config/posthog.js
// Clé publique PostHog (phc_...). null = analytics reste no-op.
// PAS de dotenv/@env ici (interdit — crash worklets SDK 55).
export const POSTHOG_API_KEY = null;
export const POSTHOG_HOST = 'https://eu.i.posthog.com'; // instance EU (RGPD)
