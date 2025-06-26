
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, Users, Home, Droplets, Zap } from "lucide-react"

interface SlumData {
  slNo: string
  slumName: string
  townName: string
  population: number
  households: number
  redevelopmentScore?: number
  rank?: number
  tapPoints: number
  latrinesFlush: number
  latrinesPit: number
  pavedRoads: number
  electricityDomestic: number
  notified: string
}

interface DataVisualizationProps {
  slums: SlumData[]
}

export default function DataVisualization({ slums }: DataVisualizationProps) {
  // Create score distribution data
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { label: "0-20", min: 0, max: 20, color: "bg-green-500" },
      { label: "21-40", min: 21, max: 40, color: "bg-green-400" },
      { label: "41-60", min: 41, max: 60, color: "bg-yellow-500" },
      { label: "61-75", min: 61, max: 75, color: "bg-orange-500" },
      { label: "76-100", min: 76, max: 100, color: "bg-red-500" },
    ]

    return ranges.map((range) => ({
      ...range,
      count: slums.filter((s) => {
        const score = s.redevelopmentScore || 0
        return score >= range.min && score <= range.max
      }).length,
    }))
  }, [slums])

  const maxCount = Math.max(...scoreDistribution.map((d) => d.count))

  // Calculate various statistics
  const stats = useMemo(() => {
    if (slums.length === 0) return null

    const totalPopulation = slums.reduce((sum, s) => sum + s.population, 0)
    const totalHouseholds = slums.reduce((sum, s) => sum + s.households, 0)
    const avgScore = slums.reduce((sum, s) => sum + (s.redevelopmentScore || 0), 0) / slums.length

    // Priority distribution
    const highPriority = slums.filter((s) => (s.redevelopmentScore || 0) > 75).length
    const mediumPriority = slums.filter(
      (s) => (s.redevelopmentScore || 0) >= 60 && (s.redevelopmentScore || 0) <= 75,
    ).length
    const lowPriority = slums.filter((s) => (s.redevelopmentScore || 0) < 60).length

    // Town distribution
    const townCounts = slums.reduce(
      (acc, slum) => {
        acc[slum.townName] = (acc[slum.townName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topTowns = Object.entries(townCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Infrastructure analysis
    const avgWaterPoints = slums.reduce((sum, s) => sum + s.tapPoints, 0) / slums.length
    const avgToilets = slums.reduce((sum, s) => sum + s.latrinesFlush + s.latrinesPit, 0) / slums.length
    const avgRoads = slums.reduce((sum, s) => sum + s.pavedRoads, 0) / slums.length
    const avgElectricity = slums.reduce((sum, s) => sum + s.electricityDomestic, 0) / slums.length

    // Notification status
    const notifiedCount = slums.filter((s) => s.notified === "Yes").length
    const notNotifiedCount = slums.filter((s) => s.notified === "No").length

    return {
      totalPopulation,
      totalHouseholds,
      avgScore,
      highPriority,
      mediumPriority,
      lowPriority,
      topTowns,
      avgWaterPoints,
      avgToilets,
      avgRoads,
      avgElectricity,
      notifiedCount,
      notNotifiedCount,
    }
  }, [slums])

  if (!stats) {
    return <div className="text-center text-gray-400 py-8">No data available for visualization</div>
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Slums</p>
                <p className="text-2xl font-bold text-white">{slums.length}</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Population</p>
                <p className="text-2xl font-bold text-white">{stats.totalPopulation.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Score</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.avgScore)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-red-400">{stats.highPriority}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-300">High Priority (75+)</span>
                </div>
                <div className="text-white font-semibold">{stats.highPriority}</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.highPriority / slums.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-gray-300">Medium Priority (60-75)</span>
                </div>
                <div className="text-white font-semibold">{stats.mediumPriority}</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${(stats.mediumPriority / slums.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-300">Low Priority (&lt;60)</span>
                </div>
                <div className="text-white font-semibold">{stats.lowPriority}</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.lowPriority / slums.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution Histogram */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreDistribution.map((range) => (
                <div key={range.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{range.label}</span>
                    <span className="text-white font-semibold">{range.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`${range.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${maxCount > 0 ? (range.count / maxCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Towns */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Home className="h-5 w-5" />
              Top Towns by Slum Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topTowns.map(([town, count], index) => (
                <div key={town} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate">{town}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / stats.topTowns[0][1]) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Averages */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Average Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">Water Points</span>
                </div>
                <span className="text-white font-semibold">{Math.round(stats.avgWaterPoints)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Toilets</span>
                </div>
                <span className="text-white font-semibold">{Math.round(stats.avgToilets)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-gray-300 text-sm">Paved Roads (km)</span>
                </div>
                <span className="text-white font-semibold">{stats.avgRoads.toFixed(1)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300 text-sm">Electricity Connections</span>
                </div>
                <span className="text-white font-semibold">{Math.round(stats.avgElectricity)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.notifiedCount}</div>
              <div className="text-gray-300 text-sm">Notified Slums</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(stats.notifiedCount / slums.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{stats.notNotifiedCount}</div>
              <div className="text-gray-300 text-sm">Not Notified</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(stats.notNotifiedCount / slums.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Population vs Infrastructure Scatter Plot */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Population vs Infrastructure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative bg-gray-900 rounded-lg p-4">
            <div className="absolute inset-4">
              {/* Y-axis label */}
              <div className="absolute -left-8 top-1/2 transform -rotate-90 text-gray-400 text-xs">
                Infrastructure Score
              </div>

              {/* X-axis label */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">
                Population
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0">
                {[0, 25, 50, 75, 100].map((y) => (
                  <div key={y} className="absolute w-full border-t border-gray-700" style={{ top: `${100 - y}%` }}>
                    <span className="absolute -left-8 -top-2 text-xs text-gray-500">{y}</span>
                  </div>
                ))}
              </div>

              {/* Scatter points */}
              <div className="absolute inset-0">
                {slums.slice(0, 20).map((slum, index) => {
                  const x = (slum.population / Math.max(...slums.map((s) => s.population))) * 100
                  const infrastructureScore = (slum.tapPoints + slum.electricityDomestic + slum.pavedRoads * 10) / 3
                  const y =
                    100 -
                    (infrastructureScore /
                      Math.max(...slums.map((s) => (s.tapPoints + s.electricityDomestic + s.pavedRoads * 10) / 3))) *
                      100
                  const score = slum.redevelopmentScore || 0

                  return (
                    <div
                      key={slum.slNo}
                      className={`absolute w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform ${
                        score > 75 ? "bg-red-500" : score >= 60 ? "bg-orange-500" : "bg-green-500"
                      }`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={`${slum.slumName}: Pop ${slum.population}, Score ${score}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">
            Each dot represents a slum. Color indicates priority level (red=high, orange=medium, green=low)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
