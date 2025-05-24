"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BarChart, LogOut, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Plus, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ComplianceReport {
  id: string
  project_name: string
  report_id: string
  zone_type: string
  plot_length: number
  plot_breadth: number
  plot_area: number
  road_width: number
  num_floors: string
  building_height: number
  proposed_use: string
  built_up_area: number
  setback_front: number
  setback_rear: number
  setback_side1: number
  setback_side2: number
  basement_provided: boolean
  basement_usage: string | null
  lift_provided: boolean
  car_parking_spaces: number
  twowheeler_parking_spaces: number
  rainwater_harvesting: boolean
  solar_panels: boolean
  stp_installed: boolean
  status: string
  violations: string[]
  recommendations: string[]
  compliance_data: any
  form_data: any
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      setError(null)
      setLoadingReports(true)

      const supabase = createClientComponentClient()

      console.log("Fetching reports for user:", user?.id)

      const { data: reports, error } = await supabase
        .from("compliance_reports")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reports:", error)
        setError("Failed to fetch reports: " + error.message)
      } else {
        console.log("Fetched reports:", reports?.length || 0)
        setReports(reports || [])
      }
    } catch (error) {
      console.error("Unexpected error fetching reports:", error)
      setError("Failed to connect to database")
    } finally {
      setLoadingReports(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleGenerateReport = () => {
    router.push("/dashboard/reports")
  }

  const handleViewReport = (reportId: string) => {
    router.push(`/dashboard/reports?reportId=${reportId}`)
  }

  const getComplianceColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "compliant":
        return "text-green-500"
      case "non-compliant":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "non-compliant":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const calculateComplianceScore = (report: ComplianceReport) => {
    const violationCount = Array.isArray(report.violations) ? report.violations.length : 0
    const recommendationCount = Array.isArray(report.recommendations) ? report.recommendations.length : 0

    // Simple scoring: start with 100, subtract points for violations and recommendations
    let score = 100
    score -= violationCount * 15 // 15 points per violation
    score -= recommendationCount * 5 // 5 points per recommendation

    return Math.max(0, Math.min(100, score)) // Ensure score is between 0-100
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const latestReport = reports.length > 0 ? reports[0] : null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user.email}</p>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-8 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-400">{error}</p>
              <Button onClick={fetchReports} variant="outline" size="sm" className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loadingReports && (
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your reports...</p>
          </CardContent>
        </Card>
      )}

      {/* Latest Compliance Report Status */}
      {!loadingReports && latestReport ? (
        <Card className="mb-8 border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Latest Compliance Report
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {formatDate(latestReport.created_at)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {getComplianceIcon(latestReport.status)}
                  <span className={`font-semibold ${getComplianceColor(latestReport.status)}`}>
                    {latestReport.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Compliance Score</span>
                    <span className="text-white">{calculateComplianceScore(latestReport)}%</span>
                  </div>
                  <Progress value={calculateComplianceScore(latestReport)} className="h-2" />
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2">
                <h4 className="font-medium text-white">Project Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project Name:</span>
                    <span className="text-white">{latestReport.project_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Report ID:</span>
                    <span className="text-white">{latestReport.report_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Building Type:</span>
                    <span className="text-white capitalize">{latestReport.proposed_use}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zone:</span>
                    <span className="text-white">{latestReport.zone_type}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Summary */}
              <div className="space-y-2">
                <h4 className="font-medium text-white">Compliance Summary</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-400">Plot Area</span>
                    </div>
                    <span className="text-white">{latestReport.plot_area.toFixed(1)} sq.m</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-400">Recommendations</span>
                    </div>
                    <span className="text-yellow-500 font-medium">
                      {Array.isArray(latestReport.recommendations) ? latestReport.recommendations.length : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-gray-400">Violations</span>
                    </div>
                    <span className="text-red-500 font-medium">
                      {Array.isArray(latestReport.violations) ? latestReport.violations.length : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <Button
                onClick={() => handleViewReport(latestReport.report_id)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !loadingReports ? (
        <Card className="mb-8 border-l-4 border-l-gray-500">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              No Compliance Reports Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              Generate your first compliance report to see detailed analysis and compliance status.
            </p>
            <Button onClick={handleGenerateReport} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Generate First Report
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Stats Cards */}
      {!loadingReports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card flex items-center p-6">
            <div className="bg-purple-900/20 p-4 rounded-full mr-4">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400">Reports Generated</p>
              <p className="text-3xl font-bold">{reports.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                {latestReport ? `Latest: ${formatDate(latestReport.created_at)}` : "No reports yet"}
              </p>
            </div>
          </div>

          <div className="card flex items-center p-6">
            <div className="bg-purple-900/20 p-4 rounded-full mr-4">
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400">Compliance Score</p>
              <p className="text-3xl font-bold">
                {latestReport ? `${calculateComplianceScore(latestReport)}%` : "N/A"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {latestReport ? "Based on latest report" : "Generate first report"}
              </p>
            </div>
          </div>

          <div className="card flex items-center p-6">
            <div className="bg-purple-900/20 p-4 rounded-full mr-4">
              <BarChart className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400">Total Violations</p>
              <p className="text-3xl font-bold">
                {latestReport ? (Array.isArray(latestReport.violations) ? latestReport.violations.length : 0) : "0"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {latestReport && Array.isArray(latestReport.recommendations) && latestReport.recommendations.length > 0
                  ? `${latestReport.recommendations.length} recommendations`
                  : "No issues found"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handleGenerateReport}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors text-center group"
              >
                <div className="group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-medium block">
                    {latestReport ? "Generate New Report" : "Generate First Report"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {latestReport ? "Create another compliance report" : "Start your compliance analysis"}
                  </span>
                </div>
              </button>

              <button
                onClick={() => router.push("/dashboard/grievance")}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors text-center group"
              >
                <div className="group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-medium block">Submit Grievance</span>
                  <span className="text-xs text-gray-400 mt-1 block">Report planning issues</span>
                </div>
              </button>

              <button
                onClick={() => router.push("/dashboard/zoning")}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors text-center group"
              >
                <div className="group-hover:scale-110 transition-transform">
                  <BarChart className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-sm font-medium block">Zone Analysis</span>
                  <span className="text-xs text-gray-400 mt-1 block">Analyze zoning requirements</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          {!loadingReports && reports.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
              <div className="space-y-4">
                {reports.slice(0, 5).map((report, index) => (
                  <div
                    key={report.id}
                    className="flex justify-between items-center p-4 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleViewReport(report.report_id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getComplianceIcon(report.status)}
                        <p className="font-medium">{report.project_name}</p>
                      </div>
                      <p className="text-sm text-gray-400">
                        {report.proposed_use} • {report.zone_type} • {report.num_floors}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(report.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === "compliant"
                            ? "bg-green-900/30 text-green-400"
                            : report.status === "non-compliant"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {report.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">Score: {calculateComplianceScore(report)}%</p>
                      <Eye className="h-4 w-4 text-gray-400 mt-1 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Compliance Tips */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Compliance Tips</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/20 rounded-md border-l-2 border-blue-500">
                <p className="text-sm font-medium text-blue-400">Setback Requirements</p>
                <p className="text-xs text-gray-400 mt-1">Ensure minimum 3m front setback for residential buildings</p>
              </div>
              <div className="p-3 bg-green-900/20 rounded-md border-l-2 border-green-500">
                <p className="text-sm font-medium text-green-400">Environmental Features</p>
                <p className="text-xs text-gray-400 mt-1">Rainwater harvesting is mandatory for plots &gt; 60 sq.m</p>
              </div>
              <div className="p-3 bg-yellow-900/20 rounded-md border-l-2 border-yellow-500">
                <p className="text-sm font-medium text-yellow-400">Building Height</p>
                <p className="text-xs text-gray-400 mt-1">Maximum 15m height allowed in R1 zones</p>
              </div>
              <div className="p-3 bg-purple-900/20 rounded-md border-l-2 border-purple-500">
                <p className="text-sm font-medium text-purple-400">Parking Requirements</p>
                <p className="text-xs text-gray-400 mt-1">1 car space per 100 sq.m built-up area</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
