import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moon Coffee — Account',
}

// Auth pages manage their own full-screen layout (sign-in has its own bg + card).
// This layout is intentionally transparent — no wrapper div.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
