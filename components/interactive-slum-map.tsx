"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

interface SlumData {
  slNo: string
  slumName: string
  townName: string
  population: number
  households: number
  redevelopmentScore?: number
  rank?: number
  lat?: number
  lng?: number
  tapPoints: number
  latrinesFlush: number
  latrinesPit: number
  pavedRoads: number
  electricityDomestic: number
}

interface InteractiveSlumMapProps {
  slums: SlumData[]
  selectedSlum: SlumData | null
  onSlumSelect: (slum: SlumData) => void
  mapView: "satellite" | "street" | "terrain"
}

declare global {
  interface Window {
    L: any
  }
}

export default function InteractiveSlumMap({ slums, selectedSlum, onSlumSelect, mapView }: InteractiveSlumMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Load CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const cssLink = document.createElement("link")
          cssLink.rel = "stylesheet"
          cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          cssLink.crossOrigin = ""
          document.head.appendChild(cssLink)
        }

        // Load JS
        if (!window.L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          script.crossOrigin = ""

          script.onload = () => {
            setIsMapLoaded(true)
          }

          script.onerror = () => {
            setMapError("Failed to load map library")
          }

          document.head.appendChild(script)
        } else {
          setIsMapLoaded(true)
        }
      } catch (error) {
        setMapError("Error loading map")
        console.error("Error loading Leaflet:", error)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return

    try {
      // Initialize map centered on Bangalore
      const map = window.L.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
        zoomControl: false,
      })

      // Add custom zoom control
      window.L.control
        .zoom({
          position: "topright",
        })
        .addTo(map)

      // Add tile layers based on view
      const getTileLayer = (view: string) => {
        switch (view) {
          case "satellite":
            return window.L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                attribution:
                  '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
              },
            )
          case "terrain":
            return window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
              attribution:
                'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            })
          default:
            return window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            })
        }
      }

      const tileLayer = getTileLayer(mapView)
      tileLayer.addTo(map)

      mapInstanceRef.current = map

      // Add custom controls
      const customControl = window.L.Control.extend({
        onAdd: (map: any) => {
          const div = window.L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom")
          div.style.backgroundColor = "rgba(31, 41, 55, 0.9)"
          div.style.padding = "8px"
          div.style.borderRadius = "8px"
          div.innerHTML = `
            <div style="color: white; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
              Bangalore Slums
            </div>
            <div style="color: #9CA3AF; font-size: 10px;">
              ${slums.length} locations mapped
            </div>
          `
          return div
        },
      })

      new customControl({ position: "topleft" }).addTo(map)
    } catch (error) {
      setMapError("Failed to initialize map")
      console.error("Error initializing map:", error)
    }
  }, [isMapLoaded, mapView])

  // Update tile layer when mapView changes
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove existing tile layers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer._url) {
        mapInstanceRef.current.removeLayer(layer)
      }
    })

    // Add new tile layer
    const getTileLayer = (view: string) => {
      switch (view) {
        case "satellite":
          return window.L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            },
          )
        case "terrain":
          return window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          })
        default:
          return window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          })
      }
    }

    const tileLayer = getTileLayer(mapView)
    tileLayer.addTo(mapInstanceRef.current)
  }, [mapView])

  // Add markers for slums
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    slums.forEach((slum) => {
      if (!slum.lat || !slum.lng) return

      const score = slum.redevelopmentScore || 0
      const getMarkerColor = (score: number) => {
        if (score > 75) return "#EF4444" // red
        if (score >= 60) return "#F97316" // orange
        return "#10B981" // green
      }

      const getMarkerSize = (score: number) => {
        if (score > 75) return 12
        if (score >= 60) return 10
        return 8
      }

      const color = getMarkerColor(score)
      const size = getMarkerSize(score)

      // Create custom icon
      const customIcon = window.L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: ${size * 2}px;
            height: ${size * 2}px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            ${slum.rank}
          </div>
        `,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      })

      const marker = window.L.marker([slum.lat, slum.lng], { icon: customIcon })

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1F2937;">
            ${slum.slumName}
          </div>
          <div style="color: #6B7280; font-size: 12px; margin-bottom: 8px;">
            ${slum.townName}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
            <div>
              <span style="color: #6B7280;">Rank:</span>
              <span style="font-weight: bold; margin-left: 4px;">#${slum.rank}</span>
            </div>
            <div>
              <span style="color: #6B7280;">Score:</span>
              <span style="font-weight: bold; margin-left: 4px; color: ${color};">${score}/100</span>
            </div>
            <div>
              <span style="color: #6B7280;">Population:</span>
              <span style="font-weight: bold; margin-left: 4px;">${slum.population.toLocaleString()}</span>
            </div>
            <div>
              <span style="color: #6B7280;">Households:</span>
              <span style="font-weight: bold; margin-left: 4px;">${slum.households}</span>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
            <div style="font-size: 10px; color: #6B7280; margin-bottom: 4px;">Infrastructure:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
              <div>Water: ${slum.tapPoints}</div>
              <div>Toilets: ${slum.latrinesFlush + slum.latrinesPit}</div>
              <div>Roads: ${slum.pavedRoads}km</div>
              <div>Power: ${slum.electricityDomestic}</div>
            </div>
          </div>
          <button 
            onclick="window.selectSlumFromMap('${slum.slNo}')"
            style="
              width: 100%;
              margin-top: 8px;
              padding: 6px 12px;
              background-color: ${color};
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 11px;
              cursor: pointer;
              font-weight: bold;
            "
          >
            Select This Slum
          </button>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: "custom-popup",
      })

      marker.on("click", () => {
        onSlumSelect(slum)
      })

      marker.addTo(mapInstanceRef.current)
      markersRef.current.push(marker)
    })

    // Global function to select slum from popup
    ;(window as any).selectSlumFromMap = (slNo: string) => {
      const slum = slums.find((s) => s.slNo === slNo)
      if (slum) {
        onSlumSelect(slum)
      }
    }
  }, [slums, onSlumSelect])

  // Highlight selected slum
  useEffect(() => {
    if (!selectedSlum || !mapInstanceRef.current) return

    // Find and highlight the selected slum
    const selectedMarker = markersRef.current.find((marker, index) => {
      return slums[index]?.slNo === selectedSlum.slNo
    })

    if (selectedMarker && selectedSlum.lat && selectedSlum.lng) {
      // Pan to selected slum
      mapInstanceRef.current.setView([selectedSlum.lat, selectedSlum.lng], 14, {
        animate: true,
        duration: 1,
      })

      // Open popup
      selectedMarker.openPopup()
    }
  }, [selectedSlum, slums])

  if (mapError) {
    return (
      <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <div className="text-white mb-2">Map Error</div>
          <div className="text-gray-400 text-sm">{mapError}</div>
        </div>
      </div>
    )
  }

  if (!isMapLoaded) {
    return (
      <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading interactive map...</div>
          <div className="text-gray-400 text-sm mt-2">Initializing Leaflet mapping library</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-96 w-full rounded-lg overflow-hidden" />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-800/95 p-3 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm font-semibold mb-2">Priority Level</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-300">High Priority (75+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-300">Medium Priority (60-75)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300">Low Priority (&lt;60)</span>
          </div>
        </div>
      </div>

      {/* Map Stats */}
      <div className="absolute top-4 right-4 bg-gray-800/95 p-3 rounded-lg backdrop-blur-sm">
        <div className="text-white text-sm font-semibold mb-1">Map Statistics</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>Total Slums: {slums.length}</div>
          <div>High Priority: {slums.filter((s) => (s.redevelopmentScore || 0) > 75).length}</div>
          <div>
            Medium Priority:{" "}
            {slums.filter((s) => (s.redevelopmentScore || 0) >= 60 && (s.redevelopmentScore || 0) <= 75).length}
          </div>
          <div>Low Priority: {slums.filter((s) => (s.redevelopmentScore || 0) < 60).length}</div>
        </div>
      </div>

      {/* Custom CSS for markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        }
        
        .leaflet-control-zoom a {
          background-color: rgba(31, 41, 55, 0.9) !important;
          color: white !important;
          border: none !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: rgba(55, 65, 81, 0.9) !important;
        }
      `}</style>
    </div>
  )
}
