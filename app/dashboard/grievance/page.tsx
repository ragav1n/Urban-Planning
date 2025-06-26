"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Upload, AlertCircle, CheckCircle2, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface FormData {
  image: File | null
  description: string
  pinCode: string
  dateObserved: string
}

interface FormErrors {
  image?: string
  pinCode?: string
  dateObserved?: string
}

interface Grievance {
  id: string
  image_url: string
  description: string | null
  pin_code: string
  date_observed: string
  category: string
  status: string
  created_at: string
}

interface AnalysisResult {
  category: string
  image_url: string
}

export default function GrievancePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    image: null,
    description: "",
    pinCode: "",
    dateObserved: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    if (user) {
      fetchGrievanceHistory()
    }
  }, [user])

  const fetchGrievanceHistory = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from("grievances")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching grievances:", error)
      } else {
        setGrievances(data || [])
      }
    } catch (error) {
      console.error("Error fetching grievances:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.image) {
      newErrors.image = "Image is required"
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "Pin code is required"
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Pin code must be 6 digits"
    }

    if (!formData.dateObserved) {
      newErrors.dateObserved = "Date observed is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: "Only JPG and PNG images are allowed" }))
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 10MB" }))
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      setErrors((prev) => ({ ...prev, image: undefined }))
      setAnalysisResult(null)
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    setAnalysisResult(null)
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const analyzeImage = async () => {
    if (!formData.image || !validateForm()) return

    setIsAnalyzing(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("image", formData.image)

      const response = await fetch("/api/grievances/analyze", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error("Error analyzing image:", error)
      alert("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveGrievance = async () => {
    if (!analysisResult || !user) return

    setIsSaving(true)

    try {
      console.log("Saving grievance directly to Supabase...")
      const supabase = createClientComponentClient()

      const { data, error } = await supabase
        .from("grievances")
        .insert({
          user_id: user.id,
          image_url: analysisResult.image_url,
          description: formData.description || null,
          pin_code: formData.pinCode,
          date_observed: formData.dateObserved,
          category: analysisResult.category,
          status: "pending",
        })
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        throw new Error("Failed to save to database: " + error.message)
      }

      console.log("Grievance saved successfully:", data)

      // Reset form
      setFormData({
        image: null,
        description: "",
        pinCode: "",
        dateObserved: "",
      })
      setImagePreview(null)
      setAnalysisResult(null)

      // Clear file input
      const fileInput = document.getElementById("image-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh history
      await fetchGrievanceHistory()

      alert("Grievance submitted successfully!")
    } catch (error) {
      console.error("Error saving grievance:", error)
      alert("Failed to save grievance: " + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = (): boolean => {
    const hasImage = !!formData.image
    const hasPinCode = formData.pinCode.trim().length > 0
    const isValidPinCode = /^\d{6}$/.test(formData.pinCode.trim())
    const hasDate = formData.dateObserved.trim().length > 0

    return hasImage && hasPinCode && isValidPinCode && hasDate
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Pothole: "bg-red-100 text-red-800",
      Accident: "bg-red-100 text-red-800",
      Garbage: "bg-yellow-100 text-yellow-800",
      Flooding: "bg-blue-100 text-blue-800",
      Streetlight: "bg-purple-100 text-purple-800",
      "Construction Debris": "bg-orange-100 text-orange-800",
      "Broken Footpath": "bg-gray-100 text-gray-800",
      Fire: "bg-red-100 text-red-800",
      "Fallen Tree": "bg-green-100 text-green-800",
      Other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Grievance Upload</h1>
        <p className="text-white">Report issues and concerns in your area with AI-powered image analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Submit New Grievance
            </CardTitle>
            <CardDescription>Upload an image and provide details about the issue you've observed.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-sm font-medium">
                Evidence Image *
              </Label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPG or PNG (MAX. 10MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2"
                    >
                      Remove
                    </Button>
                  </div>
                )}

                {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Additional details about the issue..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Pin Code */}
            <div className="space-y-2">
              <Label htmlFor="pinCode" className="text-sm font-medium">
                Pin Code *
              </Label>
              <Input
                id="pinCode"
                type="text"
                placeholder="6-digit pin code"
                value={formData.pinCode}
                onChange={(e) => handleInputChange("pinCode", e.target.value)}
                maxLength={6}
                className={errors.pinCode ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.pinCode && <p className="text-sm text-red-600">{errors.pinCode}</p>}
            </div>

            {/* Date Observed */}
            <div className="space-y-2">
              <Label htmlFor="dateObserved" className="text-sm font-medium">
                Date Observed *
              </Label>
              <div className="relative">
                <Input
                  id="dateObserved"
                  type="date"
                  value={formData.dateObserved}
                  onChange={(e) => handleInputChange("dateObserved", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={errors.dateObserved ? "border-red-500 focus:border-red-500" : ""}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.dateObserved && <p className="text-sm text-red-600">{errors.dateObserved}</p>}
            </div>

            {/* Analyze Button */}
            <div className="space-y-2">
              <Button
                onClick={analyzeImage}
                disabled={!isFormValid() || isAnalyzing}
                className={`w-full ${isFormValid() && !isAnalyzing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"}`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing Image...
                  </div>
                ) : (
                  "Analyze Image"
                )}
              </Button>
            </div>

            {/* Analysis Result */}
            {analysisResult && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p>
                      <strong>Analysis Complete!</strong>
                    </p>
                    <p>
                      Category:{" "}
                      <Badge className={getCategoryColor(analysisResult.category)}>{analysisResult.category}</Badge>
                    </p>
                    <Button onClick={saveGrievance} disabled={isSaving} className="mt-2">
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </div>
                      ) : (
                        "Submit Grievance"
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Grievance History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Your Grievance History
            </CardTitle>
            <CardDescription>Track the status of your previously submitted grievances.</CardDescription>
          </CardHeader>

          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading history...</p>
              </div>
            ) : grievances.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No grievances submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {grievances.map((grievance) => (
                  <div key={grievance.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(grievance.category)}>{grievance.category}</Badge>
                          <Badge className={getStatusColor(grievance.status)}>
                            {grievance.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          Pin Code: {grievance.pin_code}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Date Observed: {new Date(grievance.date_observed).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Submitted: {formatDate(grievance.created_at)}</p>
                        {grievance.description && <p className="text-sm text-gray-700 mt-2">{grievance.description}</p>}
                      </div>
                      <img
                        src={grievance.image_url || "/placeholder.svg"}
                        alt="Grievance"
                        className="w-16 h-16 object-cover rounded-lg ml-4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
