// Builds a vCard 3.0 contact, the format phones open with "Add contact".
// Used by the contact code on the main page and by the contact page (card-page.js).

const clean = (value) => String(value ?? "").trim();
// vCard text must escape backslash, comma, semicolon and line breaks.
const esc = (value) => clean(value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
const dial = (value) => clean(value).replace(/[^\d+]/g, "");

// Long lines continue on the next line after a space.
// ponytail: counts characters, the standard counts bytes. Phones read both.
function fold(line) {
  let out = line.slice(0, 75);
  for (let i = 75; i < line.length; i += 74) out += "\r\n " + line.slice(i, i + 74);
  return out;
}

/** The name a phone shows for the contact: the person, else the company. */
export function fullName(c) {
  return [clean(c.prefix), clean(c.first), clean(c.last)].filter(Boolean).join(" ") || clean(c.org);
}

/**
 * c = {
 *   prefix, first, last, org, title, phone, whatsapp, email, url, address, note,
 *   links: [{ label, url }],          // extra profiles (Instagram, LinkedIn...)
 *   photo: { type: "JPEG", base64 }   // only for downloaded .vcf files, far too big for a QR code
 * }
 * Empty fields are skipped. Returns "" when there is no name and no company.
 * Pass { fold: false } for a QR code: shorter text, smaller code.
 */
export function buildVCard(c, { fold: folded = true } = {}) {
  const name = fullName(c);
  if (!name) return "";

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${esc(c.last)};${esc(c.first)};;${esc(c.prefix)};`, `FN:${esc(name)}`];
  if (clean(c.org)) lines.push(`ORG:${esc(c.org)}`);
  if (clean(c.title)) lines.push(`TITLE:${esc(c.title)}`);
  if (dial(c.phone)) lines.push(`TEL;TYPE=CELL:${dial(c.phone)}`);
  if (dial(c.whatsapp) && dial(c.whatsapp) !== dial(c.phone)) lines.push(`TEL;TYPE=CELL,WhatsApp:${dial(c.whatsapp)}`);
  if (clean(c.email)) lines.push(`EMAIL;TYPE=INTERNET:${clean(c.email)}`);
  if (clean(c.url)) lines.push(`URL:${clean(c.url)}`);
  for (const link of c.links ?? []) {
    if (clean(link?.url)) lines.push(`URL;TYPE=${esc(link.label || "Profile").replace(/\s+/g, "")}:${clean(link.url)}`);
  }
  if (clean(c.address)) lines.push(`ADR;TYPE=WORK:;;${esc(c.address)};;;;`);
  if (clean(c.note)) lines.push(`NOTE:${esc(c.note)}`);
  if (c.photo?.base64) lines.push(`PHOTO;ENCODING=b;TYPE=${c.photo.type || "JPEG"}:${c.photo.base64}`);
  lines.push("END:VCARD");

  return (folded ? lines.map(fold) : lines).join("\r\n");
}
