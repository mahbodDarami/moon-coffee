# Moon Coffee

> Specialty coffee. Sourced with care. Served with intention.

A full-stack coffee shop web application built with Next.js, Supabase, and deployed on Vercel.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first, `globals.css`) |
| Animations | GSAP 3 + ScrollTrigger, Framer Motion, Lenis |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Deployment | Vercel |

## Project Structure

```
app/
├── (auth)/          # Login, Register, Forgot/Reset password
├── (shop)/          # Account, Cart, Checkout, Orders
├── actions/         # Server Actions (auth, cart, menu, orders, profile)
├── api/auth/        # OAuth callback + signout route handlers
├── components/      # UI components (Nav, Hero, Footer, etc.)
├── hooks/           # useCart, useGuestCart
└── globals.css      # All styles — vanilla CSS classes only

lib/supabase/        # Server, client, and admin Supabase clients
types/               # Auto-generated DB types + re-exported aliases
public/
├── images/          # logo.png, signin-bg.jpg, story-bg.jpg
└── videos/          # hero.mp4, portafilter.mp4, coffee-mix.mp4
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Live

[moon-coffee-next.vercel.app](https://moon-coffee-next.vercel.app)
