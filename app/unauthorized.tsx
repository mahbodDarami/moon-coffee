import Link from 'next/link'

export default function Unauthorized() {
  return (
    <div className="shop-page" style={{ textAlign: 'center', paddingTop: '20vh' }}>
      <h1 className="shop-title">401 — Unauthorized</h1>
      <p style={{ color: 'var(--cream)', marginBottom: '2rem' }}>
        You need to sign in to access this page.
      </p>
      <Link href="/login" className="cart-checkout-btn" style={{ display: 'inline-block' }}>
        Sign In
      </Link>
    </div>
  )
}
