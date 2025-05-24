"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, Download, FileText } from "lucide-react"

interface ComplianceData {
  reportId: string
  date: string
  projectDetails: {
    plotArea: number
    buildingType: string
    zoneType: string
    buildingHeight: number
    numFloors: string
    builtUpArea: number
  }
  setbacks: {
    front: { provided: number; required: number; status: string }
    rear: { provided: number; required: number; status: string }
    side1: { provided: number; required: number; status: string }
    side2: { provided: number; required: number; status: string }
  }
  compliance: {
    overall: string
    compliantItems: string[]
    warnings: string[]
    violations: string[]
  }
  features: {
    basement: boolean
    lift: boolean
    parking: { car: number; twoWheeler: number }
    environmental: {
      rainwaterHarvesting: boolean
      solarPanels: boolean
      stp: boolean
    }
  }
  recommendations: string[]
  references: string[]
  projectName?: string
}

interface ComplianceReportProps {
  data: ComplianceData
  projectName?: string
}

export function ComplianceReport({ data, projectName }: ComplianceReportProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  let printWindow: Window | null = null

  const getStatusIcon = (status: string | undefined | null) => {
    const statusStr = status?.toLowerCase() || "unknown"
    switch (statusStr) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "violation":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string | undefined | null) => {
    const statusStr = status?.toLowerCase() || "unknown"
    switch (statusStr) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Compliant</Badge>
      case "warning":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Warning</Badge>
      case "violation":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Violation</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>
    }
  }

  // Get the project name with proper priority
  const getProjectName = () => {
    // First priority: projectName prop passed from parent
    if (projectName && projectName.trim() !== "") {
      return projectName.trim()
    }
    // Second priority: projectName from data
    if (data?.projectName && data.projectName.trim() !== "") {
      return data.projectName.trim()
    }
    // Fallback
    return "Unnamed Project"
  }

  const actualProjectName = getProjectName()

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Unable to open print window. Please check your browser's popup settings.")
      }
      // Create a simplified PDF content
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>BBMP Compliance Report - ${safeData.reportId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 25px; page-break-inside: avoid; }
              .section-title { font-size: 18px; font-weight: bold; color: #2563eb; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
              .status-compliant { color: #16a34a; font-weight: bold; }
              .status-warning { color: #ea580c; font-weight: bold; }
              .status-violation { color: #dc2626; font-weight: bold; }
              .status-non-compliant { color: #dc2626; font-weight: bold; }
              .list-item { margin: 5px 0; padding-left: 20px; }
              .warning-item { margin: 10px 0; padding: 10px; background-color: #fef3c7; border-left: 4px solid #f59e0b; }
              .violation-item { margin: 10px 0; padding: 10px; background-color: #fee2e2; border-left: 4px solid #dc2626; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
              th { background-color: #f9fafb; font-weight: bold; }
              .violation-badge { background-color: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
              .compliant-badge { background-color: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
              @media print { 
                body { margin: 0; } 
                .section { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BRUHAT BENGALURU MAHANAGARA PALIKE (BBMP)</h1>
              <h2>Building Plan Compliance Report</h2>
              <h3 style="color: #2563eb; margin: 10px 0;">Project: ${actualProjectName}</h3>
              <p><strong>Report ID:</strong> ${safeData.reportId} | <strong>Date:</strong> ${safeData.date}</p>
            </div>

            <div class="section">
              <div class="section-title">Project Details</div>
              <div class="grid">
                <div class="detail-row"><span>Plot Area:</span><span>${safeData.projectDetails.plotArea || "N/A"} sq.m</span></div>
                <div class="detail-row"><span>Building Type:</span><span>${safeData.projectDetails.buildingType || "N/A"}</span></div>
                <div class="detail-row"><span>Zone Type:</span><span>${safeData.projectDetails.zoneType || "N/A"}</span></div>
                <div class="detail-row"><span>Building Height:</span><span>${safeData.projectDetails.buildingHeight || "N/A"}m</span></div>
                <div class="detail-row"><span>Number of Floors:</span><span>${safeData.projectDetails.numFloors || "N/A"}</span></div>
                <div class="detail-row"><span>Built-up Area:</span><span>${safeData.projectDetails.builtUpArea || "N/A"} sq.m</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Overall Compliance Status</div>
              <p class="status-${(safeData.compliance.overall || "unknown").toLowerCase()}">
                <strong>${(safeData.compliance.overall || "UNKNOWN").toUpperCase()}</strong>
              </p>
            </div>

            <div class="section">
              <div class="section-title">Setback Analysis</div>
              <table>
                <tr><th>Setback</th><th>Required (m)</th><th>Provided (m)</th><th>Status</th></tr>
                <tr>
                  <td>Front</td>
                  <td>${safeData.setbacks.front.required || "N/A"}</td>
                  <td>${safeData.setbacks.front.provided || "N/A"}</td>
                  <td><span class="${safeData.setbacks.front.status === "compliant" ? "compliant-badge" : "violation-badge"}">${safeData.setbacks.front.status || "Unknown"}</span></td>
                </tr>
                <tr>
                  <td>Rear</td>
                  <td>${safeData.setbacks.rear.required || "N/A"}</td>
                  <td>${safeData.setbacks.rear.provided || "N/A"}</td>
                  <td><span class="${safeData.setbacks.rear.status === "compliant" ? "compliant-badge" : "violation-badge"}">${safeData.setbacks.rear.status || "Unknown"}</span></td>
                </tr>
                <tr>
                  <td>Side 1</td>
                  <td>${safeData.setbacks.side1.required || "N/A"}</td>
                  <td>${safeData.setbacks.side1.provided || "N/A"}</td>
                  <td><span class="${safeData.setbacks.side1.status === "compliant" ? "compliant-badge" : "violation-badge"}">${safeData.setbacks.side1.status || "Unknown"}</span></td>
                </tr>
                <tr>
                  <td>Side 2</td>
                  <td>${safeData.setbacks.side2.required || "N/A"}</td>
                  <td>${safeData.setbacks.side2.provided || "N/A"}</td>
                  <td><span class="${safeData.setbacks.side2.status === "compliant" ? "compliant-badge" : "violation-badge"}">${safeData.setbacks.side2.status || "Unknown"}</span></td>
                </tr>
              </table>
            </div>

            ${
              safeData.compliance.compliantItems.length > 0
                ? `
            <div class="section">
              <div class="section-title">Compliant Items</div>
              ${safeData.compliance.compliantItems.map((item) => `<div class="list-item">• ${item}</div>`).join("")}
            </div>
            `
                : ""
            }

            ${
              safeData.compliance.warnings.length > 0
                ? `
            <div class="section">
              <div class="section-title">Warnings & Improvement Areas</div>
              ${safeData.compliance.warnings
                .map((item) => {
                  let explanation = ""
                  if (item.includes("parking")) {
                    explanation =
                      "<br><strong>Impact:</strong> Insufficient parking can lead to street congestion and may affect approval. Consider optimizing space allocation or providing mechanical parking solutions."
                  } else if (item.includes("height")) {
                    explanation =
                      "<br><strong>Impact:</strong> Building height approaching limits may restrict future modifications. Ensure structural calculations account for maximum permissible height."
                  } else if (item.includes("setback")) {
                    explanation =
                      "<br><strong>Impact:</strong> Minimal setbacks may affect natural lighting and ventilation. Consider increasing setbacks for better compliance and livability."
                  } else if (item.includes("environmental")) {
                    explanation =
                      "<br><strong>Impact:</strong> Missing environmental features may affect approval and long-term sustainability. These features are increasingly becoming mandatory."
                  }
                  return `<div class="warning-item"><strong>Warning:</strong> ${item}${explanation}</div>`
                })
                .join("")}
            </div>
            `
                : ""
            }

            ${
              safeData.compliance.violations.length > 0
                ? `
<div class="section">
  <div class="section-title">Violations & Required Actions</div>
  ${safeData.compliance.violations
    .map((item) => {
      let explanation = ""
      if (item.includes("Front setback")) {
        explanation =
          "<br><strong>Why this is a violation:</strong> Front setbacks are mandatory to ensure proper road visibility, emergency vehicle access, and maintain neighborhood aesthetics. BBMP requires minimum 3m front setback for safety and urban planning standards.<br><strong>Required Action:</strong> Reduce building footprint or reposition structure to achieve minimum 3m front setback."
      } else if (item.includes("Rear setback")) {
        explanation =
          "<br><strong>Why this is a violation:</strong> Rear setbacks provide essential space for natural light, ventilation, and emergency access. The 2m minimum requirement ensures buildings don't create cramped conditions affecting neighboring properties.<br><strong>Required Action:</strong> Modify building design to provide minimum 2m rear setback."
      } else if (item.includes("Side") && item.includes("setback")) {
        explanation =
          "<br><strong>Why this is a violation:</strong> Side setbacks prevent fire hazards, ensure proper ventilation between buildings, and provide space for maintenance. The 1.5m requirement maintains safe distances between structures.<br><strong>Required Action:</strong> Adjust building width to achieve minimum 1.5m side setbacks."
      } else if (item.includes("height")) {
        explanation =
          "<br><strong>Why this is a violation:</strong> Building height restrictions ensure structural safety, prevent overcrowding, maintain neighborhood character, and ensure adequate infrastructure capacity for the area.<br><strong>Required Action:</strong> Reduce building height or number of floors to comply with zoning regulations."
      } else if (item.includes("parking")) {
        explanation =
          "<br><strong>Why this is a violation:</strong> Adequate parking prevents street congestion and ensures proper traffic flow. BBMP mandates minimum parking based on building use and size.<br><strong>Required Action:</strong> Increase parking spaces as per BBMP norms or provide alternative parking solutions."
      }
      return `<div class="violation-item"><strong>Violation:</strong> ${item}${explanation}</div>`
    })
    .join("")}
</div>
`
                : ""
            }

            <div class="section">
              <div class="section-title">Building Features</div>
              <div class="grid">
                <div class="detail-row"><span>Basement:</span><span>${safeData.features.basement ? "Yes" : "No"}</span></div>
                <div class="detail-row"><span>Lift:</span><span>${safeData.features.lift ? "Yes" : "No"}</span></div>
                <div class="detail-row"><span>Car Parking:</span><span>${safeData.features.parking.car} spaces</span></div>
                <div class="detail-row"><span>Two-Wheeler Parking:</span><span>${safeData.features.parking.twoWheeler} spaces</span></div>
                <div class="detail-row"><span>Rainwater Harvesting:</span><span>${safeData.features.environmental.rainwaterHarvesting ? "Yes" : "No"}</span></div>
                <div class="detail-row"><span>Solar Panels:</span><span>${safeData.features.environmental.solarPanels ? "Yes" : "No"}</span></div>
                <div class="detail-row"><span>STP Installed:</span><span>${safeData.features.environmental.stp ? "Yes" : "No"}</span></div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Recommendations</div>
              ${safeData.recommendations
                .map((item, index) => {
                  let enhancedRec = item
                  if (item.includes("setback violations")) {
                    enhancedRec =
                      "<strong>Address Setback Violations:</strong> Revise building plans to meet BBMP setback requirements. Consider reducing building footprint or repositioning the structure within the plot to achieve compliance. Consult with a licensed architect for optimal design solutions."
                  } else if (item.includes("construction follows")) {
                    enhancedRec =
                      "<strong>Follow Approved Plans:</strong> Ensure all construction activities strictly adhere to the sanctioned building plans. Any deviations require prior approval from BBMP to avoid legal complications and potential demolition orders."
                  } else if (item.includes("waste management")) {
                    enhancedRec =
                      "<strong>Implement Waste Management:</strong> Install proper segregation systems for wet and dry waste. Consider composting units for organic waste and ensure proper disposal channels for construction debris as per BBMP guidelines."
                  } else if (item.includes("green building")) {
                    enhancedRec =
                      "<strong>Green Building Practices:</strong> Incorporate energy-efficient lighting, water-saving fixtures, and sustainable materials. Consider IGBC certification for long-term benefits and environmental compliance."
                  } else if (item.includes("structural inspections")) {
                    enhancedRec =
                      "<strong>Regular Inspections:</strong> Schedule periodic structural inspections by certified engineers during construction phases. This ensures safety compliance and early detection of potential issues."
                  } else if (item.includes("solar panels")) {
                    enhancedRec =
                      "<strong>Solar Energy Installation:</strong> Install rooftop solar panels to reduce electricity costs and meet Karnataka's renewable energy mandates. Consider 1KW per 100 sq.ft of built-up area as per state guidelines."
                  } else if (item.includes("rainwater harvesting")) {
                    enhancedRec =
                      "<strong>Rainwater Harvesting:</strong> Mandatory for plots above 2400 sq.ft. Install proper collection, filtration, and storage systems. This helps recharge groundwater and reduces water bills significantly."
                  }
                  return `<div class="list-item">• ${enhancedRec}</div>`
                })
                .join("")}
              
              <div class="list-item">• <strong>BBMP Approval Process:</strong> Submit revised plans to BBMP for approval if any violations exist. Ensure all documents are complete including structural drawings, soil test reports, and environmental clearances to avoid delays.</div>
              <div class="list-item">• <strong>Legal Compliance:</strong> Obtain all necessary permits including building permit, occupancy certificate, and environmental clearances as applicable for your project type and size.</div>
              <div class="list-item">• <strong>Professional Consultation:</strong> Engage certified architects and structural engineers familiar with BBMP regulations to ensure full compliance and optimal design solutions.</div>
            </div>

            <div class="section">
              <div class="section-title">Regulatory References</div>
              ${safeData.references.map((item) => `<div class="list-item">• ${item}</div>`).join("")}
            </div>

            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p><strong>This report is generated by the BBMP Building Plan Compliance System</strong></p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>Report ID: ${safeData.reportId}</p>
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()

        // Wait a moment for content to load, then print
        setTimeout(() => {
          if (printWindow) {
            printWindow.print()
          }
        }, 500)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Safe access to data with fallbacks - ensure all arrays exist
  const safeData = {
    projectName: actualProjectName,
    reportId: data?.reportId || "N/A",
    date: data?.date || new Date().toLocaleDateString(),
    projectDetails: {
      plotArea: data?.projectDetails?.plotArea || 0,
      buildingType: data?.projectDetails?.buildingType || "N/A",
      zoneType: data?.projectDetails?.zoneType || "N/A",
      buildingHeight: data?.projectDetails?.buildingHeight || 0,
      numFloors: data?.projectDetails?.numFloors || "N/A",
      builtUpArea: data?.projectDetails?.builtUpArea || 0,
    },
    setbacks: {
      front: data?.setbacks?.front || { provided: 0, required: 0, status: "unknown" },
      rear: data?.setbacks?.rear || { provided: 0, required: 0, status: "unknown" },
      side1: data?.setbacks?.side1 || { provided: 0, required: 0, status: "unknown" },
      side2: data?.setbacks?.side2 || { provided: 0, required: 0, status: "unknown" },
    },
    compliance: {
      overall: data?.compliance?.overall || "unknown",
      compliantItems: Array.isArray(data?.compliance?.compliantItems) ? data.compliance.compliantItems : [],
      warnings: Array.isArray(data?.compliance?.warnings) ? data.compliance.warnings : [],
      violations: Array.isArray(data?.compliance?.violations) ? data.compliance.violations : [],
    },
    features: {
      basement: data?.features?.basement || false,
      lift: data?.features?.lift || false,
      parking: {
        car: data?.features?.parking?.car || 0,
        twoWheeler: data?.features?.parking?.twoWheeler || 0,
      },
      environmental: {
        rainwaterHarvesting: data?.features?.environmental?.rainwaterHarvesting || false,
        solarPanels: data?.features?.environmental?.solarPanels || false,
        stp: data?.features?.environmental?.stp || false,
      },
    },
    recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
    references: Array.isArray(data?.references) ? data.references : [],
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Compliance Report</h2>
        <Button onClick={generatePDF} disabled={isGeneratingPDF} className="bg-blue-600 hover:bg-blue-700">
          {isGeneratingPDF ? (
            <>
              <FileText className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>

      <div id="compliance-report-content" className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center bg-blue-50">
            <CardTitle className="text-xl text-white">BRUHAT BENGALURU MAHANAGARA PALIKE (BBMP)</CardTitle>
            <p className="text-lg font-semibold text-white">Building Plan Compliance Report</p>
            <p className="text-md font-medium text-blue-100 mt-1">Project: {actualProjectName}</p>
            <div className="flex justify-center gap-8 text-sm text-gray-600 mt-2">
              <span>
                <strong>Report ID:</strong> {safeData.reportId}
              </span>
              <span>
                <strong>Date:</strong> {safeData.date}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-white">Plot Area:</span>
                  <span className="text-gray-900">{safeData.projectDetails.plotArea || "N/A"} sq.m</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-white">Building Type:</span>
                  <span className="text-gray-900 capitalize">{safeData.projectDetails.buildingType || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-white">Zone Type:</span>
                  <span className="text-gray-900">{safeData.projectDetails.zoneType || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-white">Building Height:</span>
                  <span className="text-gray-900">{safeData.projectDetails.buildingHeight || "N/A"}m</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-white">Number of Floors:</span>
                  <span className="text-gray-900">{safeData.projectDetails.numFloors || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-white">Built-up Area:</span>
                  <span className="text-gray-900">{safeData.projectDetails.builtUpArea || "N/A"} sq.m</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Overall Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {getStatusIcon(safeData.compliance.overall)}
              {getStatusBadge(safeData.compliance.overall)}
              <span className="text-lg font-semibold text-gray-900">
                {(safeData.compliance.overall || "UNKNOWN").toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Setback Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Setback Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">Setback</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">
                      Required (m)
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">
                      Provided (m)
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(safeData.setbacks).map(([key, setback]) => (
                    <tr key={key}>
                      <td className="border border-gray-200 px-4 py-2 font-medium text-gray-900 capitalize">
                        {key === "side1" ? "Side 1" : key === "side2" ? "Side 2" : key}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-gray-700">{setback?.required || "N/A"}</td>
                      <td className="border border-gray-200 px-4 py-2 text-gray-700">{setback?.provided || "N/A"}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(setback?.status)}
                          {getStatusBadge(setback?.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Compliant Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Compliant Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {safeData.compliance.compliantItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Warnings */}
          {safeData.compliance.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeData.compliance.warnings.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Violations */}
          {safeData.compliance.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeData.compliance.violations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Building Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Building Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Structural Features</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Basement:</span>
                    <span className={`font-medium ${safeData.features.basement ? "text-green-600" : "text-gray-500"}`}>
                      {safeData.features.basement ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Lift:</span>
                    <span className={`font-medium ${safeData.features.lift ? "text-green-600" : "text-gray-500"}`}>
                      {safeData.features.lift ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Car Parking:</span>
                    <span className="font-medium text-gray-900">{safeData.features.parking?.car || 0} spaces</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Two-Wheeler Parking:</span>
                    <span className="font-medium text-gray-900">
                      {safeData.features.parking?.twoWheeler || 0} spaces
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Environmental Features</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Rainwater Harvesting:</span>
                    <span
                      className={`font-medium ${safeData.features.environmental?.rainwaterHarvesting ? "text-green-600" : "text-gray-500"}`}
                    >
                      {safeData.features.environmental?.rainwaterHarvesting ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">Solar Panels:</span>
                    <span
                      className={`font-medium ${safeData.features.environmental?.solarPanels ? "text-green-600" : "text-gray-500"}`}
                    >
                      {safeData.features.environmental?.solarPanels ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-700">STP Installed:</span>
                    <span
                      className={`font-medium ${safeData.features.environmental?.stp ? "text-green-600" : "text-gray-500"}`}
                    >
                      {safeData.features.environmental?.stp ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safeData.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Regulatory References */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Regulatory References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safeData.references.map((reference, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  {reference}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gray-50">
          <CardContent className="text-center py-4">
            <p className="text-sm text-gray-600">
              This report is generated by the BBMP Building Plan Compliance System
            </p>
            <p className="text-xs text-gray-500 mt-1">Generated on: {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
