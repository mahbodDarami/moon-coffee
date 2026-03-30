'use client'

import { useEffect, useRef } from 'react'
import { initGoogleMaps, importLibrary, parsePlace, type ParsedAddress } from '@/lib/google-places'

interface Props {
  onSelect: (parsed: ParsedAddress) => void
  className?: string
}

export default function AddressAutocomplete({ onSelect, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    let mounted = true
    let el: google.maps.places.PlaceAutocompleteElement | null = null

    async function init() {
      if (!containerRef.current) return
      initGoogleMaps()
      await importLibrary('places')

      if (!mounted || !containerRef.current) return

      // Access via global namespace — PlaceAutocompleteElement is not in PlacesLibrary type
      el = new google.maps.places.PlaceAutocompleteElement({ types: ['address'] })
      containerRef.current.appendChild(el)

      el.addEventListener('gmp-placeselect', async (event: Event) => {
        const place = (event as google.maps.places.PlaceAutocompletePlaceSelectEvent).place
        try {
          await place.fetchFields({ fields: ['addressComponents', 'location', 'id'] })
          onSelectRef.current(parsePlace(place))
        } catch {
          // place fetch failed — user can fill fields manually
        }
      })
    }

    init()

    return () => {
      mounted = false
      if (el && containerRef.current?.contains(el)) {
        containerRef.current.removeChild(el)
      }
    }
  }, [])

  return <div ref={containerRef} className={className ?? 'addr-pac-wrap'} />
}
