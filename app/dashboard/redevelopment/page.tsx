"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronUp,
  ChevronDown,
  MapPin,
  Users,
  Home,
  Droplets,
  Zap,
  Layers,
  Navigation,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Search,
  X,
  Info,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import dynamic from "next/dynamic"

// Dynamically import components
const InteractiveSlumMap = dynamic(() => import("@/components/interactive-slum-map"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white">Loading map...</div>
    </div>
  ),
})

const DataVisualization = dynamic(() => import("@/components/data-visualization"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-900 rounded-lg flex items-center justify-center">
      <div className="text-white">Loading charts...</div>
    </div>
  ),
})

const ScoreExplanation = dynamic(() => import("@/components/score-explanation"), {
  ssr: false,
})

interface SlumData {
  slNo: string
  class: string
  townName: string
  slumName: string
  notified: string
  households: number
  population: number
  pavedRoads: number
  drainageOpen: string
  drainageClosed: string
  drainageBoth: string
  noDrainage: string
  latrinesPit: number
  latrinesFlush: number
  latrinesService: number
  latrinesOthers: number
  communityToilets: number
  tapPoints: number
  electricityDomestic: number
  electricityStreet: number
  electricityOthers: number
  redevelopmentScore?: number
  rank?: number
  lat?: number
  lng?: number
}

interface Weightage {
  waterAccess: number
  toiletAccess: number
  drainage: number
  roadInfrastructure: number
  electricity: number
  populationDensity: number
}

interface FilterState {
  searchTerm: string
  townFilter: string
  populationRange: [number, number]
  scoreRange: [number, number]
  notifiedFilter: string
  infrastructureFilter: string
}

const defaultWeightage: Weightage = {
  waterAccess: 20,
  toiletAccess: 20,
  drainage: 15,
  roadInfrastructure: 15,
  electricity: 15,
  populationDensity: 15,
}

const defaultFilters: FilterState = {
  searchTerm: "",
  townFilter: "all",
  populationRange: [0, 10000],
  scoreRange: [0, 100],
  notifiedFilter: "all",
  infrastructureFilter: "all",
}

// Known slum locations in Bangalore (approximate coordinates)
const slumLocations: { [key: string]: { lat: number; lng: number } } = {
  Ayyappanagar: { lat: 12.9716, lng: 77.5946 },
  Banashankari: { lat: 12.925, lng: 77.5667 },
  Bommanahalli: { lat: 12.9081, lng: 77.6297 },
  Byatarayanapura: { lat: 13.0358, lng: 77.554 },
  Chickpet: { lat: 12.9698, lng: 77.5802 },
  Dasarahalli: { lat: 13.0297, lng: 77.4797 },
  Domlur: { lat: 12.9611, lng: 77.6387 },
  "Electronic City": { lat: 12.8456, lng: 77.6603 },
  "Frazer Town": { lat: 12.9895, lng: 77.6066 },
  "Gandhi Nagar": { lat: 12.9698, lng: 77.5802 },
  Hebbal: { lat: 13.0358, lng: 77.5971 },
  Indiranagar: { lat: 12.9719, lng: 77.6412 },
  Jayanagar: { lat: 12.9279, lng: 77.5837 },
  Koramangala: { lat: 12.9352, lng: 77.6245 },
  Lingarajapuram: { lat: 12.9895, lng: 77.6387 },
  "Mahalakshmi Layout": { lat: 12.9698, lng: 77.554 },
  Malleshwaram: { lat: 12.995, lng: 77.5667 },
  Marathahalli: { lat: 12.9591, lng: 77.6974 },
  Nagarbhavi: { lat: 12.9581, lng: 77.4797 },
  Peenya: { lat: 13.0297, lng: 77.5167 },
  Rajajinagar: { lat: 12.995, lng: 77.554 },
  Shivajinagar: { lat: 12.9895, lng: 77.6066 },
  Ulsoor: { lat: 12.9815, lng: 77.6108 },
  Vijayanagar: { lat: 12.9698, lng: 77.5167 },
  Whitefield: { lat: 12.9698, lng: 77.7499 },
}

