import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient, createSupabaseClientWithAuth } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== COMPLIANCE TEST API CALLED ===")

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    const authToken = authHeader?.replace("Bearer ", "")

    console.log("Auth header:", {
      hasAuthHeader: !!authHeader,
      hasToken: !!authToken,
      tokenLength: authToken?.length || 0,
    })

    let supabase
    let currentUser = null

    if (authToken) {
      // Method 1: Use client with auth token
      console.log("Trying auth token method...")
      supabase = createSupabaseClientWithAuth(authToken)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(authToken)

      console.log("Auth token method result:", {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userError: userError?.message,
      })

      if (user) {
        currentUser = user
      }
    }

    if (!currentUser) {
      // Method 2: Try cookie-based auth
      console.log("Trying cookie method...")
      const cookieSupabase = createServerSupabaseClient()

      const {
        data: { session },
        error: sessionError,
      } = await cookieSupabase.auth.getSession()

      console.log("Cookie method result:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        sessionError: sessionError?.message,
      })

      if (session?.user) {
        currentUser = session.user
        supabase = cookieSupabase
      }
    }

    if (!currentUser) {
      console.error("No user found with any method")
      return NextResponse.json(
        {
          error: "Not authenticated",
          details: {
            hasAuthHeader: !!authHeader,
            hasToken: !!authToken,
            message: "Unable to authenticate user with provided credentials",
          },
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    console.log("Request body received:", {
      hasComplianceData: !!body.complianceData,
      hasFormData: !!body.formData,
    })

    // Return a simple test response
    const testResult = `
✅ COMPLIANCE TEST SUCCESSFUL!

Authentication Details:
- User: ${currentUser.email}
- User ID: ${currentUser.id}
- Auth Method: ${authToken ? "Bearer Token" : "Cookie Session"}

Building Data Received:
- Plot Area: ${body.complianceData?.plot_area || "N/A"} sq.m
- Building Type: ${body.complianceData?.proposed_use || "N/A"}
- Building Height: ${body.complianceData?.building_height || "N/A"}m
- Zone Type: ${body.formData?.zoneType || "N/A"}

✅ API route working correctly!
✅ Authentication successful!
✅ Data received and processed!

Ready for full compliance checking with OpenAI.
    `

    console.log("Returning successful test result")
    return NextResponse.json({
      success: true,
      result: testResult,
    })
  } catch (error: any) {
    console.error("Error in test API:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
