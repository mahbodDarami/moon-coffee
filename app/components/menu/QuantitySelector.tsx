'use client'

interface QuantitySelectorProps {
  quantity: number
  onChange: (qty: number) => void
  min?: number
  max?: number
}

export default function QuantitySelector({ quantity, onChange, min = 1, max = 99 }: QuantitySelectorProps) {
  return (
    <div className="qty-selector">
      <button
        className="qty-btn"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        &minus;
      </button>
      <span className="qty-value">{quantity}</span>
      <button
        className="qty-btn"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
