import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export { importLibrary }

export type ParsedAddress = {
  street_address: string
  apartment: string
  city: string
  state: string
  postal_code: string
  country: string
  lat: number | null
  lng: number | null
  place_id: string
}

let initialized = false

export function initGoogleMaps(): void {
  if (initialized) return
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    v: 'weekly',
  })
  initialized = true
}

export function parsePlace(place: google.maps.places.PlaceResult): ParsedAddress {
  const get = (type: string, short = false) => {
    const comp = place.address_components?.find((c) => c.types.includes(type))
    return comp ? (short ? comp.short_name : comp.long_name) : ''
  }

  const streetNumber = get('street_number')
  const route = get('route')
  const street_address = [streetNumber, route].filter(Boolean).join(' ')

  return {
    street_address,
    apartment: '',
    city: get('locality') || get('sublocality') || get('postal_town') || '',
    state: get('administrative_area_level_1', true),
    postal_code: get('postal_code'),
    country: get('country', true),
    lat: place.geometry?.location?.lat() ?? null,
    lng: place.geometry?.location?.lng() ?? null,
    place_id: place.place_id ?? '',
  }
}
