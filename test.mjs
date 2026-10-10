// Run: node test.mjs
import assert from "node:assert/strict";
import { toTarget } from "./link.js";

const link = (text) => ({ text, isLink: true });
const plain = (text) => ({ text, isLink: false });

const cases = [
  ["", null],
  ["   ", null],
  ["https://example.com/a?b=1#c", link("https://example.com/a?b=1#c")],
  ["  HTTP://Example.com  ", link("HTTP://Example.com")],
  ["instagram.com/yourname", link("https://instagram.com/yourname")],
  ["www.site.co.ma", link("https://www.site.co.ma")],
  ["tiktok.com/@user", link("https://tiktok.com/@user")],
  ["example.com:8080/x", link("https://example.com:8080/x")],
  ["192.168.1.5:3000", link("https://192.168.1.5:3000")],
  ["mailto:a@b.com", link("mailto:a@b.com")],
  ["tel:0612345678", link("tel:0612345678")],
  ["tel:+212612345678", link("tel:+212612345678")],
  ["tel:112", link("tel:112")],
  ["WIFI:T:WPA;S:My Net;P:x;;", link("WIFI:T:WPA;S:My Net;P:x;;")],
  ["mailto:a@b.com?subject=Hello there", link("mailto:a@b.com?subject=Hello there")],
  ["\u202ahttps://example.com\u200b", link("https://example.com")],
  ["https://example.com/my page", plain("https://example.com/my page")],
  ["user@example.com", plain("user@example.com")],
  ["localhost:3000", plain("localhost:3000")],
  ["hello world", plain("hello world")],
  ["note: buy milk", plain("note: buy milk")],
  ["v1.2", plain("v1.2")],
];

for (const [input, expected] of cases) {
  assert.deepEqual(toTarget(input), expected, JSON.stringify(input));
}
console.log(`ok, ${cases.length} cases`);

// vcard.js
const { buildVCard, fullName } = await import("./vcard.js");

assert.equal(buildVCard({}), "");
assert.equal(buildVCard({ phone: "0612345678", email: "a@b.com" }), "", "no name, no company: no card");
assert.equal(fullName({ first: " Sara ", last: "Benali", org: "Studio Atlas" }), "Sara Benali");
assert.equal(fullName({ org: "Studio Atlas" }), "Studio Atlas");

assert.equal(
  buildVCard({
    first: "Sara",
    last: "Benali",
    org: "Atlas; Design, Co",
    title: " ",
    phone: "+212 6 12-34-56-78",
    whatsapp: "+212612345678",
    email: " sara@example.com ",
    url: "https://example.com",
    links: [{ label: "Instagram", url: "https://instagram.com/sara" }, null],
    address: "12 Example Street\nOujda",
    note: "back\\slash",
  }),
  [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Benali;Sara;;;",
    "FN:Sara Benali",
    "ORG:Atlas\\; Design\\, Co",
    "TEL;TYPE=CELL:+212612345678", // the same WhatsApp number is not listed twice
    "EMAIL;TYPE=INTERNET:sara@example.com",
    "URL:https://example.com",
    "URL;TYPE=Instagram:https://instagram.com/sara",
    "ADR;TYPE=WORK:;;12 Example Street\\nOujda;;;;",
    "NOTE:back\\\\slash",
    "END:VCARD",
  ].join("\r\n"),
);

const long = { first: "Sara", note: "x".repeat(200) };
const folded = buildVCard(long).split("\r\n");
assert.ok(folded.every((line) => line.length <= 75), "folded lines stay within 75");
assert.equal(buildVCard(long).replace(/\r\n /g, ""), buildVCard(long, { fold: false }), "unfolding gives the same card");
assert.ok(buildVCard({ prefix: "Dr", first: "A", last: "B" }).includes("N:B;A;;Dr;\r\nFN:Dr A B"));
assert.ok(buildVCard({ first: "A", phone: "1", whatsapp: "2" }).includes("TEL;TYPE=CELL,WhatsApp:2"));
console.log("ok, vcard");
