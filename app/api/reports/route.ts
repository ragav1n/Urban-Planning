import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error:", userError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      console.error("No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("Fetching reports for user:", user.id)

    // Fetch user's reports
    const { data: reports, error } = await supabase
      .from("compliance_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error fetching reports:", error)
      return NextResponse.json({ error: "Failed to fetch reports", details: error.message }, { status: 500 })
    }

    console.log("Found reports:", reports?.length || 0)
    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error("Unexpected error in reports GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User error:", userError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      console.error("No user found")
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { projectName, formData, complianceResult } = body

    // Validate required fields
    if (!projectName || !formData || !complianceResult) {
      return NextResponse.json(
        {
          error: "Missing required data",
          details: {
            projectName: !!projectName,
            formData: !!formData,
            complianceResult: !!complianceResult,
          },
        },
        { status: 400 },
      )
    }

    // Calculate plot area in square meters
    const plotAreaSqM = (formData.plotLength * formData.plotBreadth * 0.092903).toFixed(2)

    // Prepare the data for insertion matching your table structure
    const reportData = {
      user_id: user.id,
      project_name: projectName,
      zone_type: formData.zoneType,
      plot_length: formData.plotLength,
      plot_breadth: formData.plotBreadth,
      plot_area: Number.parseFloat(plotAreaSqM),
      road_width: formData.roadWidth,
      num_floors: formData.numFloors,
      building_height: formData.buildingHeight,
      proposed_use: formData.proposedUse,
      built_up_area: formData.builtUpArea,
      setback_front: formData.setbackFront,
      setback_rear: formData.setbackRear,
      setback_side1: formData.setbackSide1,
      setback_side2: formData.setbackSide2,
      basement_provided: formData.basementProvided,
      basement_usage: formData.basementUsage || null,
      lift_provided: formData.liftProvided,
      car_parking_spaces: formData.carParkingSpaces,
      twowheeler_parking_spaces: formData.twowheelerParkingSpaces,
      rainwater_harvesting: formData.rainwaterHarvesting,
      solar_panels: formData.solarPanels,
      stp_installed: formData.stpInstalled,
      status: complianceResult.compliance?.overall || "pending",
      violations: complianceResult.compliance?.violations || [],
      recommendations: complianceResult.compliance?.recommendations || [],
    }

    console.log("Attempting to save report for user:", user.id)

    // Save the report to Supabase
    const { data: report, error } = await supabase.from("compliance_reports").insert(reportData).select().single()

    if (error) {
      console.error("Database error saving report:", error)
      return NextResponse.json(
        {
          error: "Failed to save report",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 },
      )
    }

    console.log("Report saved successfully:", report.id)
    return NextResponse.json({ report, success: true })
  } catch (error) {
    console.error("Unexpected error in reports POST:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
