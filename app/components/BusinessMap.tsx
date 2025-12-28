'use client'

import { useEffect, useState, useRef } from 'react'

export default function BusinessMap({ 
  latitude, 
  longitude, 
  businessName 
}: { 
  latitude: number
  longitude: number
  businessName: string 
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Prevent double initialization
    if (mapInstanceRef.current) return

    let mounted = true

    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
      import('leaflet/dist/leaflet.css')
    ]).then(([reactLeafletModule, L]) => {
      if (!mounted) return

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Create the map instance directly
      if (mapContainerRef.current && !mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map)

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup(businessName)

        mapInstanceRef.current = map
        setIsLoaded(true)
      }
    })

    return () => {
      mounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, businessName])

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100"
    >
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
    </div>
  )
}
