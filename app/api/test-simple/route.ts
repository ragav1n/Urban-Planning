import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Simple test endpoint called")

    return NextResponse.json({
      success: true,
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      },
    })
  } catch (error) {
    console.error("❌ Test endpoint error:", error)
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Simple POST test endpoint called")

    const body = await request.json()
    console.log("📦 Received data:", body)

    return NextResponse.json({
      success: true,
      message: "POST test successful",
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ POST test error:", error)
    return NextResponse.json(
      { error: "POST test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
