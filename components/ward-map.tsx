"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface Ward {
  ward_no: number
  ward_name: string
  population: number
  area_sqkm: number
}

interface WardMapProps {
  wards: Ward[]
  selectedWards: number[]
  onWardSelect: (wardNo: number) => void
}

export default function WardMap({ wards = [], selectedWards = [], onWardSelect }: WardMapProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredWards = wards.filter(
    (ward) =>
      ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase()) || ward.ward_no.toString().includes(searchTerm),
  )

  const getDensityColor = (density: number) => {
    if (density < 1000) return "bg-green-500/20 border-green-500/40 text-green-300"
    if (density < 2000) return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
    if (density < 3000) return "bg-orange-500/20 border-orange-500/40 text-orange-300"
    return "bg-red-500/20 border-red-500/40 text-red-300"
  }

  const getDensityLabel = (density: number) => {
    if (density < 1000) return "Low"
    if (density < 2000) return "Medium"
    if (density < 3000) return "High"
    return "Very High"
  }

  if (!wards || wards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading ward data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search wards by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge className="bg-green-500/20 text-green-300 border-green-500/40">Low Density (&lt;1000/km²)</Badge>
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">Medium (1000-2000/km²)</Badge>
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40">High (2000-3000/km²)</Badge>
        <Badge className="bg-red-500/20 text-red-300 border-red-500/40">Very High (&gt;3000/km²)</Badge>
      </div>

      {/* Ward Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredWards.map((ward) => {
          const density = Math.round(ward.population / ward.area_sqkm)
          const isSelected = selectedWards.includes(ward.ward_no)

          return (
            <div
              key={ward.ward_no}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/50"
                  : `${getDensityColor(density)} hover:shadow-lg hover:scale-[1.02]`
              }`}
              onClick={() => onWardSelect(ward.ward_no)}
              title={`${ward.ward_name} - Population: ${ward.population.toLocaleString()}, Area: ${ward.area_sqkm} km², Density: ${density}/km²`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white text-sm">Ward {ward.ward_no}</h3>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onWardSelect(ward.ward_no)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </div>

              <p className="text-xs text-gray-300 mb-2 truncate" title={ward.ward_name}>
                {ward.ward_name.length > 20 ? `${ward.ward_name.substring(0, 20)}...` : ward.ward_name}
              </p>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Population:</span>
                  <span className="text-gray-300">{ward.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Area:</span>
                  <span className="text-gray-300">{ward.area_sqkm} km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Density:</span>
                  <span
                    className={`font-medium ${
                      density < 1000
                        ? "text-green-300"
                        : density < 2000
                          ? "text-yellow-300"
                          : density < 3000
                            ? "text-orange-300"
                            : "text-red-300"
                    }`}
                  >
                    {density}/km² ({getDensityLabel(density)})
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredWards.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No wards found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
