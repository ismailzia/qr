# Link to QR

Paste a link, get a QR code that opens it. One static page, no build step, no server: the code is drawn in the browser and the link never leaves it.

## Files

| File | What it does |
|---|---|
| `index.html`, `style.css` | The page |
| `app.js` | Draws the code, handles download, copy, share and paste |
| `link.js` | Decides what the code should carry (adds `https://` to a bare domain) |
| `test.mjs` | Checks `link.js` |
| `qrcode.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 by Kazuhiko Arase, MIT, unchanged |
| `fonts/` | Bricolage Grotesque (latin, variable), SIL Open Font License, see `fonts/OFL.txt` |

## Run it

```bash
python -m http.server 4173
```

Then open http://localhost:4173. The page uses ES modules, so it needs a server; opening the file directly does not work.

```bash
node test.mjs
```

## Good to know

- The code holds the link itself. It never expires, and it cannot be changed after printing.
- PNG is 1200 px or a little more, with the white margin the QR standard asks for. Use SVG for large prints.
- Error correction is level M.
