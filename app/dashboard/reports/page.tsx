"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, FileText, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useSearchParams } from "next/navigation"
import { ComplianceReport } from "@/components/compliance-report"
import { formSchema, type FormValues } from "@/lib/schemas"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ReportsPage() {
  const [plotArea, setPlotArea] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loadingExistingReport, setLoadingExistingReport] = useState(false)

  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const reportId = searchParams.get("reportId")
  const supabase = createClientComponentClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      zoneType: "",
      plotLength: 0,
      plotBreadth: 0,
      roadWidth: 0,
      numFloors: "",
      buildingHeight: 0,
      proposedUse: "",
      builtUpArea: 0,
      setbackFront: 0,
      setbackRear: 0,
      setbackSide1: 0,
      setbackSide2: 0,
      basementProvided: false,
      basementUsage: "",
      liftProvided: false,
      carParkingSpaces: 0,
      twowheelerParkingSpaces: 0,
      rainwaterHarvesting: false,
      solarPanels: false,
      stpInstalled: false,
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, loading, router])

  // Load existing report if reportId is provided
  useEffect(() => {
    if (reportId && user) {
      loadExistingReport(reportId)
    }
  }, [reportId, user])

  const loadExistingReport = async (id: string) => {
    setLoadingExistingReport(true)
    try {
      const { data: report, error } = await supabase
        .from("compliance_reports")
        .select("*")
        .eq("report_id", id)
        .eq("user_id", user?.id)
        .single()

      if (error) {
        console.error("Error loading report:", error)
        setError("Failed to load report")
        return
      }

      if (report) {
        // Load form data
        if (report.form_data) {
          const formData = report.form_data
          Object.keys(formData).forEach((key) => {
            if (key in form.getValues()) {
              form.setValue(key as keyof FormValues, formData[key])
            }
          })
          setPlotArea(calculatePlotArea(formData.plotLength || 0, formData.plotBreadth || 0))
        }

        // Load compliance results and set the project name
        if (report.compliance_data) {
          setResult({
            ...report.compliance_data,
            projectName: report.project_name || report.form_data?.projectName,
          })
        }
      }
    } catch (error) {
      console.error("Error loading existing report:", error)
      setError("Failed to load report")
    } finally {
      setLoadingExistingReport(false)
    }
  }

  const calculatePlotArea = (length: number, breadth: number) => {
    const lengthInMeters = length * 0.3048
    const breadthInMeters = breadth * 0.3048
    return (lengthInMeters * breadthInMeters).toFixed(2)
  }

  const fillSampleData = () => {
    form.setValue("projectName", "Sample Residential Project")
    form.setValue("zoneType", "R1")
    form.setValue("plotLength", 40)
    form.setValue("plotBreadth", 60)
    form.setValue("roadWidth", 30)
    form.setValue("numFloors", "G+2")
    form.setValue("buildingHeight", 12)
    form.setValue("proposedUse", "residential")
    form.setValue("builtUpArea", 150)
    form.setValue("setbackFront", 3)
    form.setValue("setbackRear", 2)
    form.setValue("setbackSide1", 1.5)
    form.setValue("setbackSide2", 1.5)
    form.setValue("basementProvided", true)
    form.setValue("basementUsage", "parking")
    form.setValue("liftProvided", false)
    form.setValue("carParkingSpaces", 2)
    form.setValue("twowheelerParkingSpaces", 4)
    form.setValue("rainwaterHarvesting", true)
    form.setValue("solarPanels", false)
    form.setValue("stpInstalled", true)

    // Update plot area
    setPlotArea(calculatePlotArea(40, 60))
  }

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      setError("Please sign in to use this feature")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      console.log("Starting compliance analysis...")

      // Generate compliance report
      const response = await fetch("/api/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData: values,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const complianceResult = await response.json()
      console.log("Compliance analysis completed:", complianceResult.reportId)
      setResult(complianceResult)

      // Save to Supabase directly using client
      console.log("Saving report to database...")

      // Calculate plot area in square meters
      const plotAreaSqM = (values.plotLength * values.plotBreadth * 0.092903).toFixed(2)

      // Prepare the data for insertion matching your table structure
      const reportData = {
        user_id: user.id,
        project_name: values.projectName,
        report_id: complianceResult.reportId || `RPT-${Date.now()}`,
        zone_type: values.zoneType,
        plot_length: values.plotLength,
        plot_breadth: values.plotBreadth,
        plot_area: Number.parseFloat(plotAreaSqM),
        road_width: values.roadWidth,
        num_floors: values.numFloors,
        building_height: values.buildingHeight,
        proposed_use: values.proposedUse,
        built_up_area: values.builtUpArea,
        setback_front: values.setbackFront,
        setback_rear: values.setbackRear,
        setback_side1: values.setbackSide1,
        setback_side2: values.setbackSide2,
        basement_provided: values.basementProvided,
        basement_usage: values.basementUsage || null,
        lift_provided: values.liftProvided,
        car_parking_spaces: values.carParkingSpaces,
        twowheeler_parking_spaces: values.twowheelerParkingSpaces,
        rainwater_harvesting: values.rainwaterHarvesting,
        solar_panels: values.solarPanels,
        stp_installed: values.stpInstalled,
        status: complianceResult.compliance?.overall || "pending",
        violations: complianceResult.compliance?.violations || [],
        recommendations: complianceResult.compliance?.recommendations || [],
        // Save complete compliance data and form data as JSONB
        compliance_data: complianceResult,
        form_data: values,
      }

      const { data: report, error: saveError } = await supabase
        .from("compliance_reports")
        .insert(reportData)
        .select()
        .single()

      if (saveError) {
        console.error("Failed to save report:", saveError)
        setError(`Report generated but failed to save: ${saveError.message}`)
      } else {
        console.log("Report saved successfully:", report.id)
        setSuccess("Report generated and saved successfully!")

        // Update URL to include the report ID for future reference
        const newUrl = `/dashboard/reports?reportId=${reportData.report_id}`
        window.history.replaceState({}, "", newUrl)
      }

      // Also save to localStorage as backup
      localStorage.setItem(
        "latestComplianceReport",
        JSON.stringify({
          ...complianceResult,
          timestamp: new Date().toISOString(),
          formData: values,
          projectName: values.projectName,
        }),
      )
    } catch (error: any) {
      console.error("Error submitting form:", error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking authentication
  if (loading || loadingExistingReport) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="card p-6">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="ml-2 text-gray-300">{loadingExistingReport ? "Loading report..." : "Loading..."}</span>
        </div>
      </div>
    )
  }

  // Show sign-in message if not authenticated
  if (!user) {
    return (
      <div className="section-container">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to access the compliance checker.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen">
      <div className="section-container space-y-12">
        {/* Header */}
        <div className="text-center space-y-6 py-8">
          <h1 className="text-4xl font-bold gradient-text">
            {reportId ? "View Compliance Report" : "Building Plan Compliance Checker"}
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            {reportId
              ? "Viewing saved compliance report and analysis."
              : "Verify your building plan compliance with BBMP regulations and generate detailed reports."}
          </p>
          {reportId && (
            <div className="flex gap-4 justify-center pt-4">
              <Button
                onClick={() => router.push("/dashboard/reports")}
                variant="outline"
                size="sm"
                className="btn-secondary"
              >
                Generate New Report
              </Button>
              <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm" className="btn-secondary">
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>

        {/* Sample Data Button - only show when creating new report */}
        {!reportId && (
          <div className="flex justify-center py-4">
            <Button
              onClick={fillSampleData}
              disabled={isSubmitting}
              variant="outline"
              className="btn-secondary bg-transparent px-8 py-3"
            >
              <FileText className="mr-2 h-4 w-4" />
              Fill Sample Data
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="max-w-4xl mx-auto my-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 max-w-4xl mx-auto my-6">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card className="card max-w-6xl mx-auto">
          <CardHeader className="border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-8">
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <FileText className="h-7 w-7 text-purple-400" />
              {reportId ? "Report Details" : "Building Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
                {/* Project Information */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Project Information</h3>
                  </div>
                  <div className="pt-4">
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Project Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter project name (e.g., Residential Complex Phase 1)"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20 h-14 text-lg px-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                    <FormField
                      control={form.control}
                      name="zoneType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Zone Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!!reportId}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg focus:border-purple-500">
                                <SelectValue placeholder="Select zone type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="R1" className="text-white hover:bg-gray-700 py-3">
                                Residential - Main (R1)
                              </SelectItem>
                              <SelectItem value="R2" className="text-white hover:bg-gray-700 py-3">
                                Residential - Mixed (R2)
                              </SelectItem>
                              <SelectItem value="C" className="text-white hover:bg-gray-700 py-3">
                                Commercial (C)
                              </SelectItem>
                              <SelectItem value="I" className="text-white hover:bg-gray-700 py-3">
                                Industrial (I)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="proposedUse"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Proposed Use</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!!reportId}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg focus:border-purple-500">
                                <SelectValue placeholder="Select proposed use" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="residential" className="text-white hover:bg-gray-700 py-3">
                                Residential
                              </SelectItem>
                              <SelectItem value="commercial" className="text-white hover:bg-gray-700 py-3">
                                Commercial
                              </SelectItem>
                              <SelectItem value="mixed" className="text-white hover:bg-gray-700 py-3">
                                Mixed Use
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numFloors"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Number of Floors</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!!reportId}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg focus:border-purple-500">
                                <SelectValue placeholder="Select floors" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              {["G", "G+1", "G+2", "G+3", "G+4", "G+5"].map((floor) => (
                                <SelectItem key={floor} value={floor} className="text-white hover:bg-gray-700 py-3">
                                  {floor}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Plot Details */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Plot Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                    <FormField
                      control={form.control}
                      name="plotLength"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Plot Length (feet)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => {
                                const value = Number.parseFloat(e.target.value) || 0
                                field.onChange(value)
                                setPlotArea(calculatePlotArea(value, form.getValues("plotBreadth")))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plotBreadth"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Plot Breadth (feet)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => {
                                const value = Number.parseFloat(e.target.value) || 0
                                field.onChange(value)
                                setPlotArea(calculatePlotArea(form.getValues("plotLength"), value))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel className="text-gray-300 font-medium text-lg">Plot Area (sq.m)</FormLabel>
                      <Input
                        type="text"
                        value={plotArea}
                        disabled
                        className="bg-gray-700/50 border-gray-600 text-gray-300 h-14 text-lg px-4"
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="roadWidth"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Road Width (feet)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Building Details */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Building Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <FormField
                      control={form.control}
                      name="buildingHeight"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Building Height (meters)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="builtUpArea"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">
                            Total Built-up Area (sq.m)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Setbacks */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Setbacks (meters)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                    <FormField
                      control={form.control}
                      name="setbackFront"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Front Setback</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="setbackRear"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Rear Setback</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="setbackSide1"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Side 1 Setback</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="setbackSide2"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-300 font-medium text-lg">Side 2 Setback</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              {...field}
                              disabled={!!reportId}
                              className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Building Features */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Building Features</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="basementProvided"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 bg-gray-800/30 p-8 hover:bg-gray-800/50 transition-colors">
                            <div className="space-y-2">
                              <FormLabel className="text-lg text-white font-medium">Basement Provided</FormLabel>
                              <p className="text-sm text-gray-400">Is there a basement in the building?</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!!reportId} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("basementProvided") && (
                        <FormField
                          control={form.control}
                          name="basementUsage"
                          render={({ field }) => (
                            <FormItem className="space-y-3 ml-4">
                              <FormLabel className="text-gray-300 font-medium text-lg">Basement Usage</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={!!reportId}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg focus:border-purple-500">
                                    <SelectValue placeholder="Select basement usage" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                  <SelectItem value="parking" className="text-white hover:bg-gray-700 py-3">
                                    Parking
                                  </SelectItem>
                                  <SelectItem value="storage" className="text-white hover:bg-gray-700 py-3">
                                    Storage
                                  </SelectItem>
                                  <SelectItem value="utility" className="text-white hover:bg-gray-700 py-3">
                                    Utility
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="liftProvided"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 bg-gray-800/30 p-8 hover:bg-gray-800/50 transition-colors">
                            <div className="space-y-2">
                              <FormLabel className="text-lg text-white font-medium">Lift Provided</FormLabel>
                              <p className="text-sm text-gray-400">Is there an elevator in the building?</p>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!!reportId} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="carParkingSpaces"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-gray-300 font-medium text-lg">Car Parking Spaces</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={!!reportId}
                                className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twowheelerParkingSpaces"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-gray-300 font-medium text-lg">
                              Two-Wheeler Parking Spaces
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                disabled={!!reportId}
                                className="bg-gray-800/50 border-gray-600 text-white h-14 text-lg px-4 focus:border-purple-500 focus:ring-purple-500/20"
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Environmental Features */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 pb-4 border-b border-purple-500/30">
                    <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-2xl font-semibold text-white">Environmental Features</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    <FormField
                      control={form.control}
                      name="rainwaterHarvesting"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 bg-gray-800/30 p-8 hover:bg-gray-800/50 transition-colors">
                          <div className="space-y-2">
                            <FormLabel className="text-lg text-white font-medium">Rainwater Harvesting</FormLabel>
                            <p className="text-sm text-gray-400">Water conservation system</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!!reportId} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="solarPanels"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 bg-gray-800/30 p-8 hover:bg-gray-800/50 transition-colors">
                          <div className="space-y-2">
                            <FormLabel className="text-lg text-white font-medium">Solar Panels</FormLabel>
                            <p className="text-sm text-gray-400">Renewable energy system</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!!reportId} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stpInstalled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 bg-gray-800/30 p-8 hover:bg-gray-800/50 transition-colors">
                          <div className="space-y-2">
                            <FormLabel className="text-lg text-white font-medium">STP Installed</FormLabel>
                            <p className="text-sm text-gray-400">Sewage treatment plant</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!!reportId} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button - only show when creating new report */}
                {!reportId && (
                  <div className="pt-12">
                    <Button
                      type="submit"
                      className="w-full btn-primary h-16 text-xl font-semibold"
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Analyzing Compliance...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-3 h-6 w-6" />
                          Generate Compliance Report
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Compliance Report */}
        {result && <ComplianceReport data={result} projectName={form.getValues("projectName") || result.projectName} />}
      </div>
    </div>
  )
}
