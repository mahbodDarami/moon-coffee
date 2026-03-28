'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Coffee } from 'lucide-react'
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

        {/* ── Wooden CTA button ── */}
        <button
          className="mpc-add-btn"
          onClick={handleBtnClick}
          aria-label={`Customize and add ${item.name} to cart`}
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A.996.996 0 0 0 21.42 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span className="mpc-btn-text">Customize &amp; Add</span>
        </button>
      </div>
    )
  }
)

MenuPageCard.displayName = 'MenuPageCard'
export default MenuPageCard
