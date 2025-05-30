"use client"

import { useEffect, useRef } from "react"

interface Charity {
  id: string
  name: string
  description: string
  category: string
  address: string
  latitude: number
  longitude: number
  logo_url: string | null
  verified: boolean
  follower_count: number
  phone: string | null
  email: string | null
  website_url: string | null
}

interface MapViewProps {
  charities: Charity[]
  selectedCharity: Charity | null
  onCharitySelect: (charity: Charity | null) => void
}

export function MapView({ charities, selectedCharity, onCharitySelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // For now, we'll show a placeholder map
    // In a real implementation, you would integrate with Google Maps API
    if (mapRef.current && !mapInstanceRef.current) {
      initializeMap()
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers()
    }
  }, [charities])

  const initializeMap = () => {
    // Placeholder map implementation
    // In production, you would use Google Maps JavaScript API
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
          <div class="text-center p-8">
            <div class="text-6xl mb-4">🗺️</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
            <p class="text-gray-600 mb-4">Google Maps integration would be implemented here</p>
            <div class="grid grid-cols-2 gap-4 max-w-md">
              ${charities
                .slice(0, 4)
                .map(
                  (charity) => `
                <div class="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow" 
                     onclick="selectCharity('${charity.id}')">
                  <div class="font-medium text-sm">${charity.name}</div>
                  <div class="text-xs text-gray-500">${charity.category}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `

      // Add click handlers for charity selection
      window.selectCharity = (charityId: string) => {
        const charity = charities.find((c) => c.id === charityId)
        if (charity) {
          onCharitySelect(charity)
        }
      }
    }
  }

  const updateMarkers = () => {
    // In a real implementation, this would update map markers
    if (mapRef.current) {
      const charityElements = mapRef.current.querySelectorAll('[onclick^="selectCharity"]')
      charityElements.forEach((element, index) => {
        if (charities[index]) {
          const charity = charities[index]
          element.className = `bg-white p-3 rounded-lg shadow-sm cursor-pointer transition-shadow ${
            selectedCharity?.id === charity.id ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-md"
          }`
        }
      })
    }
  }

  return (
    <div ref={mapRef} className="w-full h-full">
      {/* Map will be rendered here */}
    </div>
  )
}
