import { Suspense } from 'react'
import { RegisterCard } from '@/app/components/ui/register-card'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterCard />
    </Suspense>
  )
}
