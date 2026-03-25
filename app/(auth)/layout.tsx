import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moon Coffee — Account',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        {children}
      </div>
    </div>
  )
}
