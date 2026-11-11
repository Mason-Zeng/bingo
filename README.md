# bingo

A 5×5 "find someone who…" bingo card built with React + Vite. Works on desktop and mobile.

- Tap a square, enter a person's name, and the square is crossed out.
- The center square is FREE.
- Blackout rules: BINGO only when every square on the board has a name.
- The 🌐 button switches all UI text between English and Simplified Chinese (names are left as typed).
- Progress and language are saved in the browser (localStorage).

## Run

```sh
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

To test on a phone on the same Wi-Fi: `npm run dev -- --host`, then open the printed Network URL.

## Customize the squares

Edit [src/squares.js](src/squares.js). Each square has an `en` and a `zh` string. Index 12 is the FREE space.
UI labels are in [src/i18n.js](src/i18n.js).
