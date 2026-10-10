// The contact page (card/index.html). The person's details come from window.CARD in card/details.js.
import { toTarget } from "./link.js";
import { buildVCard, fullName } from "./vcard.js";

const C = window.CARD;
const $ = (id) => document.getElementById(id);

const ICONS = {
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  whatsapp: '<path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-2z"/>',
  email: '<rect x="3" y="5" width="18" height="14"/><path d="m3 7 9 6 9-6"/>',
  website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 2.5 2.3 4.2 5 4.5"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  facebook: '<rect x="3" y="3" width="18" height="18"/><path d="M15 8h-1.5A1.5 1.5 0 0 0 12 9.5V21M9.5 13H15"/>',
  address: '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
};

const name = fullName(C);
const role = [C.title, C.org].filter((part) => part && part !== name).join(" · ");
const website = toTarget(C.website || "")?.text; // adds https:// to a bare domain
const pageUrl = C.pageUrl || location.origin + location.pathname;
const handle = (value) => value.trim().replace(/^@/, "");
const bare = (url) => url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
const dial = (value) => value.replace(/[^\d+]/g, "");
const profiles = [
  C.instagram && { key: "instagram", label: "Instagram", value: `@${handle(C.instagram)}`, href: `https://instagram.com/${handle(C.instagram)}` },
  C.tiktok && { key: "tiktok", label: "TikTok", value: `@${handle(C.tiktok)}`, href: `https://www.tiktok.com/@${handle(C.tiktok)}` },
  C.linkedin && { key: "linkedin", label: "LinkedIn", value: bare(C.linkedin), href: C.linkedin },
  C.facebook && { key: "facebook", label: "Facebook", value: bare(C.facebook), href: C.facebook },
].filter(Boolean);
const rows = [
  C.phone && { key: "phone", label: "Appeler", value: C.phone, href: `tel:${dial(C.phone)}` },
  C.whatsapp && { key: "whatsapp", label: "WhatsApp", value: "Envoyer un message", href: `https://wa.me/${dial(C.whatsapp).replace(/^\+|^00/, "")}` },
  C.email && { key: "email", label: "E-mail", value: C.email, href: `mailto:${C.email}` },
  website && { key: "website", label: "Site web", value: bare(website), href: website },
  ...profiles,
  C.address && {
    key: "address",
    label: "Adresse",
    value: C.address,
    href: C.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.address)}`,
  },
].filter(Boolean);

// Dark text on a light card colour, white on a dark one (WCAG relative luminance).
function inkOn(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#111113" : "#fff";
}

// The photo for the saved contact: a small square JPEG, so the file stays light.
function photoData() {
  const img = $("avatar").querySelector("img");
  if (!img?.naturalWidth) return null;
  const crop = Math.min(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(crop, 400);
  canvas
    .getContext("2d")
    .drawImage(img, (img.naturalWidth - crop) / 2, (img.naturalHeight - crop) / 2, crop, crop, 0, 0, canvas.width, canvas.height);
  return { type: "JPEG", base64: canvas.toDataURL("image/jpeg", 0.85).split(",")[1] };
}

function flash(button, text) {
  button.dataset.label ??= button.textContent;
  button.textContent = text;
  $("status").textContent = text;
  setTimeout(() => (button.textContent = button.dataset.label), 1600);
}

document.title = C.org && C.org !== name ? `${name} · ${C.org}` : name;
$("name").textContent = name;
$("role").textContent = role;
$("bio").textContent = C.bio;
$("bio").hidden = !C.bio;

if (/^#[0-9a-f]{6}$/i.test(C.color)) {
  $("face").style.setProperty("--brand", C.color);
  $("face").style.setProperty("--on-brand", inkOn(C.color));
}

if (C.photo) {
  const img = new Image();
  img.alt = "";
  img.src = C.photo;
  $("avatar").append(img);
} else {
  $("avatar").textContent = ((C.first || "")[0] ?? "") + ((C.last || "")[0] ?? "") || name[0];
}

for (const row of rows) {
  const li = document.createElement("li");
  li.innerHTML = `<a><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[row.key]}</svg><span><b></b><small></small></span><svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></a>`;
  const a = li.firstChild;
  a.href = row.href;
  if (/^https?:/.test(row.href)) Object.assign(a, { target: "_blank", rel: "noopener noreferrer" });
  li.querySelector("b").textContent = row.label;
  li.querySelector("small").textContent = row.value;
  $("rows").append(li);
}

$("save").addEventListener("click", () => {
  const vcf = buildVCard({
    ...C,
    url: website,
    note: C.bio,
    photo: photoData(),
    links: [...profiles.map((p) => ({ label: p.label, url: p.href })), { label: "Card", url: pageUrl }],
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
  a.download = `${name.replace(/[^\p{L}\p{N}]+/gu, "-")}.vcf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 40000); // iPhones ask before saving, so keep it a while
  flash($("save"), "Fichier téléchargé");
});

$("share").addEventListener("click", async () => {
  try {
    if (navigator.share) await navigator.share({ title: name, text: role, url: pageUrl });
    else {
      await navigator.clipboard.writeText(pageUrl);
      flash($("share"), "Lien copié");
    }
  } catch {
    // the share sheet was closed, or copying was refused
  }
});

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
const qr = qrcode(0, "M");
qr.addData(pageUrl);
qr.make();
$("qr").src = qr.createDataURL(8, 32); // 8 px per module, 4 modules of white margin
