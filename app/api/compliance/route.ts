import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { formData } = requestData

    // Validate required fields
    if (!formData) {
      return NextResponse.json({ error: "Form data is required" }, { status: 400 })
    }

    const {
      zoneType,
      plotLength,
      plotBreadth,
      roadWidth,
      numFloors,
      buildingHeight,
      proposedUse,
      builtUpArea,
      setbackFront,
      setbackRear,
      setbackSide1,
      setbackSide2,
      basementProvided,
      basementUsage,
      liftProvided,
      carParkingSpaces,
      twowheelerParkingSpaces,
      rainwaterHarvesting,
      solarPanels,
      stpInstalled,
    } = formData

    // Calculate plot area from length and breadth (convert feet to meters)
    const plotLengthNum = Number.parseFloat(plotLength) || 0
    const plotBreadthNum = Number.parseFloat(plotBreadth) || 0
    const plotAreaInMeters = plotLengthNum * plotBreadthNum * 0.3048 * 0.3048

    // Parse numeric values
    const buildingHeightNum = Number.parseFloat(buildingHeight) || 0
    const builtUpAreaNum = Number.parseFloat(builtUpArea) || 0
    const frontSetbackNum = Number.parseFloat(setbackFront) || 0
    const rearSetbackNum = Number.parseFloat(setbackRear) || 0
    const side1SetbackNum = Number.parseFloat(setbackSide1) || 0
    const side2SetbackNum = Number.parseFloat(setbackSide2) || 0

    // BBMP Compliance Rules
    const requiredSetbacks = {
      front: 3.0,
      rear: 2.0,
      side1: 1.5,
      side2: 1.5,
    }

    // Check setback compliance
    const setbackCompliance = {
      front: {
        provided: frontSetbackNum,
        required: requiredSetbacks.front,
        status: frontSetbackNum >= requiredSetbacks.front ? "compliant" : "violation",
      },
      rear: {
        provided: rearSetbackNum,
        required: requiredSetbacks.rear,
        status: rearSetbackNum >= requiredSetbacks.rear ? "compliant" : "violation",
      },
      side1: {
        provided: side1SetbackNum,
        required: requiredSetbacks.side1,
        status: side1SetbackNum >= requiredSetbacks.side1 ? "compliant" : "violation",
      },
      side2: {
        provided: side2SetbackNum,
        required: requiredSetbacks.side2,
        status: side2SetbackNum >= requiredSetbacks.side2 ? "compliant" : "violation",
      },
    }

    // Collect violations
    const violations = []
    if (frontSetbackNum < requiredSetbacks.front) {
      violations.push(`Front setback insufficient: ${frontSetbackNum}m provided, ${requiredSetbacks.front}m required`)
    }
    if (rearSetbackNum < requiredSetbacks.rear) {
      violations.push(`Rear setback insufficient: ${rearSetbackNum}m provided, ${requiredSetbacks.rear}m required`)
    }
    if (side1SetbackNum < requiredSetbacks.side1) {
      violations.push(`Side 1 setback insufficient: ${side1SetbackNum}m provided, ${requiredSetbacks.side1}m required`)
    }
    if (side2SetbackNum < requiredSetbacks.side2) {
      violations.push(`Side 2 setback insufficient: ${side2SetbackNum}m provided, ${requiredSetbacks.side2}m required`)
    }

    // Determine overall compliance
    const overallStatus = violations.length > 0 ? "non-compliant" : "compliant"

    // Generate compliant items
    const compliantItems = []
    if (buildingHeightNum <= 15) compliantItems.push("Building height within permissible limits")
    if (plotAreaInMeters >= 100) compliantItems.push("Plot area meets minimum requirements")
    if (Number.parseInt(carParkingSpaces) >= 1) compliantItems.push("Adequate car parking provided")
    if (rainwaterHarvesting || solarPanels || stpInstalled) compliantItems.push("Environmental features included")
    if (frontSetbackNum >= requiredSetbacks.front) compliantItems.push("Front setback compliant")
    if (rearSetbackNum >= requiredSetbacks.rear) compliantItems.push("Rear setback compliant")
    if (side1SetbackNum >= requiredSetbacks.side1) compliantItems.push("Side 1 setback compliant")
    if (side2SetbackNum >= requiredSetbacks.side2) compliantItems.push("Side 2 setback compliant")

    // Generate warnings
    const warnings = []
    if (buildingHeightNum > 12) warnings.push("Verify structural stability calculations for height > 12m")
    if (numFloors && numFloors.includes("+") && Number.parseInt(numFloors.split("+")[1]) >= 2) {
      warnings.push("Ensure fire safety compliance for multi-story buildings")
    }
    if (plotAreaInMeters < 200) warnings.push("Consider optimizing space utilization for small plots")
    if (!rainwaterHarvesting) warnings.push("Rainwater harvesting recommended for environmental compliance")

    // Generate recommendations
    const recommendations = [
      "Ensure all construction follows approved building plans",
      "Implement proper waste management systems",
      "Consider green building practices for sustainability",
      "Regular structural inspections during construction",
    ]

    if (violations.length > 0) {
      recommendations.unshift("Address all setback violations before proceeding with construction")
    }
    if (!solarPanels) {
      recommendations.push("Consider installing solar panels for energy efficiency")
    }

    const complianceResult = {
      reportId: `BBMP-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      projectDetails: {
        plotArea: Math.round(plotAreaInMeters * 100) / 100,
        buildingType: proposedUse?.toLowerCase() || "residential",
        zoneType: zoneType || "R1",
        buildingHeight: buildingHeightNum,
        numFloors: numFloors || "G+1",
        builtUpArea: builtUpAreaNum,
      },
      setbacks: setbackCompliance,
      compliance: {
        overall: overallStatus,
        compliantItems,
        warnings,
        violations,
      },
      features: {
        basement: basementProvided === true,
        lift: liftProvided === true,
        parking: {
          car: Number.parseInt(carParkingSpaces) || 0,
          twoWheeler: Number.parseInt(twowheelerParkingSpaces) || 0,
        },
        environmental: {
          rainwaterHarvesting: rainwaterHarvesting === true,
          solarPanels: solarPanels === true,
          stp: stpInstalled === true,
        },
      },
      recommendations,
      references: [
        "BBMP Building Bye-laws 2020 - Section 4.2 (Setbacks)",
        "National Building Code 2016 - Part 3 (Development Control)",
        "Karnataka Municipal Corporation Act - Schedule II",
        "BBMP Zoning Regulations - R1 Zone Requirements",
        "Karnataka Fire Force Act - Fire Safety Requirements",
      ],
    }

    return NextResponse.json(complianceResult)
  } catch (error) {
    console.error("Error in compliance API:", error)
    return NextResponse.json({ error: "Failed to process compliance check", details: error.message }, { status: 500 })
  }
}
