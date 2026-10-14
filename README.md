# אוטו תכל׳ס · Auto Tachles

An independent map of discounted AutoTel cars in Tel Aviv–Yafo.

- Hebrew by default, English toggle, and saved language preference
- Right-to-left Hebrew interface
- Filter cars by `dynp_dis` (50%, 30%, 20%, or all discounts)
- Leaflet map with OpenStreetMap tiles
- Walking directions and optional browser geolocation
- Manual refresh and automatic refresh every 60 seconds while the tab is visible

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

The standalone source uses Next.js, React, and TypeScript. It does not need a ChatGPT Sites account or a database.

## Data and maps

`app/api/vehicles/route.ts` fetches the public AutoTel endpoint on the server:

```text
https://autotelpublicapiprod.gototech.co/api/FreeVehicles/vFlatDynp?Zoom=11&longitude=34.7818&latitude=32.08535&requestType=5
```

Vehicles are read from the `a2B` array. Only cars with a positive `dynp_dis` and valid coordinates are returned to the client. The default view selects exactly `dynp_dis = 50`.

No AutoTel credential is configured. Upstream availability and access may change. A successful initial request does not guarantee availability from every hosting provider. The UI reports request failures rather than presenting fabricated vehicles.

There is currently **no server rate limiter or refresh cooldown**. Each tab prevents overlapping requests, but separate visitors can send separate requests. Consider shared caching and rate limiting before running a high-traffic deployment.

Map tiles load from `https://tile.openstreetmap.org/` and retain OpenStreetMap attribution. Review the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) for your deployment. Leaflet is bundled in `public/vendor` with its license. UI fonts load from Google Fonts. Directions open Google Maps; the app itself does not book cars.

## Deployment

Run on a hosting service supporting a Next.js server and outbound HTTPS. Static-only hosting is insufficient because `/api/vehicles` is a server route.

The existing hosted edition was built with ChatGPT Sites/Vinext. This repository contains a standalone Next.js edition of the application, without private Sites identity or deployment credentials. Publishing this repository does not automatically change or redeploy the existing Sites edition.

## Status

The Sites edition has passed TypeScript and build checks. The standalone Next.js edition also passes dependency installation, TypeScript checks, and a production build. Live AutoTel data loading has failed in the Sites local preview even though a direct API test succeeded.

## License and attribution

Application code: MIT (see `LICENSE`). Leaflet: BSD-2-Clause (see `public/vendor/LEAFLET-LICENSE`). Other dependencies retain their own licenses. Map data, tiles, and AutoTel data are not covered by this project's MIT license.

This project is independent and is not affiliated with or endorsed by AutoTel. Confirm discounts and availability in the official AutoTel app before booking.
