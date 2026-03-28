'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, ShoppingBag } from 'lucide-react'
import type { MenuItem } from '@/types'

interface MenuPageCardProps {
  item: MenuItem
}

const MenuPageCard = React.forwardRef<HTMLDivElement, MenuPageCardProps>(
  ({ item }, ref) => {
    const router = useRouter()

    function handleClick() {
      router.push(`/menu/${item.slug}`)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        router.push(`/menu/${item.slug}`)
      }
    }

    function handleBtnClick(e: React.MouseEvent) {
      e.stopPropagation()
      router.push(`/menu/${item.slug}`)
    }

    return (
      <div
        ref={ref}
        className="mpc"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View ${item.name}`}
      >
        {/* ── Portrait image ── */}
        <div className="mpc-img-wrap">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="mpc-img" />
          ) : (
            <div className="mpc-img-placeholder">
              <Coffee size={52} strokeWidth={1} />
              <span className="mpc-img-placeholder-label">Photo coming soon</span>
            </div>
          )}
          <div className="mpc-img-gradient" />
        </div>

        {/* ── Body — overlaps image ── */}
        <div className="mpc-body">
          <div className="mpc-info-row">
            <div className="mpc-info-left">
              <h3 className="mpc-name">{item.name}</h3>
              {item.description && (
                <p className="mpc-desc">{item.description}</p>
              )}
            </div>
            <span className="mpc-price">${(item.price / 100).toFixed(2)}</span>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="mpc-tags">
              {item.tags.map((tag) => (
                <span key={tag} className="mpc-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── Full-width CTA button ── */}
        <button
          className="mpc-add-btn"
          onClick={handleBtnClick}
          aria-label={`Customize and add ${item.name} to cart`}
        >
          <ShoppingBag size={13} strokeWidth={1.5} />
          <span>Customize &amp; Add</span>
        </button>
      </div>
    )
  }
)

MenuPageCard.displayName = 'MenuPageCard'
export default MenuPageCard
