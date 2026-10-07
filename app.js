import { toTarget } from "./link.js";

const QUIET = 4; // modules of white margin the QR spec asks for
const PNG_SIZE = 1200; // smallest edge of the downloaded PNG, in pixels

const $ = (id) => document.getElementById(id);
const stage = $("stage");
const form = $("form");
const input = $("link");
const hint = $("hint");
const svg = $("qr");
const path = $("qr-path");
const target = $("target");
const status = $("status");
const buttons = { png: $("png"), svg: $("svg"), copy: $("copy"), share: $("share"), paste: $("paste") };

const frame = { d: path.getAttribute("d"), box: svg.getAttribute("viewBox") };
const hintText = hint.textContent;
let code = null; // { text, isLink, qr, size } while a QR is on screen

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

function encode(text) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make(); // throws when the text does not fit in the largest QR
  return qr;
}

function pathFor(qr) {
  const n = qr.getModuleCount();
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c)) continue;
      let run = 1;
      while (c + run < n && qr.isDark(r, c + run)) run++;
      d += `M${c + QUIET},${r + QUIET}h${run}v1h-${run}z`;
      c += run - 1;
    }
  }
  return d;
}

function render() {
  const wanted = toTarget(input.value);
  let state = "empty";
  let note = hintText;
  code = null;
  if (wanted) {
    try {
      const qr = encode(wanted.text);
      code = { ...wanted, qr, size: qr.getModuleCount() + QUIET * 2 };
      state = "ready";
      if (!wanted.isLink) note = "No link in there, so phones will show it as plain text.";
    } catch {
      state = "error";
      note = "That is too long for a QR code. Try a shorter link.";
    }
  }

  const changed = stage.dataset.state !== state;
  stage.dataset.state = state;
  svg.setAttribute("viewBox", code ? `0 0 ${code.size} ${code.size}` : frame.box);
  svg.setAttribute("aria-label", code ? `QR code for ${code.text}` : "No QR code yet");
  path.setAttribute("d", code ? pathFor(code.qr) : frame.d);

  target.textContent = code ? code.text : "";
  if (code && /^https?:\/\//i.test(code.text)) target.href = code.text;
  else target.removeAttribute("href");

  hint.textContent = note;
  hint.classList.toggle("is-error", state === "error");
  if (state === "error") input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
  for (const name of ["png", "svg", "copy", "share"]) buttons[name].disabled = !code;
  if (changed) status.textContent = state === "ready" ? "QR code ready." : state === "error" ? note : "";
}

function pngBlob() {
  const scale = Math.ceil(PNG_SIZE / code.size);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = code.size * scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  const n = code.qr.getModuleCount();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (code.qr.isDark(r, c)) ctx.fillRect((c + QUIET) * scale, (r + QUIET) * scale, scale, scale);
    }
  }
  // Synchronous on purpose: Safari only lets share() run straight from the tap.
  const base64 = canvas.toDataURL("image/png").split(",")[1];
  return new Blob([Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0))], { type: "image/png" });
}

function svgBlob() {
  const s = code.size;
  const markup =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${PNG_SIZE}" height="${PNG_SIZE}" shape-rendering="crispEdges">` +
    `<path fill="#fff" d="M0,0h${s}v${s}h-${s}z"/><path d="${path.getAttribute("d")}"/></svg>`;
  return new Blob([markup], { type: "image/svg+xml" });
}

function fileName(ext) {
  const slug = code.text
    .replace(/^[a-z][a-z0-9+-]*:\/*/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .toLowerCase();
  return `qr-${slug || "code"}.${ext}`;
}

function save(blob, ext) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName(ext);
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function flash(button, text) {
  const label = button.textContent;
  button.textContent = text;
  status.textContent = text;
  setTimeout(() => (button.textContent = label), 1600);
}

// On a phone the code sits below the form, so bring it into view.
function reveal() {
  if (!code) return;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  stage.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "nearest" });
}

input.addEventListener("input", render);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (matchMedia("(pointer: coarse)").matches) input.blur(); // closes the phone keyboard
  reveal();
});

buttons.png.addEventListener("click", () => save(pngBlob(), "png"));
buttons.svg.addEventListener("click", () => save(svgBlob(), "svg"));

if (navigator.clipboard?.readText) {
  buttons.paste.hidden = false;
  buttons.paste.addEventListener("click", async () => {
    try {
      input.value = await navigator.clipboard.readText();
      render();
      reveal();
    } catch {
      input.focus(); // clipboard access refused: paste by hand
    }
  });
}

if (navigator.clipboard?.write && window.ClipboardItem) {
  buttons.copy.hidden = false;
  buttons.copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob() })]);
      flash(buttons.copy, "Copied");
    } catch {
      flash(buttons.copy, "Not copied");
    }
  });
}

if (navigator.canShare?.({ files: [new File([], "qr.png", { type: "image/png" })] })) {
  buttons.share.hidden = false;
  buttons.share.addEventListener("click", async () => {
    const file = new File([pngBlob()], fileName("png"), { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "QR code" });
    } catch {
      // the share sheet was closed
    }
  });
}

render();
if (matchMedia("(pointer: fine)").matches) input.focus();
