const SCHEME = /^[a-z][a-z0-9+-]*:(?!\d{1,5}(\/|$))/i; // the lookahead keeps "host:8080" out
const DOMAIN = /^[^\s/?#@]+\.[^\s/?#@.]{2,}([/?#:]\S*)?$/;
const ACTIONS = /^(wifi|mailto|tel|sms|smsto):/i; // phones act on these even with spaces or short numbers
const INVISIBLE = /[\u200b\u200e\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/g; // marks that ride along with copied links

/**
 * What the QR code should carry for whatever was typed or pasted.
 * Returns null for empty input, else { text, isLink }.
 */
export function toTarget(raw) {
  const text = raw.replace(INVISIBLE, "").trim();
  if (!text) return null;
  if (ACTIONS.test(text)) return { text, isLink: true };
  if (!/\s/.test(text)) {
    if (SCHEME.test(text)) return { text, isLink: true }; // https:, and any other app link
    // ponytail: naive "looks like a domain" check, so "file.pdf" becomes a link too.
    // Upgrade path: a public-suffix list, if that ever matters.
    if (DOMAIN.test(text)) return { text: `https://${text}`, isLink: true };
  }
  return { text, isLink: false };
}
