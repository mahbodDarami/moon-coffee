'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { MenuCategory, MenuItem } from '@/types'
import MenuPageCard from '@/app/components/ui/MenuPageCard'

gsap.registerPlugin(ScrollTrigger)

interface MenuPageProps {
  categories: MenuCategory[]
  items: MenuItem[]
}

export default function MenuPage({ categories, items }: MenuPageProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  const filteredItems = activeCategory
    ? items.filter((item) => item.category_id === activeCategory)
    : items

  // Hero entrance animation
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const ctx = gsap.context(() => {
      gsap.from('.mp-hero-label', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.1,
      })
      gsap.from('.mp-hero-heading', {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.25,
      })
      gsap.from('.mp-hero-sub', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.45,
      })
    }, hero)

    return () => ctx.revert()
  }, [])

  // Card stagger animation on filter change
  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length === 0) return

    gsap.fromTo(cards,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.6, ease: 'power3.out',
        stagger: 0.06, overwrite: true,
      }
    )
  }, [activeCategory, filteredItems.length])

  function handleCategoryChange(catId: string | null) {
    setActiveCategory(catId)
    cardsRef.current = []
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Group items by category for "All" view
  const categoryMap = new Map<string, { name: string; items: MenuItem[] }>()
  if (!activeCategory) {
    for (const cat of categories) {
      const catItems = items.filter((i) => i.category_id === cat.id)
      if (catItems.length > 0) {
        categoryMap.set(cat.id, { name: cat.name, items: catItems })
      }
    }
  }

  let cardIndex = 0

  return (
    <div className="mp">

      {/* Hero */}
      <div className="mp-hero" ref={heroRef}>
        <div className="mp-hero-overlay" />
        <div className="mp-hero-content">
          <p className="mp-hero-label">Explore</p>
          <h1 className="mp-hero-heading">Our Menu</h1>
          <p className="mp-hero-sub">Handcrafted drinks &amp; freshly baked treats, made with love</p>
        </div>
      </div>

      {/* Sticky category nav */}
      <div className="mp-cats">
        <div className="mp-cats-inner">
          <button
            className={`mp-cat${!activeCategory ? ' active' : ''}`}
            onClick={() => handleCategoryChange(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`mp-cat${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu content */}
      <div className="mp-body">
        {!activeCategory ? (
          // Grouped by category
          Array.from(categoryMap.entries()).map(([catId, { name, items: catItems }]) => (
            <div key={catId} className="mp-section">
              <h2 className="mp-section-title">{name}</h2>
              <div className="mp-grid" ref={gridRef}>
                {catItems.map((item) => {
                  const idx = cardIndex++
                  return (
                    <MenuPageCard
                      key={item.id}
                      item={item}
                      ref={(el) => { cardsRef.current[idx] = el }}
                    />
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          // Single category
          <div className="mp-grid" ref={gridRef}>
            {filteredItems.map((item, i) => (
              <MenuPageCard
                key={item.id}
                item={item}
                ref={(el) => { cardsRef.current[i] = el }}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
