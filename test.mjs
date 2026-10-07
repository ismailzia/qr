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
