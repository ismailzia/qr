const SCHEME = /^[a-z][a-z0-9+-]*:(?!\d{1,5}(\/|$))/i; // the lookahead keeps "host:8080" out
const DOMAIN = /^[^\s/?#@]+\.[^\s/?#@.]{2,}([/?#:]\S*)?$/;

/**
 * What the QR code should carry for whatever was typed or pasted.
 * Returns null for empty input, else { text, isLink }.
 */
export function toTarget(raw) {
  const text = raw.trim();
  if (!text) return null;
  if (!/\s/.test(text)) {
    if (SCHEME.test(text)) return { text, isLink: true }; // https:, mailto:, tel:, WIFI:
    // ponytail: naive "looks like a domain" check, so "file.pdf" becomes a link too.
    // Upgrade path: a public-suffix list, if that ever matters.
    if (DOMAIN.test(text)) return { text: `https://${text}`, isLink: true };
  }
  return { text, isLink: false };
}
