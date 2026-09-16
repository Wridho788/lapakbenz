# lapakBenz

**Vehicle marketplace and community platform for Indonesian automotive communities and UMKM**

lapakBenz is a React SPA that combines a vehicle marketplace, event discovery, and community/merchant onboarding in one application — built for automotive communities, UMKM (small businesses), and other Indonesian community groups to sell, host events, and connect in one place.

Live: [lapakbenz.com](https://lapakbenz.com) · Demo: [lapakbenzz.vercel.app](https://lapakbenzz.vercel.app/)

---

## Features

**Marketplace**
- Product catalog, product detail, cart, and checkout
- Order tracking, order history, and invoices
- Wishlist and wallet (points, refund history)
- Voucher redemption

**Merchants & Partners**
- Merchant registration
- Partner/store pages and detail views

**Community & Events**
- Event listings and event detail pages
- Public registration flow

**Platform**
- Authentication (login, register, OTP verification, password reset)
- Notifications with filtering
- Live chat
- Push notifications (OneSignal)
- Installable PWA

---

## Tech Stack

- **React 19** + **TypeScript**, bundled with **Vite**
- **React Router v7** for routing
- **TanStack Query (React Query)** for server state, **Zustand** for client state
- **Axios** for API access, with hooks/types organized per domain (product, cart, order, event, voucher, wishlist, shipping, partner)
- **Tailwind CSS** for styling
- **react-helmet-async** for per-route meta tags
- **OneSignal** for push notifications
- **vite-plugin-pwa** for PWA support

## Architecture Notes

lapakBenz is a client-rendered SPA, which normally means search engines and social platforms only see an empty HTML shell. To solve this without moving to a server-rendered framework, the project includes a custom static-generation pipeline (`scripts/generate-static.mjs`) that pre-renders per-route HTML with the correct `<title>`, description, and Open Graph tags for every product, event, and merchant page before deploy.

```bash
npm run dev          # start dev server
npm run build         # production build
npm run build:seo     # generate pre-rendered SEO HTML, then build
npm run preview        # preview the production build
```
