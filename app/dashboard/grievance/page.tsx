"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Upload, MapPin, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  title: string
  description: string
  dateObserved: string
  image: File | null
  locationAddress: string
  pinCode: string
  wardNumber: string
}

interface FormErrors {
  title?: string
  description?: string
  dateObserved?: string
  image?: string
  locationAddress?: string
  pinCode?: string
}

export default function GrievancePage() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dateObserved: "",
    image: null,
    locationAddress: "",
    pinCode: "",
    wardNumber: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Grievance title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Grievance description is required"
    }

    if (!formData.dateObserved) {
      newErrors.dateObserved = "Date observed is required"
    }

    if (!formData.image) {
      newErrors.image = "Image upload is required"
    }

    if (!formData.locationAddress.trim()) {
      newErrors.locationAddress = "Location address is required"
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "Pin code is required"
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Pin code must be 6 digits"
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
      // Validate file type
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: "Only JPG and PNG images are allowed" }))
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 10MB" }))
        return
      }

      setFormData((prev) => ({ ...prev, image: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Clear image error
      setErrors((prev) => ({ ...prev, image: undefined }))
    }
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const isFormValid = (): boolean => {
    return !!(
      formData.title.trim() &&
      formData.description.trim() &&
      formData.dateObserved &&
      formData.image &&
      formData.locationAddress.trim() &&
      formData.pinCode.trim() &&
      /^\d{6}$/.test(formData.pinCode) &&
      Object.keys(errors).length === 0
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData)
    }, 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Grievance Upload</h1>
        <p className="text-gray-600">Report issues and concerns in your area with detailed information and evidence.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Submit New Grievance
          </CardTitle>
          <CardDescription>
            Please provide detailed information about the issue you've observed. All fields marked with * are required.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grievance Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Grievance Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Brief title describing the issue"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-500 focus:border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Grievance Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Grievance Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed description of the issue, including what you observed, when it occurred, and any relevant context..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`min-h-[120px] ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
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

                {/* Image Preview */}
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

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Location Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="locationAddress" className="text-sm font-medium">
                    Location Address *
                  </Label>
                  <Input
                    id="locationAddress"
                    type="text"
                    placeholder="Complete address where the issue was observed"
                    value={formData.locationAddress}
                    onChange={(e) => handleInputChange("locationAddress", e.target.value)}
                    className={errors.locationAddress ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {errors.locationAddress && <p className="text-sm text-red-600">{errors.locationAddress}</p>}
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

                {/* Ward Number */}
                <div className="space-y-2">
                  <Label htmlFor="wardNumber" className="text-sm font-medium">
                    Ward Number (Optional)
                  </Label>
                  <Input
                    id="wardNumber"
                    type="number"
                    placeholder="Ward number if known"
                    value={formData.wardNumber}
                    onChange={(e) => handleInputChange("wardNumber", e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Form Status */}
            {isFormValid() && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Form is ready for submission. All required fields are completed.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full md:w-auto px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading Grievance...
                  </div>
                ) : (
                  "Upload Grievance"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
