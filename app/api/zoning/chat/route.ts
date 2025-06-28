import { NextResponse } from "next/server"

interface Ward {
  ward_no: number
  ward_name: string
  population: number
  area_sqkm: number
}

interface AnalysisResult {
  overall_assessment: string
  zone_viability: string
  population_analysis: string
  infrastructure_implications: string
  administrative_efficiency: string
  development_opportunities: string
  challenges: string
  recommendations: string[]
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: Request) {
  try {
    const { message, selectedWards, analysisResult, chatHistory } = await request.json()

    if (!message || !selectedWards || !analysisResult) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate contextual response based on the message and zone data
    const response = generateChatResponse(message, selectedWards, analysisResult, chatHistory)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Chat failed" }, { status: 500 })
  }
}

function generateChatResponse(
  message: string,
  selectedWards: Ward[],
  analysisResult: AnalysisResult,
  chatHistory: Message[],
): string {
  const totalPopulation = selectedWards.reduce((sum, ward) => sum + ward.population, 0)
  const totalArea = selectedWards.reduce((sum, ward) => sum + ward.area_sqkm, 0)
  const averageDensity = Math.round(totalPopulation / totalArea)
  const wardCount = selectedWards.length

  const messageLower = message.toLowerCase()

  // Population-related questions
  if (messageLower.includes("population") || messageLower.includes("people") || messageLower.includes("residents")) {
    return `Your selected zone has a total population of ${totalPopulation.toLocaleString()} residents across ${wardCount} wards. This gives an average of ${Math.round(totalPopulation / wardCount).toLocaleString()} people per ward.

The population density is ${averageDensity}/km², which is ${averageDensity > 20000 ? "very high and requires careful infrastructure planning" : averageDensity > 10000 ? "moderate and suitable for urban development" : "relatively low with room for growth"}.

${selectedWards.length > 1 ? `The most populous ward is ${selectedWards.reduce((max, ward) => (ward.population > max.population ? ward : max)).ward_name} with ${selectedWards.reduce((max, ward) => (ward.population > max.population ? ward : max)).population.toLocaleString()} residents.` : ""}

Would you like me to explain how this population distribution affects your development plans?`
  }

  // Infrastructure questions
  if (
    messageLower.includes("infrastructure") ||
    messageLower.includes("transport") ||
    messageLower.includes("utilities")
  ) {
    return `Based on your zone's characteristics, here are the key infrastructure considerations:

**Priority Infrastructure Needs:**
${averageDensity > 15000 ? "• High-capacity public transportation (metro/BRT)\n• Multi-level parking facilities\n• Advanced waste management systems" : "• Improved road connectivity\n• Reliable power and water supply\n• Community facilities and parks"}

**Estimated Investment:** ₹${Math.round((totalPopulation * 12) / 1000)} crores over ${wardCount <= 3 ? "3-4" : "5-6"} years

**Implementation Strategy:**
${wardCount > 5 ? "• Phase-wise development across ward clusters\n• Unified infrastructure planning committee\n• Digital coordination systems" : "• Integrated development approach\n• Direct ward coordination\n• Streamlined approval processes"}

The analysis shows: "${analysisResult.infrastructure_implications}"

What specific infrastructure aspect would you like me to elaborate on?`
  }

  // Cost and budget questions
  if (
    messageLower.includes("cost") ||
    messageLower.includes("budget") ||
    messageLower.includes("money") ||
    messageLower.includes("investment")
  ) {
    const estimatedCost = Math.round((totalPopulation * 12) / 1000)
    return `Here's a detailed cost breakdown for your ${wardCount}-ward zone:

**Total Estimated Investment:** ₹${estimatedCost} crores

**Cost Distribution:**
• Infrastructure: ₹${Math.round(estimatedCost * 0.6)} crores (60%)
• Administrative setup: ₹${Math.round(estimatedCost * 0.15)} crores (15%)
• Community facilities: ₹${Math.round(estimatedCost * 0.15)} crores (15%)
• Contingency: ₹${Math.round(estimatedCost * 0.1)} crores (10%)

**Funding Sources:**
• Central government schemes: 40-50%
• State government allocation: 30-35%
• Local body contribution: 15-20%
• Private partnerships: 5-10%

**Timeline:** ${wardCount <= 3 ? "3-4" : wardCount <= 6 ? "4-5" : "5-7"} years for complete implementation

The cost per resident works out to approximately ₹${Math.round((estimatedCost * 100000) / totalPopulation).toLocaleString()}, which is ${(estimatedCost / totalPopulation) * 100000 < 15000 ? "very reasonable" : "moderate"} for comprehensive urban development.

Would you like me to break down costs for any specific infrastructure component?`
  }

  // Timeline and implementation questions
  if (
    messageLower.includes("time") ||
    messageLower.includes("when") ||
    messageLower.includes("schedule") ||
    messageLower.includes("implementation")
  ) {
    return `Here's a realistic implementation timeline for your zone:

**Phase 1 (Year 1-2): Planning & Setup**
• Detailed project reports and surveys
• Administrative structure establishment
• Community consultations and approvals
• Initial infrastructure groundwork

**Phase 2 (Year 2-${wardCount <= 3 ? "3" : "4"}): Core Infrastructure**
• Major transportation projects
• Utility network upgrades
• Essential service facilities
• ${wardCount > 5 ? "Inter-ward connectivity projects" : "Local connectivity improvements"}

**Phase 3 (Year ${wardCount <= 3 ? "3" : "4"}-${wardCount <= 3 ? "4" : wardCount <= 6 ? "5" : "6"}): Development & Services**
• Community facilities and parks
• Commercial area development
• Service delivery optimization
• Quality improvements

**Phase 4 (Final year): Completion & Handover**
• Final inspections and certifications
• System integration and testing
• Community training and handover
• Performance monitoring setup

**Key Milestones:**
${wardCount > 5 ? "• Multi-ward coordination committee by Month 6\n• First phase infrastructure by Year 2\n• Inter-ward connectivity by Year 3" : "• Planning approval by Month 6\n• Infrastructure start by Year 1\n• Service delivery by Year 2"}

The timeline accounts for ${wardCount > 5 ? "complex multi-ward coordination" : "streamlined single-zone development"} and ${averageDensity > 15000 ? "high-density challenges" : "standard development processes"}.

What specific phase would you like me to detail further?`
  }

  // Challenges and problems
  if (
    messageLower.includes("challenge") ||
    messageLower.includes("problem") ||
    messageLower.includes("difficult") ||
    messageLower.includes("issue")
  ) {
    return `Based on your zone configuration, here are the main challenges and mitigation strategies:

**Primary Challenges:**
${analysisResult.challenges}

**Specific Risk Factors:**
${wardCount > 5 ? "• Coordination complexity across multiple wards\n• Varied development priorities\n• Resource allocation disputes" : "• Limited administrative capacity\n• Focused resource requirements\n• Single-point-of-failure risks"}

${averageDensity > 20000 ? "• High population density management\n• Traffic congestion and parking\n• Utility overload risks" : "• Ensuring cost-effective service delivery\n• Maintaining development momentum\n• Avoiding under-utilization"}

**Mitigation Strategies:**
• Early stakeholder engagement and consensus building
• Phased implementation to manage complexity
• Regular monitoring and adaptive planning
• Technology-enabled coordination systems
• Professional project management support

**Success Factors:**
• Strong political and administrative support
• Community buy-in and participation
• Adequate funding and resource allocation
• Experienced implementation partners

The key is to ${wardCount > 5 ? "establish strong coordination mechanisms early" : "maintain focus and avoid scope creep"} while ensuring ${averageDensity > 15000 ? "infrastructure can handle the population load" : "development remains economically viable"}.

Which specific challenge would you like me to address in more detail?`
  }

  // Recommendations and suggestions
  if (
    messageLower.includes("recommend") ||
    messageLower.includes("suggest") ||
    messageLower.includes("advice") ||
    messageLower.includes("should")
  ) {
    return `Based on your zone analysis, here are my key recommendations:

**Immediate Actions (Next 3 months):**
• Establish ${wardCount > 3 ? "joint development committee" : "dedicated project team"}
• Conduct detailed feasibility studies
• Begin community consultation process
• Secure initial funding approvals

**Priority Recommendations:**
${analysisResult.recommendations
  .slice(0, 3)
  .map((rec, index) => `${index + 1}. ${rec}`)
  .join("\n")}

**Strategic Focus Areas:**
${averageDensity > 15000 ? "• Transportation and mobility solutions\n• High-density housing and mixed-use development\n• Advanced utility and waste management" : "• Sustainable growth planning\n• Community facility development\n• Economic development initiatives"}

**Success Metrics to Track:**
• Infrastructure completion rates
• Service delivery improvements
• Community satisfaction scores
• Economic development indicators
• Environmental compliance metrics

**Best Practices:**
• Regular stakeholder meetings and updates
• Transparent progress reporting
• Adaptive planning based on feedback
• Technology integration for efficiency
• Sustainability focus throughout

The analysis shows your zone has ${analysisResult.zone_viability.includes("good") || analysisResult.zone_viability.includes("excellent") ? "strong potential" : "moderate potential"} for successful development.

Would you like me to elaborate on any specific recommendation or discuss implementation strategies?`
  }

  // Comparison questions
  if (
    messageLower.includes("compare") ||
    messageLower.includes("better") ||
    messageLower.includes("versus") ||
    messageLower.includes("alternative")
  ) {
    return `Let me help you understand how your current zone configuration compares:

**Your Zone Profile:**
• ${wardCount} wards, ${totalPopulation.toLocaleString()} residents
• ${averageDensity}/km² density
• ${totalArea.toFixed(1)} km² total area

**Comparison Benchmarks:**
${wardCount <= 3 ? "**Small Zone (1-3 wards):**\n✅ Easier coordination and management\n✅ Faster decision-making\n❌ Limited resource pooling\n❌ Reduced economies of scale" : wardCount <= 6 ? "**Medium Zone (4-6 wards):**\n✅ Good balance of scale and manageability\n✅ Reasonable coordination complexity\n✅ Adequate resource pooling\n❌ Moderate administrative overhead" : "**Large Zone (7+ wards):**\n✅ Excellent economies of scale\n✅ Comprehensive development potential\n❌ Complex coordination requirements\n❌ Higher administrative overhead"}

**Density Comparison:**
${averageDensity > 20000 ? "Your high-density zone (20,000+/km²) offers:\n• Excellent public transport viability\n• High commercial potential\n• Infrastructure efficiency\n• But requires careful traffic management" : averageDensity > 10000 ? "Your medium-density zone (10,000-20,000/km²) provides:\n• Balanced development opportunities\n• Good infrastructure economics\n• Manageable service delivery\n• Sustainable growth potential" : "Your lower-density zone (<10,000/km²) enables:\n• Planned expansion opportunities\n• Green development focus\n• Community-centered design\n• But may face service delivery costs"}

**Alternative Configurations:**
${wardCount > 1 ? `• Smaller sub-zones of ${Math.ceil(wardCount / 2)} wards each\n• Single-ward focused development\n• Larger regional zone including adjacent areas` : "• Multi-ward zone for better resource pooling\n• Regional development approach\n• Specialized single-ward focus"}

Your current configuration scores ${Math.min(95, Math.max(60, 85 - wardCount * 2 + (totalPopulation > 100000 ? 10 : 0)))}/100 on our viability index.

What specific aspect would you like me to compare in more detail?`
  }

  // General questions or unclear intent
  return `I understand you're asking about "${message}". Let me provide some relevant insights about your ${wardCount}-ward zone:

**Zone Overview:**
Your selected zone covers ${totalArea.toFixed(1)} km² with ${totalPopulation.toLocaleString()} residents across these wards: ${selectedWards.map((w) => `Ward ${w.ward_no} (${w.ward_name})`).join(", ")}.

**Key Insights:**
• Population density: ${averageDensity}/km² (${averageDensity > 15000 ? "High" : averageDensity > 8000 ? "Medium" : "Low"})
• Development potential: ${analysisResult.zone_viability.includes("excellent") ? "Excellent" : analysisResult.zone_viability.includes("good") ? "Good" : "Moderate"}
• Infrastructure needs: ${averageDensity > 15000 ? "Substantial" : "Moderate"}
• Administrative complexity: ${wardCount > 5 ? "High" : wardCount > 2 ? "Medium" : "Low"}

**I can help you with:**
• Population and demographic analysis
• Infrastructure planning and costs
• Implementation timelines and phases
• Challenge identification and solutions
• Recommendations and best practices
• Comparisons with alternative configurations

**Quick Stats:**
• Estimated cost: ₹${Math.round((totalPopulation * 12) / 1000)} crores
• Timeline: ${wardCount <= 3 ? "3-4" : wardCount <= 6 ? "4-5" : "5-7"} years
• Priority score: ${Math.min(95, Math.max(60, 85 - wardCount * 2 + (totalPopulation > 100000 ? 10 : 0)))}/100

What specific aspect of your zone would you like to explore further? You can ask about costs, timelines, challenges, infrastructure, or any other planning aspect.`
}
