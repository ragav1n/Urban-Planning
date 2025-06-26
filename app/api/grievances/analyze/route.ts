import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting image analysis...")

    // Check for API keys
    const imgbbApiKey = process.env.IMGBB_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!imgbbApiKey || !openaiApiKey) {
      console.error("Missing API keys:", {
        imgbb: !!imgbbApiKey,
        openai: !!openaiApiKey,
      })
      return NextResponse.json({ error: "API keys not configured" }, { status: 500 })
    }

    console.log("API keys found, processing image...")

    // Get the uploaded image
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      console.error("No image provided")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("Image received:", image.name, image.size, "bytes")

    // Upload image to ImgBB
    console.log("Uploading to ImgBB...")
    const imgbbFormData = new FormData()
    imgbbFormData.append("image", image)

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: "POST",
      body: imgbbFormData,
    })

    console.log("ImgBB response status:", imgbbResponse.status)

    if (!imgbbResponse.ok) {
      const errorText = await imgbbResponse.text()
      console.error("ImgBB error:", errorText)
      throw new Error("Failed to upload image to ImgBB")
    }

    const imgbbData = await imgbbResponse.json()
    const imageUrl = imgbbData.data.url

    console.log("Image uploaded successfully:", imageUrl)

    // Analyze image with OpenAI
    console.log("Analyzing image with OpenAI...")

    const categories = [
      "Pothole",
      "Accident",
      "Garbage",
      "Flooding",
      "Streetlight",
      "Construction Debris",
      "Broken Footpath",
      "Fire",
      "Fallen Tree",
      "Other",
    ]

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an assistant that classifies public grievance images.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Classify this image into one of the following categories: ${categories.join(
                  ", ",
                )}. Respond with only the category name.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 50,
      }),
    })

    console.log("OpenAI response status:", openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI error:", errorText)
      throw new Error("Failed to analyze image with OpenAI")
    }

    const openaiData = await openaiResponse.json()
    const category = openaiData.choices[0].message.content.trim()

    console.log("Image classified as:", category)

    return NextResponse.json({
      category,
      image_url: imageUrl,
    })
  } catch (error) {
    console.error("Error in analyze route:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
