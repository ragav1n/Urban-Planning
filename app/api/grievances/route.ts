import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting grievance save...")

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    console.log("User authenticated:", user.id)

    const body = await request.json()
    console.log("Request body:", body)

    const { image_url, description, pin_code, date_observed, category } = body

    // Validate required fields
    if (!image_url || !pin_code || !date_observed || !category) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Inserting into database...")

    const { data, error } = await supabase
      .from("grievances")
      .insert({
        user_id: user.id,
        image_url,
        description: description || null,
        pin_code,
        date_observed,
        category,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save grievance" }, { status: 500 })
    }

    console.log("Grievance saved successfully:", data)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in grievances route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("grievances")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch grievances" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in grievances GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
