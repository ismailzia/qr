# Link to QR

Paste a link, get a QR code that opens it. Or switch to **Contact**, type a name and a phone number, and get a code that adds you to the phone that scans it. Static pages, no build step, no server: the code is drawn in the browser and nothing you type leaves it.

Live: https://ismailzia.github.io/qr/ and an example contact page at https://ismailzia.github.io/qr/card/

## Files

| File | What it does |
|---|---|
| `index.html`, `style.css` | The main page |
| `app.js` | Draws the code, handles the Link / Contact switch, download, copy, share and paste |
| `link.js` | Decides what a link code should carry (adds `https://` to a bare domain) |
| `vcard.js` | Builds the contact text (vCard 3.0) that phones open with "Add contact" |
| `card/` | One person's contact page: `index.html` and `details.js` (their details) |
| `card-page.js`, `card-page.css` | The code and the look shared by every contact page |
| `test.mjs` | Checks `link.js` and `vcard.js` |
| `qrcode.js` | [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 by Kazuhiko Arase, MIT, unchanged |
| `fonts/` | Rubik (latin, variable), SIL Open Font License, see `fonts/OFL.txt` |

## Two kinds of contact code

- **Contact code** (the Contact switch on the main page): the details sit inside the code itself. Nothing to host, but it cannot be changed after printing, and more details make a denser code.
- **Contact page** (`card/`): a small web page with a photo, a **Save contact** button, and one-tap rows for call, WhatsApp, email, website, Instagram, TikTok, LinkedIn, Facebook and a map. Print a QR code of the page's address. You can edit the page any time and the printed code keeps working, because the address inside it does not change.

## Make a contact page for a new person

1. Copy the `card` folder and give the copy a short name without spaces, for example `omar`. It must sit next to `card`, not inside it.
2. Open `omar/details.js` and replace the details. Leave a field as `""` to hide it. Keep the quotes and the commas.
3. For a photo, put a square picture in the folder (for example `photo.jpg`) and set `photo: "photo.jpg"`. Without one, the card shows the initials. For another card colour, set `color: "#0f5c5a"`.
4. In `omar/index.html`, edit the three lines under the comment near the top (the title and the two `og:` lines). They are what shows when the link is shared in WhatsApp.
5. Push to `main`. A minute later the page is live at `https://ismailzia.github.io/qr/omar/`.
6. Open the main page, keep **Link** selected, paste that address and download the code to print.

Phone numbers need the country code (`+212...`), or the WhatsApp row will not open the right chat.

The pages block inline scripts and styles (see the `Content-Security-Policy` line in each `index.html`), so details go in `details.js`, never in a `<script>` inside the page.

## Run it

```bash
python -m http.server 4173
```

Then open http://localhost:4173. The page uses ES modules, so it needs a server; opening the file directly does not work.

```bash
node test.mjs
```

## Good to know

- The code holds the link (or the contact) itself. It never expires, and it cannot be changed after printing. A contact page is the way around that.
- PNG is 1200 px or a little more, with the white margin the QR standard asks for. Use SVG for large prints.
- Error correction is level M.
