# Hello One — GitHub Pages Frontend

Mobile-first, event-only UI inspired by the reference images.

## Files
- `index.html` — app structure and screens
- `style.css` — purple UI, cards, ticket views, bottom navigation
- `app.js` — screen navigation, search/category filters, sample event cards, ticket UI

## Deploy to GitHub Pages
1. Upload all three files to the root of your `hello-one` repository.
2. Open **Settings → Pages**.
3. Under Build and deployment, choose **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`, then Save.
5. Wait for the Pages URL shown on that screen.

## Important backend note
This is a frontend starter. Events are sample data and My Tickets starts empty. It does not process payments or create real bookings. Before live use, confirm your Apps Script API contract, authentication, CORS and JSON response format. Then set `CONFIG.appsScriptUrl` and implement the matching request/response actions. Do not claim payment or booking success until the backend confirms it.

## Replace sample events
Edit `sampleEvents` in `app.js`. Each event uses:
`id, title, category, date (YYYY-MM-DD), time, location, venue, price, image, description, featured, status`.

For images, use a public HTTPS image URL in `image`.

## Ticket QR
The QR-like pattern is deliberately labeled as an illustration and is not a valid/scannable ticket QR. Replace it with a real QR rendered from a backend-issued ticket token or URL.
