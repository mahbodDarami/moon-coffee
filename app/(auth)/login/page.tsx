'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SignInCard } from '@/app/components/ui/sign-in-card'

function LoginInner() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''
  return <SignInCard redirectTo={redirectTo} />
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}
