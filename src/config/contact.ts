/**
 * Public contact-form configuration.
 *
 * These values are shipped to the browser by design. Never add the Turnstile
 * secret or a Formspree API key here; the Turnstile secret belongs in
 * Formspree's CAPTCHA settings and must stay server-side.
 */
export const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/mqpprqkw';
export const CONTACT_FORM_SUBJECT = 'New message from tianma.dev';

/** Public site key for the existing Cloudflare Turnstile widget. */
export const CONTACT_TURNSTILE_SITE_KEY = '0x4AAAAAAF60uGq-UMXW0hg-';
export const CONTACT_TURNSTILE_ACTION = 'contact';

/** A submission faster than this is treated as bot traffic. */
export const CONTACT_MIN_FILL_TIME_MS = 3000;

export const CONTACT_MAX_NAME_LENGTH = 100;
export const CONTACT_MAX_EMAIL_LENGTH = 254;
export const CONTACT_MAX_MESSAGE_LENGTH = 5000;
