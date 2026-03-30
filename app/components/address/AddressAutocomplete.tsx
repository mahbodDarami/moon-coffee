'use client'

import { useEffect, useRef, useState } from 'react'
import { getLoader, importLibrary, parsePlace, type ParsedAddress } from '@/lib/google-places'

interface Props {
  onSelect: (parsed: ParsedAddress) => void
  placeholder?: string
  className?: string
}

export default function AddressAutocomplete({ onSelect, placeholder = 'Start typing your address…', className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null

    async function init() {
      if (!inputRef.current) return
      getLoader() // initialise with API key
      await importLibrary('places')
      autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'geometry', 'place_id'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete!.getPlace()
        if (place?.address_components) {
          onSelect(parsePlace(place))
        }
      })
      setReady(true)
    }

    init()

    return () => {
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete)
    }
  }, [onSelect])

  return (
    <input
      ref={inputRef}
      type="text"
      className={className ?? 'addr-autocomplete-input'}
      placeholder={placeholder}
      disabled={!ready && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      autoComplete="off"
    />
  )
}
