"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MessageCircle,
  Download,
  Loader2,
  BarChart3,
  Zap,
  Shield,
  Map,
  ExternalLink,
} from "lucide-react"
import WardMap from "@/components/ward-map"
import ZoneChat from "@/components/zone-chat"
import wardData from "@/data/ward_data.json"

interface Ward {
  ward_no: number
  ward_name: string
  population: number
  area_sqkm: number
}

interface AnalysisResult {
  overall_assessment: string
  zone_viability: string
  population_analysis: string
  infrastructure_implications: string
  administrative_efficiency: string
  development_opportunities: string
  challenges: string
  recommendations: string[]
  estimated_cost?: string
  timeline?: string
  priority_score?: number
}

export default function ZoningPage() {
  const [selectedWards, setSelectedWards] = useState<Ward[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const wards: Ward[] = wardData

  const handleWardSelect = (wardNo: number) => {
    const ward = wards.find((w) => w.ward_no === wardNo)
    if (!ward) return

    setSelectedWards((prev) => {
      const exists = prev.find((w) => w.ward_no === wardNo)
      if (exists) {
        return prev.filter((w) => w.ward_no !== wardNo)
      } else {
        return [...prev, ward]
      }
    })
  }

  const analyzeZone = async () => {
    if (selectedWards.length === 0) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/zoning/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedWards }),
      })

      if (response.ok) {
        const result = await response.json()
        // Add default values for missing properties
        const enhancedResult = {
          ...result,
          estimated_cost:
            result.estimated_cost ||
            `₹${Math.round((selectedWards.reduce((sum, ward) => sum + ward.population, 0) * 12) / 1000)} crores`,
          timeline:
            result.timeline || `${selectedWards.length <= 3 ? "3-4" : selectedWards.length <= 6 ? "4-5" : "5-7"} years`,
          priority_score:
            result.priority_score ||
            Math.min(
              95,
              Math.max(
                60,
                85 -
                  selectedWards.length * 2 +
                  (selectedWards.reduce((sum, ward) => sum + ward.population, 0) > 100000 ? 10 : 0),
              ),
            ),
        }
        setAnalysisResult(enhancedResult)
      } else {
        console.error("Analysis failed")
      }
    } catch (error) {
      console.error("Error analyzing zone:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadAnalysisReport = () => {
    if (!analysisResult) return

    const totalPopulation = selectedWards.reduce((sum, ward) => sum + ward.population, 0)
    const totalArea = selectedWards.reduce((sum, ward) => sum + ward.area_sqkm, 0)

    const reportContent = `
ZONE ANALYSIS REPORT
Generated on: ${new Date().toLocaleString()}

===========================================
ZONE OVERVIEW
===========================================
Selected Wards: ${selectedWards.length}
Ward Details: ${selectedWards.map((w) => `Ward ${w.ward_no} (${w.ward_name})`).join(", ")}
Total Population: ${totalPopulation.toLocaleString()}
Total Area: ${totalArea.toFixed(1)} km²
Average Density: ${Math.round(totalPopulation / totalArea)}/km²

===========================================
DETAILED ANALYSIS
===========================================

Overall Assessment:
${analysisResult.overall_assessment}

Zone Viability:
${analysisResult.zone_viability}

Population Analysis:
${analysisResult.population_analysis}

Infrastructure Implications:
${analysisResult.infrastructure_implications}

Administrative Efficiency:
${analysisResult.administrative_efficiency}

Development Opportunities:
${analysisResult.development_opportunities}

Challenges:
${analysisResult.challenges}

===========================================
RECOMMENDATIONS
===========================================
${analysisResult.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join("\n")}

===========================================
PROJECT DETAILS
===========================================
Estimated Cost: ${analysisResult.estimated_cost}
Timeline: ${analysisResult.timeline}
Priority Score: ${analysisResult.priority_score}/100

===========================================
WARD BREAKDOWN
===========================================
${selectedWards
  .map(
    (ward) => `
Ward ${ward.ward_no}: ${ward.ward_name}
- Population: ${ward.population.toLocaleString()}
- Area: ${ward.area_sqkm} km²
- Density: ${Math.round(ward.population / ward.area_sqkm)}/km²
`,
  )
  .join("")}

===========================================
END OF REPORT
===========================================
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `zone-analysis-${selectedWards.length}wards-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openMapPage = (mapType: "population" | "reservation") => {
    const fileName = mapType === "population" ? "map_population.html" : "map_reservation.html"
    window.open(`/${fileName}`, "_blank")
  }

  const totalPopulation = selectedWards.reduce((sum, ward) => sum + ward.population, 0)
  const totalArea = selectedWards.reduce((sum, ward) => sum + ward.area_sqkm, 0)
  const averageDensity = totalArea > 0 ? Math.round(totalPopulation / totalArea) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Optimal Zoning Assistant</h1>
          <p className="text-gray-300 text-lg">
            Select wards to create optimal zones and get AI-powered analysis and recommendations
          </p>

          {/* Map Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => openMapPage("population")}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Population Map
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => openMapPage("reservation")}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Map className="h-4 w-4" />
              Reservation Map
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ward Selection */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                Ward Selection
              </CardTitle>
              <p className="text-gray-400">Click on wards to select them for zone analysis</p>
            </CardHeader>
            <CardContent>
              <WardMap
                wards={wards}
                selectedWards={selectedWards.map((w) => w.ward_no)}
                onWardSelect={handleWardSelect}
              />

              {selectedWards.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Selected Wards ({selectedWards.length})</h3>
                    <Button
                      onClick={analyzeZone}
                      disabled={isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyze Zone
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="h-4 w-4" />
                        Total Population
                      </div>
                      <div className="text-white font-semibold text-lg">{totalPopulation.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="h-4 w-4" />
                        Total Area
                      </div>
                      <div className="text-white font-semibold text-lg">{totalArea.toFixed(1)} km²</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedWards.map((ward) => (
                      <Badge
                        key={ward.ward_no}
                        variant="secondary"
                        className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                      >
                        Ward {ward.ward_no}: {ward.ward_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Zone Analysis Results
                </CardTitle>
                {analysisResult && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={downloadAnalysisReport}
                      className="text-gray-400 hover:text-white"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowChat(!showChat)}
                      className="text-gray-400 hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-gray-400">
                {analysisResult
                  ? "Comprehensive analysis of your selected zone"
                  : "Select wards and click 'Analyze Zone' to get detailed insights"}
              </p>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-700/50">
                    <TabsTrigger value="overview" className="text-xs">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="infrastructure" className="text-xs">
                      Infrastructure
                    </TabsTrigger>
                    <TabsTrigger value="development" className="text-xs">
                      Development
                    </TabsTrigger>
                    <TabsTrigger value="challenges" className="text-xs">
                      Challenges
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Priority Score</span>
                        <span className="text-white font-semibold">{analysisResult.priority_score}/100</span>
                      </div>
                      <Progress value={analysisResult.priority_score} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Est. Cost</span>
                        </div>
                        <div className="text-white font-semibold">{analysisResult.estimated_cost}</div>
                      </div>
                      <div className="bg-gray-700/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Timeline</span>
                        </div>
                        <div className="text-white font-semibold">{analysisResult.timeline}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Overall Assessment</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{analysisResult.overall_assessment}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Zone Viability</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{analysisResult.zone_viability}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="infrastructure" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-orange-400">
                        <Zap className="h-5 w-5" />
                        <h4 className="text-white font-medium">Infrastructure Analysis</h4>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {analysisResult.infrastructure_implications}
                      </p>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Shield className="h-5 w-5" />
                        <h4 className="text-white font-medium">Administrative Efficiency</h4>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {analysisResult.administrative_efficiency}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="development" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp className="h-5 w-5" />
                        <h4 className="text-white font-medium">Development Opportunities</h4>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {analysisResult.development_opportunities}
                      </p>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-3">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Key Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-blue-400 font-semibold mt-0.5">{index + 1}.</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="challenges" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <h4 className="text-white font-medium">Challenges & Considerations</h4>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{analysisResult.challenges}</p>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Users className="h-5 w-5" />
                        <h4 className="text-white font-medium">Population Analysis</h4>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{analysisResult.population_analysis}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-lg font-medium mb-2">No Analysis Yet</h3>
                  <p className="text-gray-500 text-sm">
                    Select wards from the map and click "Analyze Zone" to get comprehensive insights about your zone
                    configuration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Assistant */}
        {showChat && analysisResult && (
          <div className="max-w-4xl mx-auto">
            <ZoneChat
              selectedWards={selectedWards}
              analysisResult={analysisResult}
              isVisible={showChat}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
