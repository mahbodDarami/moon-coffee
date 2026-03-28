'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { addToCart } from '@/app/actions/cart'
import { getGuestCart, setGuestCart } from './MenuOverlay'
import QuantitySelector from './QuantitySelector'
import type { MenuItemWithOptions, MenuCategory, ProductOptionGroupWithOptions, SelectedOption } from '@/types'

interface MenuItemDetailProps {
  item: MenuItemWithOptions
  categories: MenuCategory[]
}

export default function MenuItemDetail({ item, categories }: MenuItemDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const contentRef = useRef<HTMLDivElement>(null)

  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [selections, setSelections] = useState<Record<string, SelectedOption[]>>(() => {
    // Initialize with defaults
    const defaults: Record<string, SelectedOption[]> = {}
    for (const group of item.option_groups) {
      const defaultOpts = group.product_options.filter((o) => o.is_default)
      if (defaultOpts.length > 0) {
        defaults[group.id] = defaultOpts.map((o) => ({
          optionId: o.id,
          groupName: group.name,
          optionName: o.name,
          priceModifier: o.price_modifier,
        }))
      }
    }
    return defaults
  })
  const [textValues, setTextValues] = useState<Record<string, string>>({})

  const category = categories.find((c) => c.id === item.category_id)

  // Entrance animation
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.from('.md-back', { x: -20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 })
      gsap.from('.md-header', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 })
      gsap.from('.md-options', { y: 40, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.3 })
      gsap.from('.md-footer', { y: 30, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.45 })
    }, el)
    return () => ctx.revert()
  }, [])

  function handleSelect(group: ProductOptionGroupWithOptions, optionId: string) {
    const option = group.product_options.find((o) => o.id === optionId)
    if (!option) return

    setSelections((prev) => {
      const sel: SelectedOption = {
        optionId: option.id,
        groupName: group.name,
        optionName: option.name,
        priceModifier: option.price_modifier,
      }

      if (group.type === 'single_select') {
        return { ...prev, [group.id]: [sel] }
      }

      // multi_select — toggle
      const existing = prev[group.id] || []
      const has = existing.find((s) => s.optionId === optionId)
      if (has) {
        return { ...prev, [group.id]: existing.filter((s) => s.optionId !== optionId) }
      }
      return { ...prev, [group.id]: [...existing, sel] }
    })
  }

  function isSelected(groupId: string, optionId: string) {
    return (selections[groupId] || []).some((s) => s.optionId === optionId)
  }

  // Calculate total price
  const optionModifiers = Object.values(selections)
    .flat()
    .reduce((sum, s) => sum + s.priceModifier, 0)
  const unitPrice = item.price + optionModifiers
  const totalPrice = unitPrice * quantity

  async function handleAddToCart() {
    setAdding(true)

    // Combine selections + text values
    const allOptions: { optionId: string; value?: string }[] = []
    for (const opts of Object.values(selections)) {
      for (const o of opts) {
        allOptions.push({ optionId: o.optionId })
      }
    }
    // Add text options
    for (const group of item.option_groups) {
      if (group.type === 'text' && textValues[group.id]?.trim()) {
        const textOpt = group.product_options[0]
        if (textOpt) {
          allOptions.push({ optionId: textOpt.id, value: textValues[group.id].trim() })
        }
      }
    }

    if (user) {
      await addToCart(item.id, quantity, allOptions.length > 0 ? allOptions : undefined)
    } else {
      const cart = getGuestCart()
      const selectedOptions: SelectedOption[] = Object.values(selections).flat()
      // Add text values
      for (const group of item.option_groups) {
        if (group.type === 'text' && textValues[group.id]?.trim()) {
          const textOpt = group.product_options[0]
          if (textOpt) {
            selectedOptions.push({
              optionId: textOpt.id,
              groupName: group.name,
              optionName: textOpt.name,
              priceModifier: 0,
              value: textValues[group.id].trim(),
            })
          }
        }
      }
      cart.push({ itemId: item.id, quantity, selectedOptions })
      setGuestCart(cart)
    }

    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="md-page" ref={contentRef}>
      <button className="md-back" onClick={() => router.back()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Menu
      </button>

      <div className="md-layout">
        {/* Left: image or decorative area */}
        <div className="md-visual">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="md-image" />
          ) : (
            <div className="md-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            </div>
          )}
        </div>

        {/* Right: details + options */}
        <div className="md-details">
          <div className="md-header">
            {category && <p className="md-category">{category.name}</p>}
            <h1 className="md-name">{item.name}</h1>
            {item.description && <p className="md-desc">{item.description}</p>}
            {item.tags && item.tags.length > 0 && (
              <div className="md-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="mp-card-tag">{tag}</span>
                ))}
              </div>
            )}
            <p className="md-base-price">
              Starting at <span>${(item.price / 100).toFixed(2)}</span>
            </p>
          </div>

          {/* Option groups */}
          <div className="md-options">
            {item.option_groups.map((group) => (
              <div key={group.id} className="md-opt-group">
                <div className="md-opt-header">
                  <h3 className="md-opt-title">{group.name}</h3>
                  {group.is_required && <span className="md-opt-req">Required</span>}
                  {group.type === 'multi_select' && (
                    <span className="md-opt-hint">Select multiple</span>
                  )}
                </div>

                {group.type === 'text' ? (
                  <textarea
                    className="md-opt-text"
                    placeholder={`Enter your ${group.name.toLowerCase()}...`}
                    value={textValues[group.id] || ''}
                    onChange={(e) =>
                      setTextValues((prev) => ({ ...prev, [group.id]: e.target.value }))
                    }
                    maxLength={200}
                    rows={2}
                  />
                ) : (
                  <div className="md-opt-choices">
                    {group.product_options.map((option) => (
                      <button
                        key={option.id}
                        className={`md-opt-choice${isSelected(group.id, option.id) ? ' selected' : ''}`}
                        onClick={() => handleSelect(group, option.id)}
                      >
                        <span className="md-opt-choice-name">{option.name}</span>
                        {option.price_modifier !== 0 && (
                          <span className="md-opt-choice-mod">
                            {option.price_modifier > 0 ? '+' : ''}${(option.price_modifier / 100).toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer: quantity + add to cart */}
          <div className="md-footer">
            <div className="md-footer-qty">
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>
            <button
              className={`md-add-btn${added ? ' added' : ''}`}
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? 'Adding...' : added ? 'Added to Cart!' : `Add to Cart — $${(totalPrice / 100).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