export default function RedevelopmentPage() {
  const [slumsData, setSlumsData] = useState<SlumData[]>([])
  const [weightage, setWeightage] = useState<Weightage>(defaultWeightage)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [sortColumn, setSortColumn] = useState<keyof SlumData>("rank")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [isWeightageOpen, setIsWeightageOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSlum, setSelectedSlum] = useState<SlumData | null>(null)
  const [mapView, setMapView] = useState<"satellite" | "street" | "terrain">("street")
  const [activeTab, setActiveTab] = useState("table")
  const itemsPerPage = 10

  // Fetch and process slums data
  useEffect(() => {
    const fetchSlumsData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bangalore-slums-census-RnpbRUwL4U09e0Ftl1SqtJL1joc0vj.csv",
        )
        const csvText = await response.text()

        // Parse CSV
        const lines = csvText.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

        const parsedData: SlumData[] = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line, index) => {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

            const slumName = values[3] || ""

            // Try to match slum name with known locations
            let coordinates = { lat: 12.9716, lng: 77.5946 } // Default to Bangalore center

            // Find matching location or use nearby coordinates
            const matchingLocation = Object.keys(slumLocations).find(
              (key) =>
                slumName.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(slumName.toLowerCase()),
            )

            if (matchingLocation) {
              coordinates = slumLocations[matchingLocation]
            } else {
              // Generate realistic coordinates within Bangalore bounds
              coordinates = {
                lat: 12.8456 + Math.random() * 0.3, // Bangalore latitude range
                lng: 77.4797 + Math.random() * 0.4, // Bangalore longitude range
              }
            }

            return {
              slNo: values[0] || "",
              class: values[1] || "",
              townName: values[2] || "",
              slumName: slumName,
              notified: values[4] || "",
              households: Number.parseInt(values[5]) || 0,
              population: Number.parseInt(values[6]) || 0,
              pavedRoads: Number.parseFloat(values[7]) || 0,
              drainageOpen: values[8] || "",
              drainageClosed: values[9] || "",
              drainageBoth: values[10] || "",
              noDrainage: values[11] || "",
              latrinesPit: Number.parseInt(values[12]) || 0,
              latrinesFlush: Number.parseInt(values[13]) || 0,
              latrinesService: Number.parseInt(values[14]) || 0,
              latrinesOthers: Number.parseInt(values[15]) || 0,
              communityToilets: Number.parseInt(values[16]) || 0,
              tapPoints: Number.parseInt(values[17]) || 0,
              electricityDomestic: Number.parseInt(values[18]) || 0,
              electricityStreet: Number.parseInt(values[19]) || 0,
              electricityOthers: Number.parseInt(values[20]) || 0,
              lat: coordinates.lat,
              lng: coordinates.lng,
            }
          })
          .filter((item) => item.slumName && item.population > 0)
          .slice(0, 100) // Increased to 100 for better analysis

        setSlumsData(parsedData)

        // Set initial filter ranges based on data
        const maxPopulation = Math.max(...parsedData.map((s) => s.population))
        setFilters((prev) => ({
          ...prev,
          populationRange: [0, maxPopulation],
        }))
      } catch (error) {
        console.error("Error fetching slums data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlumsData()
  }, [])

  // Calculate redevelopment scores based on weightage
  const rankedSlums = useMemo(() => {
    return slumsData
      .map((slum) => {
        // Calculate individual scores (0-100)
        const waterScore = Math.min((slum.tapPoints / Math.max(slum.households * 0.1, 1)) * 100, 100)
        const toiletScore = Math.min(
          ((slum.latrinesFlush + slum.latrinesPit + slum.communityToilets) / Math.max(slum.households * 0.2, 1)) * 100,
          100,
        )
        const drainageScore =
          slum.drainageBoth === "BD" ? 80 : slum.drainageClosed !== "-" ? 60 : slum.drainageOpen !== "-" ? 40 : 20
        const roadScore = Math.min((slum.pavedRoads / Math.max(slum.population * 0.001, 0.1)) * 100, 100)
        const electricityScore = Math.min((slum.electricityDomestic / Math.max(slum.households, 1)) * 100, 100)
        const densityScore = Math.max(100 - (slum.population / Math.max(slum.households, 1)) * 10, 0)

        // Calculate weighted score (inverted - higher score means higher priority for redevelopment)
        const redevelopmentScore =
          100 -
          (waterScore * weightage.waterAccess +
            toiletScore * weightage.toiletAccess +
            drainageScore * weightage.drainage +
            roadScore * weightage.roadInfrastructure +
            electricityScore * weightage.electricity +
            densityScore * weightage.populationDensity) /
            100

        return {
          ...slum,
          redevelopmentScore: Math.round(redevelopmentScore),
        }
      })
      .sort((a, b) => (b.redevelopmentScore || 0) - (a.redevelopmentScore || 0))
      .map((slum, index) => ({
        ...slum,
        rank: index + 1,
      }))
  }, [slumsData, weightage])

  // Apply filters
  const filteredSlums = useMemo(() => {
    return rankedSlums.filter((slum) => {
      // Search term filter
      if (
        filters.searchTerm &&
        !slum.slumName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !slum.townName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false
      }

      // Town filter
      if (filters.townFilter !== "all" && slum.townName !== filters.townFilter) {
        return false
      }

      // Population range filter
      if (slum.population < filters.populationRange[0] || slum.population > filters.populationRange[1]) {
        return false
      }

      // Score range filter
      const score = slum.redevelopmentScore || 0
      if (score < filters.scoreRange[0] || score > filters.scoreRange[1]) {
        return false
      }

      // Notified filter
      if (filters.notifiedFilter !== "all" && slum.notified !== filters.notifiedFilter) {
        return false
      }

      // Infrastructure filter
      if (filters.infrastructureFilter !== "all") {
        const hasGoodInfrastructure = slum.tapPoints > 5 && slum.electricityDomestic > slum.households * 0.8
        if (filters.infrastructureFilter === "good" && !hasGoodInfrastructure) return false
        if (filters.infrastructureFilter === "poor" && hasGoodInfrastructure) return false
      }

      return true
    })
  }, [rankedSlums, filters])

  // Sort and paginate filtered data
  const sortedData = useMemo(() => {
    const sorted = [...filteredSlums].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      const aNum = Number(aValue) || 0
      const bNum = Number(bValue) || 0
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum
    })

    const startIndex = (currentPage - 1) * itemsPerPage
    return sorted.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSlums, sortColumn, sortDirection, currentPage])

  const totalPages = Math.ceil(filteredSlums.length / itemsPerPage)

  // Get unique towns for filter dropdown
  const uniqueTowns = useMemo(() => {
    return Array.from(new Set(rankedSlums.map((slum) => slum.townName))).sort()
  }, [rankedSlums])

  const handleSort = (column: keyof SlumData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const updateWeightage = (key: keyof Weightage, value: number) => {
    setWeightage((prev) => ({ ...prev, [key]: value }))
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setCurrentPage(1)
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score > 75) return "destructive"
    if (score >= 60) return "secondary"
    return "default"
  }

  const handleSlumSelect = (slum: SlumData) => {
    setSelectedSlum(slum)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.townFilter !== "all") count++
    if (filters.populationRange[0] > 0 || filters.populationRange[1] < 10000) count++
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++
    if (filters.notifiedFilter !== "all") count++
    if (filters.infrastructureFilter !== "all") count++
    return count
  }, [filters])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Slum Redevelopment Priority</h1>
        <p className="text-gray-300">Analyze and prioritize slums for redevelopment based on infrastructure needs</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="text-sm text-gray-400">
            Showing {filteredSlums.length} of {rankedSlums.length} slums
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="table" className="data-[state=active]:bg-gray-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Data Table
          </TabsTrigger>
          <TabsTrigger value="visualization" className="data-[state=active]:bg-gray-700">
            <PieChart className="h-4 w-4 mr-2" />
            Visualization
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-gray-700">
            <MapPin className="h-4 w-4 mr-2" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="explanation" className="data-[state=active]:bg-gray-700">
            <Info className="h-4 w-4 mr-2" />
            Score Guide
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <TabsContent value="table" className="mt-0">
              {/* Advanced Filters */}
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                      <CardTitle className="text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Filter className="h-5 w-5" />
                          Advanced Filters
                          {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {activeFiltersCount}
                            </Badge>
                          )}
                        </div>
                        {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Search Slums</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search by name or town..."
                              value={filters.searchTerm}
                              onChange={(e) => updateFilter("searchTerm", e.target.value)}
                              className="pl-10 bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                        </div>

                        {/* Town Filter */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Town</label>
                          <Select
                            value={filters.townFilter}
                            onValueChange={(value) => updateFilter("townFilter", value)}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select town" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="all">All Towns</SelectItem>
                              {uniqueTowns.map((town) => (
                                <SelectItem key={town} value={town}>
                                  {town}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notified Status */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Notification Status</label>
                          <Select
                            value={filters.notifiedFilter}
                            onValueChange={(value) => updateFilter("notifiedFilter", value)}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="Yes">Notified</SelectItem>
                              <SelectItem value="No">Not Notified</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Infrastructure Quality */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-300">Infrastructure Quality</label>
                          <Select
                            value={filters.infrastructureFilter}
                            onValueChange={(value) => updateFilter("infrastructureFilter", value)}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select quality" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="all">All Levels</SelectItem>
                              <SelectItem value="good">Good Infrastructure</SelectItem>
                              <SelectItem value="poor">Poor Infrastructure</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Range Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                        {/* Population Range */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Population Range</label>
                            <span className="text-sm text-white">
                              {filters.populationRange[0].toLocaleString()} -{" "}
                              {filters.populationRange[1].toLocaleString()}
                            </span>
                          </div>
                          <Slider
                            value={filters.populationRange}
                            onValueChange={(value) => updateFilter("populationRange", value as [number, number])}
                            max={Math.max(...rankedSlums.map((s) => s.population))}
                            step={100}
                            className="w-full"
                          />
                        </div>

                        {/* Score Range */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-300">Redevelopment Score Range</label>
                            <span className="text-sm text-white">
                              {filters.scoreRange[0]} - {filters.scoreRange[1]}
                            </span>
                          </div>
                          <Slider
                            value={filters.scoreRange}
                            onValueChange={(value) => updateFilter("scoreRange", value as [number, number])}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Filter Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-400">
                          {filteredSlums.length} slum{filteredSlums.length !== 1 ? "s" : ""} match your criteria
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Filters
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Ranked Slums Table */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Ranked Slums
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead
                            className="text-gray-300 cursor-pointer hover:text-white"
                            onClick={() => handleSort("rank")}
                          >
                            <div className="flex items-center gap-1">
                              Rank
                              {sortColumn === "rank" &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="text-gray-300 cursor-pointer hover:text-white"
                            onClick={() => handleSort("slumName")}
                          >
                            <div className="flex items-center gap-1">
                              Slum Name
                              {sortColumn === "slumName" &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="text-gray-300 cursor-pointer hover:text-white"
                            onClick={() => handleSort("townName")}
                          >
                            <div className="flex items-center gap-1">
                              Town
                              {sortColumn === "townName" &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="text-gray-300 cursor-pointer hover:text-white"
                            onClick={() => handleSort("population")}
                          >
                            <div className="flex items-center gap-1">
                              Population
                              {sortColumn === "population" &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="text-gray-300 cursor-pointer hover:text-white"
                            onClick={() => handleSort("notified")}
                          >
                            <div className="flex items-center gap-1">
                              Status
                              {sortColumn === "notified" &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead
                            className="text-gray-300 cursor-pointer hover:text-white"
                            onClick={() => handleSort("redevelopmentScore")}
                          >
                            <div className="flex items-center gap-1">
                              Redevelopment Score
                              {sortColumn === "redevelopmentScore" &&
                                (sortDirection === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                ))}
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedData.map((slum) => (
                          <TableRow key={slum.slNo} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell className="text-white font-medium">#{slum.rank}</TableCell>
                            <TableCell className="text-white">{slum.slumName}</TableCell>
                            <TableCell className="text-gray-300">{slum.townName}</TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {slum.population.toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {slum.notified === "Yes" ? (
                                <Badge variant="default" className="bg-green-600">
                                  Notified
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Not Notified</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getScoreBadgeVariant(slum.redevelopmentScore || 0)}>
                                {slum.redevelopmentScore}/100
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSlumSelect(slum)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredSlums.length)} of {filteredSlums.length} slums
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visualization" className="mt-0">
              <DataVisualization slums={filteredSlums} />
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              {/* Interactive Map */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Interactive Slum Map - Bangalore
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={mapView === "street" ? "default" : "outline"}
                        onClick={() => setMapView("street")}
                        className="text-xs"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Street
                      </Button>
                      <Button
                        size="sm"
                        variant={mapView === "satellite" ? "default" : "outline"}
                        onClick={() => setMapView("satellite")}
                        className="text-xs"
                      >
                        <Layers className="h-3 w-3 mr-1" />
                        Satellite
                      </Button>
                      <Button
                        size="sm"
                        variant={mapView === "terrain" ? "default" : "outline"}
                        onClick={() => setMapView("terrain")}
                        className="text-xs"
                      >
                        Terrain
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InteractiveSlumMap
                    slums={filteredSlums}
                    selectedSlum={selectedSlum}
                    onSlumSelect={handleSlumSelect}
                    mapView={mapView}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="explanation" className="mt-0">
              <ScoreExplanation slum={selectedSlum} />
            </TabsContent>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Weightage Panel */}
            <Card className="bg-gray-800 border-gray-700 sticky top-6">
              <Collapsible open={isWeightageOpen} onOpenChange={setIsWeightageOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                    <CardTitle className="text-white flex items-center justify-between">
                      Adjust Weightage
                      {isWeightageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Explanation */}
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-xs text-gray-300 mb-2">
                        <strong>Weightage</strong> controls how much each factor influences the priority score. Higher
                        weightage = more important for ranking slums.
                      </p>
                      <div className="text-xs text-gray-400">
                        Total: {Object.values(weightage).reduce((sum, val) => sum + val, 0)}%
                      </div>
                    </div>

                    {/* Water Access */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                          <Droplets className="h-4 w-4" />
                          Water Access
                        </label>
                        <span className="text-sm text-white font-semibold">{weightage.waterAccess}%</span>
                      </div>
                      <Slider
                        value={[weightage.waterAccess]}
                        onValueChange={(value) => updateWeightage("waterAccess", value[0])}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400">
                        {weightage.waterAccess > 30
                          ? "🔥 High priority on water shortage"
                          : weightage.waterAccess > 15
                            ? "⚖️ Balanced water consideration"
                            : "📉 Lower water priority"}
                      </p>
                    </div>

                    {/* Toilet Access */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Toilet Access
                        </label>
                        <span className="text-sm text-white font-semibold">{weightage.toiletAccess}%</span>
                      </div>
                      <Slider
                        value={[weightage.toiletAccess]}
                        onValueChange={(value) => updateWeightage("toiletAccess", value[0])}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400">
                        {weightage.toiletAccess > 30
                          ? "🚽 High priority on sanitation"
                          : weightage.toiletAccess > 15
                            ? "⚖️ Balanced sanitation focus"
                            : "📉 Lower sanitation priority"}
                      </p>
                    </div>

                    {/* Drainage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">Drainage</label>
                        <span className="text-sm text-white font-semibold">{weightage.drainage}%</span>
                      </div>
                      <Slider
                        value={[weightage.drainage]}
                        onValueChange={(value) => updateWeightage("drainage", value[0])}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400">
                        {weightage.drainage > 25
                          ? "🌊 High priority on flood prevention"
                          : weightage.drainage > 10
                            ? "⚖️ Standard drainage consideration"
                            : "📉 Lower drainage priority"}
                      </p>
                    </div>

                    {/* Road Infrastructure */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300">Road Infrastructure</label>
                        <span className="text-sm text-white font-semibold">{weightage.roadInfrastructure}%</span>
                      </div>
                      <Slider
                        value={[weightage.roadInfrastructure]}
                        onValueChange={(value) => updateWeightage("roadInfrastructure", value[0])}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400">
                        {weightage.roadInfrastructure > 25
                          ? "🛣️ High priority on road access"
                          : weightage.roadInfrastructure > 10
                            ? "⚖️ Standard road consideration"
                            : "📉 Lower road priority"}
                      </p>
                    </div>

                    {/* Electricity */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Electricity
                        </label>
                        <span className="text-sm text-white font-semibold">{weightage.electricity}%</span>
                      </div>
                      <Slider
                        value={[weightage.electricity]}
                        onValueChange={(value) => updateWeightage("electricity", value[0])}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400">
                        {weightage.electricity > 25
                          ? "⚡ High priority on power access"
                          : weightage.electricity > 10
                            ? "⚖️ Standard electrical focus"
                            : "📉 Lower electrical priority"}
                      </p>
                    </div>

                    {/* Population Density */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-300 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Population Density
                        </label>
                        <span className="text-sm text-white font-semibold">{weightage.populationDensity}%</span>
                      </div>
                      <Slider
                        value={[weightage.populationDensity]}
                        onValueChange={(value) => updateWeightage("populationDensity", value[0])}
                        max={50}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-400">
                        {weightage.populationDensity > 25
                          ? "👥 High priority on overcrowding"
                          : weightage.populationDensity > 10
                            ? "⚖️ Standard density consideration"
                            : "📉 Lower density priority"}
                      </p>
                    </div>

                    {/* Preset Scenarios */}
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="text-sm font-semibold text-white mb-3">Quick Presets</h4>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setWeightage({
                              waterAccess: 35,
                              toiletAccess: 35,
                              drainage: 10,
                              roadInfrastructure: 10,
                              electricity: 5,
                              populationDensity: 5,
                            })
                          }
                          className="w-full text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          🚰 Health Focus (Water + Sanitation)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setWeightage({
                              waterAccess: 15,
                              toiletAccess: 15,
                              drainage: 25,
                              roadInfrastructure: 25,
                              electricity: 10,
                              populationDensity: 10,
                            })
                          }
                          className="w-full text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          🏗️ Infrastructure Focus
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setWeightage(defaultWeightage)}
                          className="w-full text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          ⚖️ Balanced Approach
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Selected Slum Details */}
            {selectedSlum && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Selected Slum Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-white font-semibold">{selectedSlum.slumName}</h4>
                    <p className="text-gray-300 text-sm">{selectedSlum.townName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Rank:</span>
                      <span className="text-white ml-1">#{selectedSlum.rank}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Score:</span>
                      <span className="text-white ml-1">{selectedSlum.redevelopmentScore}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Population:</span>
                      <span className="text-white ml-1">{selectedSlum.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Households:</span>
                      <span className="text-white ml-1">{selectedSlum.households}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Water Taps:</span>
                        <span className="text-white">{selectedSlum.tapPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Toilets:</span>
                        <span className="text-white">
                          {selectedSlum.latrinesFlush + selectedSlum.latrinesPit + selectedSlum.communityToilets}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Electricity:</span>
                        <span className="text-white">{selectedSlum.electricityDomestic} connections</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Paved Roads:</span>
                        <span className="text-white">{selectedSlum.pavedRoads} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-700">
                    {selectedSlum.notified === "Yes" ? (
                      <Badge variant="default" className="bg-green-600 text-xs">
                        Officially Notified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Not Notified
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("explanation")}
                    className="w-full text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    View Score Breakdown
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Slums:</span>
                    <span className="text-white">{rankedSlums.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Filtered:</span>
                    <span className="text-white">{filteredSlums.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Priority (75+):</span>
                    <span className="text-red-400">
                      {filteredSlums.filter((s) => (s.redevelopmentScore || 0) > 75).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Medium Priority (60-75):</span>
                    <span className="text-orange-400">
                      {
                        filteredSlums.filter(
                          (s) => (s.redevelopmentScore || 0) >= 60 && (s.redevelopmentScore || 0) <= 75,
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Low Priority (0-60):</span>
                    <span className="text-green-400">
                      {filteredSlums.filter((s) => (s.redevelopmentScore || 0) < 60).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Notified:</span>
                    <span className="text-green-400">{filteredSlums.filter((s) => s.notified === "Yes").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Not Notified:</span>
                    <span className="text-red-400">{filteredSlums.filter((s) => s.notified === "No").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
